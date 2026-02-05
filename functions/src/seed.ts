/**
 * Seed script: loads quiz JSON files from src/quizzes into Firestore.
 *
 * Run from project root:  cd functions && npm run seed
 *
 * CREDENTIALS REQUIRED (do this before running seed):
 *   Option A:  gcloud auth application-default login
 *   Option B:  Download a service account key from Firebase Console
 *              (Project settings → Service accounts → Generate new private key),
 *              save as e.g. functions/daddoodev-sa.json (add to .gitignore),
 *              then:  $env:GOOGLE_APPLICATION_CREDENTIALS="path\to\that.json"
 */
import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

const QUIZZES_COLLECTION = 'quizzes';
const QUIZZES_SOURCE = path.join(__dirname, '../../src/quizzes');

admin.initializeApp({ projectId: process.env.GCLOUD_PROJECT || 'daddoodev' });

interface QuizJson {
  id: string;
  title: string;
  description: string;
  categoryId?: string;
  questions: unknown[];
  results: unknown[];
}

async function seed() {
  const db = admin.firestore();

  if (!fs.existsSync(QUIZZES_SOURCE)) {
    console.error('Quizzes folder not found:', QUIZZES_SOURCE);
    process.exit(1);
  }

  const files = fs.readdirSync(QUIZZES_SOURCE).filter((f) => f.endsWith('.json'));
  console.log(`Found ${files.length} quiz files`);

  for (const file of files) {
    const filePath = path.join(QUIZZES_SOURCE, file);
    const content = fs.readFileSync(filePath, 'utf-8');

    let quiz: QuizJson;
    try {
      quiz = JSON.parse(content) as QuizJson;
    } catch (e) {
      console.error('Invalid JSON:', file, e);
      continue;
    }

    if (!quiz.id || !quiz.title || !quiz.questions || !quiz.results) {
      console.error('Missing required fields in:', file);
      continue;
    }

    const doc = {
      id: quiz.id,
      title: quiz.title,
      description: quiz.description ?? '',
      categoryId: quiz.categoryId ?? null,
      questions: quiz.questions,
      results: quiz.results,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection(QUIZZES_COLLECTION).doc(quiz.id).set(doc);
    console.log('Seeded:', quiz.id);
  }

  console.log('Done.');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
