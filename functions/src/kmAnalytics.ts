import { onRequest } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import type { KmWeeklySnapshot } from './kmAnalyticsParse.js';
import { parseKnightsManagementReport } from './kmAnalyticsParse.js';

const COLLECTION = 'internal';
const DOC_ID = 'km_analytics';

function getRequestText(req: {
	body?: unknown;
	rawBody?: Buffer;
}): string {
	if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
		const r = (req.body as { report?: unknown }).report;
		if (typeof r === 'string') return r;
	}
	if (typeof req.body === 'string') return req.body;
	if (Buffer.isBuffer(req.body)) return req.body.toString('utf8');
	if (req.rawBody && Buffer.isBuffer(req.rawBody)) return req.rawBody.toString('utf8');
	return '';
}

function mergeSnapshot(list: KmWeeklySnapshot[], snapshot: KmWeeklySnapshot): KmWeeklySnapshot[] {
	const idx = list.findIndex((s) => s.week === snapshot.week);
	if (idx >= 0) list[idx] = snapshot;
	else list.push(snapshot);
	list.sort((a, b) => a.week.localeCompare(b.week));
	return list;
}

/**
 * GET/POST /api/km-analytics — Conclavium weekly analytics (Firestore-backed; same schema as Knights Management era).
 * Hosting rewrite maps this path from the SPA origin.
 */
export const kmAnalytics = onRequest(
	{
		cors: true,
		invoker: 'public'
	},
	async (req, res) => {
		if (req.method === 'OPTIONS') {
			res.status(204).send('');
			return;
		}

		const db = admin.firestore();
		const ref = db.collection(COLLECTION).doc(DOC_ID);

		if (req.method === 'GET') {
			try {
				const doc = await ref.get();
				const snapshots: KmWeeklySnapshot[] = doc.exists
					? ((doc.data()?.snapshots as KmWeeklySnapshot[] | undefined) ?? [])
					: [];
				res.setHeader('Content-Type', 'application/json');
				res.setHeader('Cache-Control', 'no-store');
				res.status(200).json({ snapshots });
			} catch (err) {
				console.error('kmAnalytics GET:', err);
				res.status(500).json({ error: 'Failed to load analytics' });
			}
			return;
		}

		if (req.method === 'POST') {
			const text = getRequestText(req);
			if (!text.trim()) {
				res.status(400).json({ error: 'Empty body' });
				return;
			}
			let snapshot: KmWeeklySnapshot;
			try {
				snapshot = parseKnightsManagementReport(text);
			} catch (e) {
				const message = e instanceof Error ? e.message : 'Failed to parse report';
				res.status(400).json({ error: message });
				return;
			}

			try {
				const doc = await ref.get();
				let list: KmWeeklySnapshot[] = doc.exists
					? ((doc.data()?.snapshots as KmWeeklySnapshot[] | undefined) ?? [])
					: [];
				list = mergeSnapshot([...list], snapshot);

				await ref.set(
					{
						snapshots: list,
						updatedAt: admin.firestore.FieldValue.serverTimestamp()
					},
					{ merge: true }
				);

				res.setHeader('Content-Type', 'application/json');
				res.status(200).json(snapshot);
			} catch (err) {
				console.error('kmAnalytics POST:', err);
				res.status(500).json({ error: 'Failed to save analytics' });
			}
			return;
		}

		res.status(405).json({ error: 'Method not allowed' });
	}
);
