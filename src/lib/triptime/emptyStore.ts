import { DEFAULT_SETTINGS } from './constants';
import type { TripStore } from './types';

export function emptyStore(flightsConfigured = false): TripStore {
	return {
		settings: { ...DEFAULT_SETTINGS },
		lastScanAt: null,
		flightsConfigured,
		quotes: [],
		selectedWindowId: null,
		notes: { paris: '', rome: '' },
		compare: null
	};
}
