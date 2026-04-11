/**
 * Dev-only proxy: GET /__marketminder/chart?symbol=MSFT&interval=1mo|1wk
 * Forwards to Yahoo chart API so the browser avoids CORS.
 *
 * Production: set PUBLIC_MARKETMINDER_API_BASE to your Firebase Function URL;
 * it should expose the same path and query shape (returns JSON body below).
 */
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Plugin } from 'vite';

export type MarketminderChartResponse = {
	closes: number[];
	volumes: (number | null)[];
};

function yahooSymbol(symbol: string): string {
	return symbol.trim().toUpperCase().replace(/\./g, '-');
}

function parseYahooChart(json: unknown): MarketminderChartResponse | null {
	const root = json as {
		chart?: { result?: Array<Record<string, unknown>> };
	};
	const result = root?.chart?.result?.[0] as
		| {
				timestamp?: number[];
				indicators?: { quote?: Array<{ close?: number[]; volume?: (number | null)[] }> };
		  }
		| undefined;
	if (!result?.indicators?.quote?.[0]) return null;
	const q = result.indicators.quote[0];
	const close = q.close ?? [];
	const volume = q.volume ?? [];
	const closes: number[] = [];
	const volumes: (number | null)[] = [];
	for (let i = 0; i < close.length; i++) {
		const c = close[i];
		if (c == null || Number.isNaN(Number(c))) continue;
		closes.push(Number(c));
		const v = volume[i];
		volumes.push(v == null || Number.isNaN(Number(v)) ? null : Number(v));
	}
	if (closes.length === 0) return null;
	return { closes, volumes };
}

async function fetchYahooChart(
	symbol: string,
	interval: '1mo' | '1wk'
): Promise<MarketminderChartResponse | null> {
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

export function marketminderDevApi(): Plugin {
	return {
		name: 'marketminder-dev-api',
		configureServer(server) {
			server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next) => {
				const url = req.url ?? '';
				if (!url.startsWith('/__marketminder/chart')) {
					next();
					return;
				}
				try {
					const parsed = new URL(url, 'http://local');
					const symbol = parsed.searchParams.get('symbol');
					const interval = parsed.searchParams.get('interval') ?? '1mo';
					if (!symbol?.trim()) {
						res.statusCode = 400;
						res.setHeader('Content-Type', 'application/json');
						res.end(JSON.stringify({ error: 'missing symbol' }));
						return;
					}
					if (interval !== '1mo' && interval !== '1wk') {
						res.statusCode = 400;
						res.setHeader('Content-Type', 'application/json');
						res.end(JSON.stringify({ error: 'interval must be 1mo or 1wk' }));
						return;
					}
					const data = await fetchYahooChart(symbol, interval);
					if (!data) {
						res.statusCode = 502;
						res.setHeader('Content-Type', 'application/json');
						res.end(JSON.stringify({ error: 'no data' }));
						return;
					}
					res.setHeader('Content-Type', 'application/json');
					res.end(JSON.stringify(data));
				} catch (e) {
					res.statusCode = 500;
					res.setHeader('Content-Type', 'application/json');
					res.end(JSON.stringify({ error: String(e) }));
				}
			});
		}
	};
}
