/** Trailing rolling mean (same indexing as pandas rolling(window).mean()). */
export function rollingMean(values: number[], window: number): number[] {
	const out: number[] = new Array(values.length).fill(NaN);
	for (let i = window - 1; i < values.length; i++) {
		let sum = 0;
		for (let j = i - window + 1; j <= i; j++) sum += values[j];
		out[i] = sum / window;
	}
	return out;
}

/** Sample std dev, ddof=1 (pandas rolling std default). */
export function rollingStd(values: number[], window: number): number[] {
	const out: number[] = new Array(values.length).fill(NaN);
	for (let i = window - 1; i < values.length; i++) {
		const slice = values.slice(i - window + 1, i + 1);
		const mean = slice.reduce((a, b) => a + b, 0) / window;
		let ss = 0;
		for (const x of slice) ss += (x - mean) ** 2;
		const varSample = ss / (window - 1);
		out[i] = Math.sqrt(varSample);
	}
	return out;
}
