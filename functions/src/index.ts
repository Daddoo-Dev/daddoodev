import { onRequest } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import * as admin from 'firebase-admin';

admin.initializeApp();

const apiKey = defineSecret('YM_API_KEY');

const QUIZZES_COLLECTION = 'quizzes';

type Req = {
  headers: { [key: string]: string | string[] | undefined };
  query?: { api_key?: string };
};

function getApiKey(req: Req): string | null {
  const raw = req.headers['x-api-key'] ?? req.headers['authorization'];
  const fromHeader = Array.isArray(raw) ? raw[0] : raw;
  if (fromHeader) {
    return fromHeader.startsWith('Bearer ') ? fromHeader.slice(7) : fromHeader;
  }
  return req.query?.api_key ?? null;
}

function validateApiKey(req: Req): boolean {
  const key = getApiKey(req);
  return !!key && key === apiKey.value();
}

function parsePath(path: string): { type: 'list' | 'single'; id?: string } | null {
  const match = path.match(/^\/ym\/v2\/quizzes(?:\/([^/]+))?\/?$/);
  if (!match) return null;
  const id = match[1];
  if (id) return { type: 'single', id };
  return { type: 'list' };
}

export const ymApi = onRequest(
  { secrets: [apiKey] },
  async (req, res) => {
    if (req.method !== 'GET') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    if (!validateApiKey(req)) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const pathInfo = parsePath(req.path || req.url?.split('?')[0] || '');
    if (!pathInfo) {
      res.status(404).json({ error: 'Not found' });
      return;
    }

    const db = admin.firestore();

    try {
      if (pathInfo.type === 'list') {
        const snapshot = await db.collection(QUIZZES_COLLECTION).get();
        const quizzes = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title,
            description: data.description,
            categoryId: data.categoryId ?? null,
            lastModified: data.updatedAt?.toMillis?.() ?? doc.updateTime?.toMillis?.() ?? null,
          };
        });
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json({ quizzes });
        return;
      }

      if (pathInfo.type === 'single' && pathInfo.id) {
        const doc = await db.collection(QUIZZES_COLLECTION).doc(pathInfo.id).get();
        if (!doc.exists) {
          res.status(404).json({ error: 'Quiz not found' });
          return;
        }

        const data = doc.data()!;
        const quiz = {
          id: doc.id,
          title: data.title,
          description: data.description,
          categoryId: data.categoryId ?? null,
          questions: data.questions,
          results: data.results,
        };

        const etag = `"${doc.updateTime?.toMillis?.() ?? Date.now()}"`;
        res.setHeader('ETag', etag);

        const clientEtag = req.headers['if-none-match'];
        if (clientEtag && clientEtag === etag) {
          res.status(304).end();
          return;
        }

        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(quiz);
        return;
      }

      res.status(404).json({ error: 'Not found' });
    } catch (err) {
      console.error('ymApi error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);
