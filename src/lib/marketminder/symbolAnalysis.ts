import {
	buyVerdict,
	entrySignal,
	momentum,
	relativeStrength,
	volumeConfirmation
} from './analysis';
import { multiTrend } from './trend';
import type { AnalyzedSymbol, BuyVerdict, Holding } from './types';

export function analyzeSymbolSync(symbol: string, spyMonthly: number[], monthly: number[], weekly: {
	closes: number[];
	volumes: number[];
}): AnalyzedSymbol {
	if (monthly.length < 10) {
		return { symbol, error: 'Insufficient price data', trend: null, analysis: null };
	}
	const n = Math.min(weekly.closes.length, weekly.volumes.length);
	const wCloses = weekly.closes.slice(0, n);
	const wVols = weekly.volumes.slice(0, n);
	const trend = multiTrend(monthly, wCloses);
	const rs = relativeStrength(monthly, spyMonthly);
	const vol = volumeConfirmation(wCloses, wVols);
	const mom = momentum(monthly);
	const pctAbove = trend.medium?.pct_above_ma ?? null;
	const ent = entrySignal(trend.composite, trend.overbought, rs, mom, pctAbove);
	const analysis = {
		relative_strength: rs,
		volume: vol,
		momentum: mom,
		entry: ent
	};
	return { symbol, error: null, trend, analysis };
}

export function refreshHolding(holding: Holding, currentPrice: number): Holding {
	if (!holding || holding.quantity <= 0) return holding;
	const qty = holding.quantity;
	const costBasis = holding.cost_basis || qty * holding.cost_per_share;
	const marketValue = qty * currentPrice;
	const totalGain = marketValue - costBasis;
	const gainPct = costBasis > 0 ? (totalGain / costBasis) * 100 : 0;
	return {
		...holding,
		market_value: round2(marketValue),
		total_gain: round2(totalGain),
		unrealized_gain_pct: round2(gainPct)
	};
}

function round2(n: number): number {
	return Math.round(n * 100) / 100;
}

export function attachWatchlistVerdict(result: AnalyzedSymbol): AnalyzedSymbol {
	if (!result.trend || !result.analysis) {
		return {
			...result,
			verdict: { verdict: 'N/A', reasons: ['insufficient data'] }
		};
	}
	return { ...result, verdict: buyVerdict(result.trend, result.analysis) };
}
