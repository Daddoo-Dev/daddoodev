import { onRequest } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';

function yahooSymbol(symbol: string): string {
	return symbol.trim().toUpperCase().replace(/\./g, '-');
}

function parseYahooChart(json: unknown): { closes: number[]; volumes: number[] } | null {
	const root = json as {
		chart?: { result?: Array<Record<string, unknown>> };
	};
	const result = root?.chart?.result?.[0] as
		| {
				indicators?: { quote?: Array<{ close?: number[]; volume?: (number | null)[] }> };
		  }
		| undefined;
	if (!result?.indicators?.quote?.[0]) return null;
	const q = result.indicators.quote[0];
	const close = q.close ?? [];
	const volume = q.volume ?? [];
	const closes: number[] = [];
	const volumes: number[] = [];
	for (let i = 0; i < close.length; i++) {
		const c = close[i];
		if (c == null || Number.isNaN(Number(c))) continue;
		closes.push(Number(c));
		const v = volume[i];
		volumes.push(v == null || Number.isNaN(Number(v)) ? 0 : Number(v));
	}
	if (closes.length === 0) return null;
	while (volumes.length < closes.length) volumes.push(0);
	return { closes, volumes: volumes.slice(0, closes.length) };
}

async function fetchYahooChart(
	symbol: string,
	interval: '1mo' | '1wk'
): Promise<{ closes: number[]; volumes: number[] } | null> {
	const ysym = yahooSymbol(symbol);
	const u = new URL(`https://query1.finance.yahoo.com/v8/finance/chart/${ysym}`);
	u.searchParams.set('range', 'max');
	u.searchParams.set('interval', interval);
	const res = await fetch(u.toString(), {
		headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MarketMinder/1.0)' }
	});
	if (!res.ok) return null;
	const json: unknown = await res.json();
	return parseYahooChart(json);
}

async function verifyBearer(req: { headers?: { authorization?: string } }): Promise<string | null> {
	const raw = req.headers?.authorization;
	if (!raw?.startsWith('Bearer ')) return null;
	const token = raw.slice(7);
	try {
		const decoded = await admin.auth().verifyIdToken(token);
		return decoded.uid;
	} catch {
		return null;
	}
}

/**
 * GET /mm/chart?symbol=MSFT&interval=1mo|1wk — requires Firebase ID token (Authorization: Bearer).
 */
export const mmChart = onRequest(
	{
		cors: true,
		invoker: 'public'
	},
	async (req, res) => {
		if (req.method === 'OPTIONS') {
			res.status(204).send('');
			return;
		}
		if (req.method !== 'GET') {
			res.status(405).json({ error: 'Method not allowed' });
			return;
		}

		const uid = await verifyBearer(req);
		if (!uid) {
			res.status(401).json({ error: 'Unauthorized' });
			return;
		}

		const q = req.query as Record<string, string | string[] | undefined>;
		const symbolRaw = q.symbol;
		const symbol = Array.isArray(symbolRaw) ? symbolRaw[0] : symbolRaw;
		const intervalRaw = q.interval;
		const interval = (Array.isArray(intervalRaw) ? intervalRaw[0] : intervalRaw) ?? '1mo';
		if (!symbol?.trim()) {
			res.status(400).json({ error: 'missing symbol' });
			return;
		}
		if (interval !== '1mo' && interval !== '1wk') {
			res.status(400).json({ error: 'interval must be 1mo or 1wk' });
			return;
		}

		const data = await fetchYahooChart(symbol, interval);
		if (!data) {
			res.status(502).json({ error: 'no data' });
			return;
		}
		res.setHeader('Content-Type', 'application/json');
		res.status(200).json(data);
	}
);
