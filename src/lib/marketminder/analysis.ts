import type {
	AnalysisBlock,
	BuyVerdict,
	EntrySignal,
	MomentumBlock,
	RelativeStrength,
	TrendBlock,
	VolumeBlock
} from './types';

function last(arr: number[], i: number): number {
	return arr[arr.length + i];
}

export function relativeStrength(
	stockMonthly: number[],
	spyMonthly: number[]
): RelativeStrength | null {
	if (stockMonthly.length < 7 || spyMonthly.length < 7) return null;
	const stockCurr = last(stockMonthly, -1);
	const spyCurr = last(spyMonthly, -1);
	const stock3m = (stockCurr / last(stockMonthly, -4) - 1) * 100;
	const spy3m = (spyCurr / last(spyMonthly, -4) - 1) * 100;
	const stock6m = (stockCurr / last(stockMonthly, -7) - 1) * 100;
	const spy6m = (spyCurr / last(spyMonthly, -7) - 1) * 100;
	const rs3m = stock3m - spy3m;
	const rs6m = stock6m - spy6m;
	let status: RelativeStrength['status'];
	if (rs3m > 0 && rs6m > 0) status = 'OUTPERFORMING';
	else if (rs3m < 0 && rs6m < 0) status = 'UNDERPERFORMING';
	else if (rs3m > 0 && rs6m <= 0) status = 'IMPROVING';
	else status = 'FADING';
	return {
		rs_3m: round2(rs3m),
		rs_6m: round2(rs6m),
		stock_3m: round2(stock3m),
		spy_3m: round2(spy3m),
		status
	};
}

export function volumeConfirmation(
	closes: number[],
	volumes: number[]
): VolumeBlock | null {
	if (closes.length !== volumes.length || closes.length < 11) return null;
	const sliceVol = volumes.slice(-11, -1);
	const avgVol = sliceVol.reduce((a, b) => a + b, 0) / sliceVol.length;
	const currentVol = volumes[volumes.length - 1];
	if (avgVol === 0) return null;
	const ratio = currentVol / avgVol;
	let level: VolumeBlock['level'];
	if (ratio >= 2) level = 'HEAVY';
	else if (ratio >= 1.5) level = 'ELEVATED';
	else if (ratio <= 0.5) level = 'THIN';
	else level = 'NORMAL';
	return {
		volume_ratio: round2(ratio),
		avg_volume: Math.floor(avgVol),
		current_volume: Math.floor(currentVol),
		level
	};
}

export function momentum(monthlyPrices: number[]): MomentumBlock | null {
	if (monthlyPrices.length < 7) return null;
	const current = last(monthlyPrices, -1);
	const m1 = last(monthlyPrices, -2);
	const m3 = last(monthlyPrices, -4);
	const m6 = last(monthlyPrices, -7);
	const roc1 = m1 !== 0 ? (current / m1 - 1) * 100 : 0;
	const roc3 = m3 !== 0 ? (current / m3 - 1) * 100 : 0;
	const roc6 = m6 !== 0 ? (current / m6 - 1) * 100 : 0;
	const avgMonthlyFrom3 = roc3 !== 0 ? roc3 / 3 : 0;
	let status: MomentumBlock['status'];
	if (roc1 > 0 && roc3 > 0 && roc1 > avgMonthlyFrom3) status = 'ACCELERATING';
	else if (roc1 > 0 && roc3 > 0) status = 'STEADY';
	else if (roc1 < 0 && roc3 > 0) status = 'LOSING MOMENTUM';
	else if (roc1 < 0 && roc3 < 0) status = 'DECLINING';
	else if (roc1 > 0 && roc3 <= 0) status = 'RECOVERING';
	else status = 'STEADY';
	return {
		roc_1m: round2(roc1),
		roc_3m: round2(roc3),
		roc_6m: round2(roc6),
		status
	};
}

function round2(n: number): number {
	return Math.round(n * 100) / 100;
}

