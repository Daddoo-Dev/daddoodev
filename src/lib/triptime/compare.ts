import type {
	CityId,
	CityWindowQuote,
	CompareResult,
	DateWindow,
	GapFlag,
	TripSettings
} from './types';

function pickBest(quotes: CityWindowQuote[]): CityWindowQuote | null {
	const ok = quotes.filter((q) => q.totalUsd != null);
	if (ok.length === 0) return null;
	return ok.reduce((a, b) => ((a.totalUsd ?? Infinity) <= (b.totalUsd ?? Infinity) ? a : b));
}

function quoteFor(
	quotes: CityWindowQuote[],
	city: CityId,
	windowId: string
): CityWindowQuote | null {
	return quotes.find((q) => q.city === city && q.window.id === windowId) ?? null;
}

/** Prefer a shared calendar window; flag large independent-city savings. */
export function buildCompare(
	quotes: CityWindowQuote[],
	settings: TripSettings,
	selectedWindowId: string | null
): CompareResult {
	const parisAll = quotes.filter((q) => q.city === 'paris');
	const romeAll = quotes.filter((q) => q.city === 'rome');
	const bestParis = pickBest(parisAll);
	const bestRome = pickBest(romeAll);

	const windowIds = [...new Set(quotes.map((q) => q.window.id))];
	type Shared = {
		window: DateWindow;
		paris: CityWindowQuote;
		rome: CityWindowQuote;
		combined: number;
	};
	const sharedCandidates: Shared[] = [];

	for (const id of windowIds) {
		const paris = quoteFor(quotes, 'paris', id);
		const rome = quoteFor(quotes, 'rome', id);
		if (!paris?.totalUsd || !rome?.totalUsd) continue;
		sharedCandidates.push({
			window: paris.window,
			paris,
			rome,
			combined: paris.totalUsd + rome.totalUsd
		});
	}

	sharedCandidates.sort((a, b) => a.combined - b.combined);

	let shared = sharedCandidates[0] ?? null;
	if (selectedWindowId) {
		const selected = sharedCandidates.find((s) => s.window.id === selectedWindowId);
		if (selected) shared = selected;
	}

	const gapFlags: GapFlag[] = [];
	if (shared) {
		if (
			bestParis?.totalUsd != null &&
			bestParis.window.id !== shared.window.id &&
			shared.paris.totalUsd != null &&
			shared.paris.totalUsd - bestParis.totalUsd >= settings.gapThresholdUsd
		) {
			gapFlags.push({
				city: 'paris',
				bestWindow: bestParis.window,
				bestTotalUsd: bestParis.totalUsd,
				sharedWindow: shared.window,
				sharedTotalUsd: shared.paris.totalUsd,
				savingsUsd: shared.paris.totalUsd - bestParis.totalUsd
			});
		}
		if (
			bestRome?.totalUsd != null &&
			bestRome.window.id !== shared.window.id &&
			shared.rome.totalUsd != null &&
			shared.rome.totalUsd - bestRome.totalUsd >= settings.gapThresholdUsd
		) {
			gapFlags.push({
				city: 'rome',
				bestWindow: bestRome.window,
				bestTotalUsd: bestRome.totalUsd,
				sharedWindow: shared.window,
				sharedTotalUsd: shared.rome.totalUsd,
				savingsUsd: shared.rome.totalUsd - bestRome.totalUsd
			});
		}
	}

	return {
		sharedWindow: shared?.window ?? null,
		sharedParis: shared?.paris ?? null,
		sharedRome: shared?.rome ?? null,
		sharedTotalParis: shared?.paris.totalUsd ?? null,
		sharedTotalRome: shared?.rome.totalUsd ?? null,
		bestParis,
		bestRome,
		gapFlags
	};
}

export function money(n: number | null | undefined): string {
	if (n == null || Number.isNaN(n)) return '—';
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		maximumFractionDigits: 0
	}).format(n);
}
