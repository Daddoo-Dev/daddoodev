/**
 * Weekly snapshot for Conclavium in-app analytics (same app/report format as Knights Management).
 * Known fields are typed; additional keys may appear from future report versions.
 */
export type KmFeatureByMode = Record<string, { classic: number; overview: number }>;

export interface KmWeeklySnapshot {
	week: string;
	to: string;
	totalEvents: number;
	featureOpens: number;
	uiModeChanges: number;
	byFeature: Record<string, number>;
	byUiMode: Record<string, number>;
	byPlatform: Record<string, number>;
	featureByMode: KmFeatureByMode;
	uiModeChangesDetail: { toClassic: number; toOverview: number };
	[key: string]: unknown;
}

export function isKmWeeklySnapshot(x: unknown): x is KmWeeklySnapshot {
	if (!x || typeof x !== 'object') return false;
	const o = x as Record<string, unknown>;
	return (
		typeof o.week === 'string' &&
		typeof o.to === 'string' &&
		typeof o.totalEvents === 'number' &&
		typeof o.featureOpens === 'number' &&
		typeof o.uiModeChanges === 'number' &&
		o.byFeature !== null &&
		typeof o.byFeature === 'object' &&
		o.byUiMode !== null &&
		typeof o.byUiMode === 'object' &&
		o.byPlatform !== null &&
		typeof o.byPlatform === 'object' &&
		o.featureByMode !== null &&
		typeof o.featureByMode === 'object' &&
		o.uiModeChangesDetail !== null &&
		typeof o.uiModeChangesDetail === 'object'
	);
}
