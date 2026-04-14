/**
 * Same parsing logic as src/lib/km-analytics/parseReport.ts (keep in sync when report format changes).
 */
export type KmFeatureByMode = Record<string, { classic: number; overview: number }>;

export type KmWeeklySnapshot = {
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
};

function isoDatePrefix(isoLine: string): string {
	const m = isoLine.match(/(\d{4}-\d{2}-\d{2})/);
	if (!m) throw new Error(`Could not parse date from: ${isoLine}`);
	return m[1];
}

export function parseKnightsManagementReport(raw: string): KmWeeklySnapshot {
	const lines = raw.split(/\r?\n/);

	let fromLine = '';
	let toLine = '';
	let totalEvents = 0;
	let featureOpens = 0;
	let uiModeChanges = 0;
	const byFeature: Record<string, number> = {};
	const byUiMode: Record<string, number> = {};
	const byPlatform: Record<string, number> = {};
	const featureByMode: KmFeatureByMode = {};
	let toClassic = 0;
	let toOverview = 0;

	type Section =
		| 'none'
		| 'byFeature'
		| 'byUiMode'
		| 'byPlatform'
		| 'featureByMode'
		| 'uiModeChanges';
	let section: Section = 'none';

	for (const line of lines) {
		const trimmed = line.trim();

		if (trimmed.startsWith('---')) {
			if (trimmed.includes('By feature')) section = 'byFeature';
			else if (trimmed.includes('By UI mode')) section = 'byUiMode';
			else if (trimmed.includes('By platform')) section = 'byPlatform';
			else if (trimmed.includes('Feature') && trimmed.includes('UI mode')) section = 'featureByMode';
			else if (trimmed.includes('UI mode changes')) section = 'uiModeChanges';
			else section = 'none';
			continue;
		}

		const fromM = line.match(/^From:\s*(.+)$/);
		if (fromM) {
			fromLine = fromM[1];
			continue;
		}
		const toM = line.match(/^To:\s*(.+)$/);
		if (toM) {
			toLine = toM[1];
			continue;
		}
		const te = line.match(/^Total events:\s*(\d+)\s*$/i);
		if (te) {
			totalEvents = parseInt(te[1], 10);
			continue;
		}
		const fo = line.match(/^Feature opens:\s*(\d+)\s*$/i);
		if (fo) {
			featureOpens = parseInt(fo[1], 10);
			continue;
		}
		const umc = line.match(/^UI mode changes:\s*(\d+)\s*$/i);
		if (umc) {
			uiModeChanges = parseInt(umc[1], 10);
			continue;
		}

		if (section === 'byFeature' || section === 'byUiMode' || section === 'byPlatform') {
			const kv = line.match(/^\s*([a-zA-Z0-9_]+):\s*(\d+)\s*$/);
			if (kv) {
				const key = kv[1];
				const n = parseInt(kv[2], 10);
				if (section === 'byFeature') byFeature[key] = n;
				else if (section === 'byUiMode') byUiMode[key] = n;
				else byPlatform[key] = n;
			}
			continue;
		}

		if (section === 'featureByMode') {
			const fm = line.match(/^\s*(\S+)\s*\/\s*(\S+):\s*(\d+)\s*$/);
			if (fm) {
				const feat = fm[1];
				const mode = fm[2].toLowerCase();
				const n = parseInt(fm[3], 10);
				if (!featureByMode[feat]) {
					featureByMode[feat] = { classic: 0, overview: 0 };
				}
				if (mode === 'classic') featureByMode[feat].classic = n;
				else if (mode === 'overview') featureByMode[feat].overview = n;
			}
			continue;
		}

		if (section === 'uiModeChanges') {
			const tc = line.match(/^\s*to\s+classic:\s*(\d+)\s*$/i);
			if (tc) {
				toClassic = parseInt(tc[1], 10);
				continue;
			}
			const tov = line.match(/^\s*to\s+overview:\s*(\d+)\s*$/i);
			if (tov) {
				toOverview = parseInt(tov[1], 10);
				continue;
			}
		}
	}

	if (!fromLine || !toLine) {
		throw new Error('Report must include From: and To: lines with ISO timestamps');
	}

	const week = isoDatePrefix(fromLine);
	const to = isoDatePrefix(toLine);

	return {
		week,
		to,
		totalEvents,
		featureOpens,
		uiModeChanges,
		byFeature,
		byUiMode,
		byPlatform,
		featureByMode,
		uiModeChangesDetail: { toClassic, toOverview }
	};
}