export function entrySignal(
	composite: string,
	overbought: TrendBlock['overbought'],
	rs: RelativeStrength | null,
	mom: MomentumBlock | null,
	pctAboveMa: number | null
): EntrySignal | null {
	if (composite !== 'STRONG HOLD' && composite !== 'HOLD') return null;
	if (overbought && (overbought.status === 'OVERBOUGHT' || overbought.status === 'STRETCHED'))
		return null;
	let score = 0;
	const reasons: string[] = [];
	if (pctAboveMa != null) {
		if (pctAboveMa >= 0 && pctAboveMa <= 3) {
			score += 3;
			reasons.push('price near MA support');
		} else if (pctAboveMa > 3 && pctAboveMa <= 8) {
			score += 1;
			reasons.push('reasonable distance from MA');
		}
	}
	if (rs) {
		if (rs.status === 'OUTPERFORMING' || rs.status === 'IMPROVING') {
			score += 2;
			reasons.push(`beating S&P by ${rs.rs_3m >= 0 ? '+' : ''}${rs.rs_3m.toFixed(1)}% (3mo)`);
		} else if (rs.status === 'UNDERPERFORMING') score -= 1;
	}
	if (mom) {
		if (mom.status === 'ACCELERATING') {
			score += 2;
			reasons.push('momentum accelerating');
		} else if (mom.status === 'STEADY') {
			score += 1;
			reasons.push('steady momentum');
		} else if (mom.status === 'LOSING MOMENTUM' || mom.status === 'DECLINING') score -= 1;
	}
	if (composite === 'STRONG HOLD') score += 1;
	if (score >= 5) return { signal: 'GOOD ENTRY', score, reasons };
	if (score >= 3) return { signal: 'FAIR ENTRY', score, reasons };
	return null;
}

export function buyVerdict(trend: TrendBlock, analysis: AnalysisBlock): BuyVerdict {
	const composite = trend.composite;
	const entry = analysis.entry;
	const overbought = trend.overbought;
	const rs = analysis.relative_strength;
	const mom = analysis.momentum;
	const reasons: string[] = [];
	if (composite === 'EXIT' || composite === 'WEAKENING') {
		reasons.push(`trend is ${composite}`);
		if (mom?.status === 'DECLINING') reasons.push('momentum declining');
		if (rs?.status === 'UNDERPERFORMING') reasons.push('lagging S&P 500');
		return { verdict: 'AVOID', reasons };
	}
	if (overbought && (overbought.status === 'OVERBOUGHT' || overbought.status === 'STRETCHED')) {
		reasons.push(`currently ${overbought.status.toLowerCase()}`);
		if (trend.medium) reasons.push(`wait for pullback toward MA ($${trend.medium.ma})`);
		return { verdict: 'WAIT', reasons };
	}
	if (composite === 'EARLY RECOVERY') {
		reasons.push('early signs of recovery, not confirmed');
		reasons.push('wait for medium MA to flip to HOLD');
		return { verdict: 'WAIT', reasons };
	}
	if (entry?.signal === 'GOOD ENTRY') {
		const r = [...entry.reasons, `composite: ${composite}`];
		return { verdict: 'BUY', reasons: r };
	}
	if (entry?.signal === 'FAIR ENTRY') {
		const r = [...entry.reasons, `composite: ${composite}`];
		return { verdict: 'CONSIDER', reasons: r };
	}
	if (composite === 'STRONG HOLD' || composite === 'HOLD') {
		reasons.push('trend is positive but not near a good entry point');
		if (mom?.status === 'LOSING MOMENTUM') reasons.push('momentum fading');
		if (trend.medium)
			reasons.push(`better entry closer to MA ($${trend.medium.ma})`);
		return { verdict: 'WAIT', reasons };
	}
	reasons.push('mixed signals — wait for clarity');
	return { verdict: 'WAIT', reasons };
}
