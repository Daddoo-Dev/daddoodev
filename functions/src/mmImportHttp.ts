/**
 * One-shot HTTP import: POST JSON body into Firestore `users/{uid}` (merge).
 *
 * Setup (once):
 *   firebase functions:secrets:set MM_IMPORT_SECRET
 *   firebase deploy --only functions:mmImport
 *
 * Body shape (same as MarketMinder storage):
 *   { "tickers": string[], "holdings": object, "watchlist": array, "discovery": object|null }
 *
 * Build payload from personalstockmonitor/data (example with jq):
 *   jq -n \
 *     --slurpfile t /path/to/tickers.json \
 *     --slurpfile h /path/to/holdings.json \
 *     --slurpfile w /path/to/watchlist.json \
 *     --slurpfile d /path/to/discovery_results.json \
 *     '{tickers:$t[0],holdings:$h[0],watchlist:$w[0],discovery:(if ($d|length)>0 then $d[0] else null end)}' \
 *     > user-doc.json
 *
 * Invoke:
 *   curl -sS -X POST "https://REGION-PROJECT.cloudfunctions.net/mmImport?uid=YOUR_AUTH_UID" \
 *     -H "Authorization: Bearer YOUR_MM_IMPORT_SECRET" \
 *     -H "Content-Type: application/json" \
 *     -d @user-doc.json
 */
import { onRequest } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import * as admin from 'firebase-admin';

const mmImportSecret = defineSecret('MM_IMPORT_SECRET');

function getBearer(req: { headers: { authorization?: string | string[] } }): string | null {
	const raw = req.headers.authorization;
	const s = Array.isArray(raw) ? raw[0] : raw;
	if (!s?.startsWith('Bearer ')) return null;
	return s.slice(7).trim() || null;
}

function parseBody(raw: unknown): unknown {
	if (raw == null) return null;
	if (typeof raw === 'object') return raw;
	if (typeof raw === 'string') {
		try {
			return JSON.parse(raw) as unknown;
		} catch {
			return null;
		}
	}
	return null;
}

export const mmImport = onRequest(
	{
		secrets: [mmImportSecret],
		cors: false,
		invoker: 'public'
	},
	async (req, res) => {
		if (req.method === 'OPTIONS') {
			res.status(204).send('');
			return;
		}
		if (req.method !== 'POST') {
			res.status(405).json({ error: 'Method not allowed' });
			return;
		}

		const token = getBearer(req);
		if (!token || token !== mmImportSecret.value()) {
			res.status(401).json({ error: 'Unauthorized' });
			return;
		}

		const q = req.query as Record<string, string | string[] | undefined>;
		const uidRaw = q.uid;
		const uid = (Array.isArray(uidRaw) ? uidRaw[0] : uidRaw)?.trim();
		if (!uid) {
			res.status(400).json({ error: 'missing uid query parameter' });
			return;
		}

		const body = parseBody(req.body) as Record<string, unknown> | null;
		if (!body || typeof body !== 'object') {
			res.status(400).json({ error: 'invalid JSON body' });
			return;
		}

		const { tickers, holdings, watchlist, discovery } = body;

		if (!Array.isArray(tickers)) {
			res.status(400).json({ error: 'tickers must be an array' });
			return;
		}
		if (!holdings || typeof holdings !== 'object' || Array.isArray(holdings)) {
			res.status(400).json({ error: 'holdings must be a JSON object' });
			return;
		}
		if (!Array.isArray(watchlist)) {
			res.status(400).json({ error: 'watchlist must be an array' });
			return;
		}
		if (discovery !== null && discovery !== undefined && (typeof discovery !== 'object' || Array.isArray(discovery))) {
			res.status(400).json({ error: 'discovery must be an object or null' });
			return;
		}

		try {
			await admin
				.firestore()
				.doc(`users/${uid}`)
				.set(
					{
						tickers,
						holdings,
						watchlist,
						discovery: discovery === undefined ? null : discovery
					},
					{ merge: true }
				);
			res.setHeader('Content-Type', 'application/json');
			res.status(200).json({ ok: true, path: `users/${uid}` });
		} catch (e) {
			console.error('mmImport error:', e);
			res.status(500).json({ error: 'write failed' });
		}
	}
);
