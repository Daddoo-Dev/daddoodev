import type { MaSignal, Overbought, TrendBlock } from './types';
import { rollingMean, rollingStd } from './math';

function maSignal(prices: number[], window: number): MaSignal | null {
	if (prices.length < window) return null;
	const ma = rollingMean(prices, window);
	const i = prices.length - 1;
	const latest = prices[i];
	const latestMa = ma[i];
	if (Number.isNaN(latestMa)) return null;
	const signal: 'HOLD' | 'EXIT' = latest > latestMa ? 'HOLD' : 'EXIT';
	const pctAbove = (latest / latestMa - 1) * 100;
	let peak = prices[0];
	for (const p of prices) if (p > peak) peak = p;
	const drawdown = (latest / peak - 1) * 100;
	return {
		price: round2(latest),
		ma: round2(latestMa),
		signal,
		pct_above_ma: round2(pctAbove),
		drawdown_pct: round2(drawdown)
	};
}

function round2(n: number): number {
	return Math.round(n * 100) / 100;
}

function overboughtCheck(prices: number[], window = 10): Overbought | null {
	if (prices.length < window) return null;
	const ma = rollingMean(prices, window);
	const std = rollingStd(prices, window);
	const i = prices.length - 1;
	const latest = prices[i];
	const latestMa = ma[i];
	const latestStd = std[i];
	if (Number.isNaN(latestStd) || latestStd === 0) return null;
	const zScore = (latest - latestMa) / latestStd;
	const upperBand = latestMa + 2 * latestStd;
	let status: Overbought['status'] = 'NORMAL';
	if (zScore >= 2) status = 'OVERBOUGHT';
	else if (zScore >= 1.5) status = 'STRETCHED';
	return {
		z_score: round2(zScore),
		upper_band: round2(upperBand),
		status
	};
}

function compositeSignal(
	short: MaSignal | null,
	medium: MaSignal | null,
	long: MaSignal | null
): string {
	const s = short?.signal ?? null;
	const m = medium?.signal ?? null;
	const l = long?.signal ?? null;
	if (m === null) return 'INSUFFICIENT DATA';
	if (s === 'HOLD' && m === 'HOLD' && l === 'HOLD') return 'STRONG HOLD';
	if (s === 'EXIT' && m === 'EXIT' && l === 'EXIT') return 'EXIT';
	if (l === null) {
		if (m === 'HOLD' && s === 'HOLD') return 'STRONG HOLD';
		if (m === 'EXIT' && s === 'EXIT') return 'EXIT';
		return 'CAUTION';
	}
	if (m === 'HOLD' && l === 'HOLD' && s === 'EXIT') return 'HOLD';
	if (s === 'HOLD' && m === 'EXIT' && l === 'EXIT') return 'EARLY RECOVERY';
	if (m === 'EXIT' && l === 'HOLD') return 'WEAKENING';
	if (m === 'HOLD' && l === 'EXIT') return 'CAUTION';
	return 'CAUTION';
}

export function multiTrend(monthlyPrices: number[], weeklyPrices: number[]): TrendBlock {
	const hasShort = weeklyPrices.length >= 5;
	const hasMedium = monthlyPrices.length >= 10;
	const hasLong = monthlyPrices.length >= 24;
	const short = hasShort ? maSignal(weeklyPrices, 5) : null;
	const medium = hasMedium ? maSignal(monthlyPrices, 10) : null;
	const long = hasLong ? maSignal(monthlyPrices, 24) : null;
	const composite = compositeSignal(short, medium, long);
	let ob: Overbought | null = null;
	if (composite !== 'EXIT' && composite !== 'INSUFFICIENT DATA' && hasMedium) {
		ob = overboughtCheck(monthlyPrices, 10);
	}
	return { short, medium, long, composite, overbought: ob };
}
