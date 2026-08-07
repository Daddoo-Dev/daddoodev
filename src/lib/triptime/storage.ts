import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { DEFAULT_SETTINGS } from './constants';
import { buildCompare } from './compare';
import { emptyStore } from './emptyStore';
import { TRIPTIME_FILE } from './dataPath';
import type { TripSettings, TripStore } from './types';

export { emptyStore } from './emptyStore';

function mergeSettings(raw: unknown): TripSettings {
	const base = { ...DEFAULT_SETTINGS };
	if (!raw || typeof raw !== 'object') return base;
	const s = raw as Partial<TripSettings>;
	return {
		adults: Number(s.adults) > 0 ? Math.floor(Number(s.adults)) : base.adults,
		origin: typeof s.origin === 'string' && s.origin.trim() ? s.origin.trim().toUpperCase() : base.origin,
		year: Number(s.year) > 2000 ? Math.floor(Number(s.year)) : base.year,
		windowStartMonth: Number(s.windowStartMonth) || base.windowStartMonth,
		windowStartDay: Number(s.windowStartDay) || base.windowStartDay,
		windowEndMonth: Number(s.windowEndMonth) || base.windowEndMonth,
		windowEndDay: Number(s.windowEndDay) || base.windowEndDay,
		nights: Number(s.nights) > 0 ? Math.floor(Number(s.nights)) : base.nights,
		hotelMinUsd: Number(s.hotelMinUsd) || base.hotelMinUsd,
		hotelMaxUsd: Number(s.hotelMaxUsd) || base.hotelMaxUsd,
		gapThresholdUsd: Number(s.gapThresholdUsd) || base.gapThresholdUsd,
		cabin: s.cabin === 'PREMIUM_ECONOMY' ? 'PREMIUM_ECONOMY' : 'ECONOMY',
		cabinUpgradeWithinUsd:
			Number(s.cabinUpgradeWithinUsd) >= 0
				? Math.floor(Number(s.cabinUpgradeWithinUsd))
				: base.cabinUpgradeWithinUsd
	};
}

export function normalizeStore(raw: unknown, flightsConfigured: boolean): TripStore {
	const empty = emptyStore(flightsConfigured);
	if (!raw || typeof raw !== 'object') return empty;
	const o = raw as Partial<TripStore> & { amadeusConfigured?: boolean };
	const settings = mergeSettings(o.settings);
	const quotes = Array.isArray(o.quotes) ? o.quotes : [];
	const selectedWindowId = typeof o.selectedWindowId === 'string' ? o.selectedWindowId : null;
	const notes = {
		paris: typeof o.notes?.paris === 'string' ? o.notes.paris : '',
		rome: typeof o.notes?.rome === 'string' ? o.notes.rome : ''
	};
	return {
		settings,
		lastScanAt: typeof o.lastScanAt === 'string' ? o.lastScanAt : null,
		flightsConfigured: flightsConfigured || Boolean(o.flightsConfigured ?? o.amadeusConfigured),
		quotes,
		selectedWindowId,
		notes,
		compare: buildCompare(quotes, settings, selectedWindowId)
	};
}

export async function readTripStore(flightsConfigured: boolean): Promise<TripStore> {
	try {
		const raw = await readFile(TRIPTIME_FILE, 'utf-8');
		return normalizeStore(JSON.parse(raw), flightsConfigured);
	} catch (e) {
		const code = (e as NodeJS.ErrnoException)?.code;
		if (code === 'ENOENT') return emptyStore(flightsConfigured);
		throw e;
	}
}

export async function writeTripStore(store: TripStore): Promise<void> {
	await mkdir(path.dirname(TRIPTIME_FILE), { recursive: true });
	const toSave = {
		settings: store.settings,
		lastScanAt: store.lastScanAt,
		quotes: store.quotes,
		selectedWindowId: store.selectedWindowId,
		notes: store.notes
	};
	await writeFile(TRIPTIME_FILE, `${JSON.stringify(toSave, null, '\t')}\n`, 'utf-8');
}
