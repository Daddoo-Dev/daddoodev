import { buyVerdict } from './analysis';
import { loadMonthlySeries, loadWeeklyPack } from './prices';
import { analyzeSymbolSync } from './symbolAnalysis';
import type { DiscoveryResults, DiscoveryRow } from './types';

const VERDICT_WEIGHT: Record<string, number> = { BUY: 100, CONSIDER: 75 };
const COMPOSITE_BONUS: Record<string, number> = {
	'STRONG HOLD': 6,
	HOLD: 4,
	CAUTION: 1,
	'EARLY RECOVERY': 2,
	WEAKENING: 0,
	EXIT: 0,
	'INSUFFICIENT DATA': 0
};

async function sha256hex(s: string): Promise<string> {
	const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
	return Array.from(new Uint8Array(buf))
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');
}

async function orderPool(symbols: string[], daySalt: string): Promise<string[]> {
	const entries = await Promise.all(
		symbols.map(async (sym) => ({
			sym,
			h: await sha256hex(`${daySalt}:${sym}`)
		}))
	);
	entries.sort((a, b) => a.h.localeCompare(b.h));
	return entries.map((e) => e.sym);
}

function rankScore(verdict: string, entry: { score?: number } | null, composite: string): number {
	const w = VERDICT_WEIGHT[verdict] ?? 0;
	const extra = entry && typeof entry.score === 'number' ? entry.score : 0;
	const compBonus = COMPOSITE_BONUS[composite] ?? 0;
	return w * 10 + extra + compBonus;
}

export async function loadSp500List(): Promise<string[]> {
	const res = await fetch('/marketminder/sp500.txt');
	if (!res.ok) return [];
	const text = await res.text();
	return text
		.split(/\r?\n/)
		.map((ln) => ln.trim().toUpperCase().replace(/\./g, '-'))
		.filter(Boolean);
}

export async function runSp500Discovery(
	excluded: Set<string>,
	limit: number,
	maxSharePrice: number | null,
	onProgress?: (done: number, total: number) => void
): Promise<DiscoveryResults> {
	const universe = await loadSp500List();
	const ex = new Set([...excluded].map((s) => s.toUpperCase()));
	const pool = universe.filter((s) => !ex.has(s.toUpperCase()));
	const day = new Date().toISOString().slice(0, 10);
	const ordered = await orderPool(pool, day);
	const lim = Math.max(10, Math.min(limit, 503));
	const take = ordered.slice(0, Math.min(lim, ordered.length));

	const spyMonthly = await loadMonthlySeries('SPY');
	const rows: DiscoveryRow[] = [];
	let done = 0;
	for (const symbol of take) {
		done++;
		onProgress?.(done, take.length);
		let monthly: number[];
		let weekly: { closes: number[]; volumes: number[] };
		try {
			[monthly, weekly] = await Promise.all([
				loadMonthlySeries(symbol),
				loadWeeklyPack(symbol)
			]);
		} catch {
			continue;
		}
		const res = analyzeSymbolSync(symbol, spyMonthly, monthly, weekly);
		if (res.error || !res.trend || !res.analysis) continue;
		const verdict = buyVerdict(res.trend, res.analysis);
		if (verdict.verdict !== 'BUY' && verdict.verdict !== 'CONSIDER') continue;
		const comp = res.trend.composite || '';
		const ent = res.analysis.entry;
		const medium = res.trend.medium;
		const price = medium?.price ?? null;
		if (maxSharePrice != null && price != null && price > maxSharePrice) continue;
		rows.push({
			symbol,
			verdict: verdict.verdict,
			reasons: verdict.reasons,
			rank_score: rankScore(verdict.verdict, ent, comp),
			composite: comp,
			price,
			ma_10mo: medium?.ma ?? null,
			entry: ent
		});
	}
	rows.sort((a, b) => b.rank_score - a.rank_score || a.symbol.localeCompare(b.symbol));
	const now = new Date();
	const pad = (n: number) => String(n).padStart(2, '0');
	const generatedAt = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
	return {
		generated_at: generatedAt,
		universe: 'sp500',
		universe_size: universe.length,
		after_exclusions: pool.length,
		scanned: take.length,
		shortlist: rows.length,
		max_share_price: maxSharePrice,
		results: rows.slice(0, 100)
	};
}
