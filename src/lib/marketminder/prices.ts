export type ChartResponse = {
	closes: number[];
	volumes: number[];
};

let idTokenProvider: (() => Promise<string | null>) | null = null;

/** Called after Firebase Auth sign-in so production chart requests include ID token. */
export function setMarketminderChartAuth(provider: (() => Promise<string | null>) | null): void {
	idTokenProvider = provider;
}

function chartUrl(symbol: string, interval: '1mo' | '1wk'): string {
	const enc = encodeURIComponent(symbol);
	if (import.meta.env.DEV) {
		return `/__marketminder/chart?symbol=${enc}&interval=${interval}`;
	}
	const base = (import.meta.env.PUBLIC_MARKETMINDER_API_BASE || '').replace(/\/$/, '');
	if (base) {
		return `${base}/chart?symbol=${enc}&interval=${interval}`;
	}
	return `/mm/chart?symbol=${enc}&interval=${interval}`;
}

export async function fetchChart(symbol: string, interval: '1mo' | '1wk'): Promise<ChartResponse> {
	const url = chartUrl(symbol, interval);
	const headers: Record<string, string> = {};
	if (!import.meta.env.DEV && idTokenProvider) {
		const token = await idTokenProvider();
		if (token) headers.Authorization = `Bearer ${token}`;
	}
	const res = await fetch(url, { headers });
	if (!res.ok) {
		const t = await res.text();
		throw new Error(`Chart fetch failed (${res.status}): ${t}`);
	}
	const data = (await res.json()) as ChartResponse & { error?: string };
	if (data.error || !Array.isArray(data.closes)) {
		throw new Error(data.error || 'invalid chart response');
	}
	const rawVol = Array.isArray(data.volumes) ? data.volumes : [];
	const volumes: number[] = rawVol.map((v) =>
		v == null || Number.isNaN(Number(v)) ? 0 : Number(v)
	);
	while (volumes.length < data.closes.length) volumes.push(0);
	return { closes: data.closes, volumes: volumes.slice(0, data.closes.length) };
}

export async function loadWeeklyPack(symbol: string): Promise<{ closes: number[]; volumes: number[] }> {
	const { closes, volumes } = await fetchChart(symbol, '1wk');
	return { closes, volumes };
}

export async function loadMonthlySeries(symbol: string): Promise<number[]> {
	const { closes } = await fetchChart(symbol, '1mo');
	return closes;
}
