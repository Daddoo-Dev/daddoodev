/**
 * GET/POST /api/triptime — Paris vs Rome planner (Firestore + free SerpAPI Google Flights).
 */
import { onRequest } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import * as admin from 'firebase-admin';

const COLLECTION = 'internal';
const DOC_ID = 'triptime';

const serpApiKey = defineSecret('SERPAPI_API_KEY');

type CabinClass = 'ECONOMY' | 'PREMIUM_ECONOMY';
type CityId = 'paris' | 'rome';

type TripSettings = {
	adults: number;
	origin: string;
	year: number;
	windowStartMonth: number;
	windowStartDay: number;
	windowEndMonth: number;
	windowEndDay: number;
	nights: number;
	hotelMinUsd: number;
	hotelMaxUsd: number;
	gapThresholdUsd: number;
	cabin: CabinClass;
	cabinUpgradeWithinUsd: number;
};

type DateWindow = { id: string; departDate: string; returnDate: string; nights: number };

type FlightOfferSummary = {
	priceUsd: number;
	cabin: CabinClass;
	airline: string;
	stops: number;
	durationOutbound: string;
	durationReturn: string;
	bookingLink: string;
	rawLabel: string;
};

type HotelOfferSummary = {
	priceTotalUsd: number;
	pricePerNightUsd: number;
	name: string;
	bookingLink: string;
	estimated: boolean;
};

type CityWindowQuote = {
	city: CityId;
	window: DateWindow;
	flight: FlightOfferSummary | null;
	flightUpgrade: FlightOfferSummary | null;
	hotel: HotelOfferSummary | null;
	totalUsd: number | null;
	error?: string;
};

type TripStore = {
	settings: TripSettings;
	lastScanAt: string | null;
	flightsConfigured: boolean;
	quotes: CityWindowQuote[];
	selectedWindowId: string | null;
	notes: Record<CityId, string>;
	compare: ReturnType<typeof buildCompare> | null;
};

const DEFAULT_SETTINGS: TripSettings = {
	adults: 2,
	origin: 'DEN',
	year: 2027,
	windowStartMonth: 6,
	windowStartDay: 6,
	windowEndMonth: 6,
	windowEndDay: 26,
	nights: 7,
	hotelMinUsd: 150,
	hotelMaxUsd: 250,
	gapThresholdUsd: 500,
	cabin: 'ECONOMY',
	cabinUpgradeWithinUsd: 200
};

const CITY_AIRPORTS: Record<CityId, string> = {
	paris: 'CDG,ORY',
	rome: 'FCO,CIA'
};
const CITY_LABEL: Record<CityId, string> = { paris: 'Paris', rome: 'Rome' };

function pad(n: number): string {
	return String(n).padStart(2, '0');
}

function isoDate(year: number, month: number, day: number): string {
	return `${year}-${pad(month)}-${pad(day)}`;
}

function parseIso(iso: string): Date {
	const [y, m, d] = iso.split('-').map(Number);
	return new Date(Date.UTC(y!, m! - 1, d!));
}

function addDaysIso(iso: string, days: number): string {
	const dt = parseIso(iso);
	dt.setUTCDate(dt.getUTCDate() + days);
	return isoDate(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate());
}

function generateWindows(settings: TripSettings): DateWindow[] {
	const start = isoDate(settings.year, settings.windowStartMonth, settings.windowStartDay);
	const end = isoDate(settings.year, settings.windowEndMonth, settings.windowEndDay);
	const windows: DateWindow[] = [];
	let depart = start;
	while (true) {
		const ret = addDaysIso(depart, settings.nights);
		if (ret > end) break;
		windows.push({
			id: `${depart}_${ret}`,
			departDate: depart,
			returnDate: ret,
			nights: settings.nights
		});
		depart = addDaysIso(depart, 1);
	}
	return windows;
}

function estimatedHotel(settings: TripSettings, window: DateWindow, city: CityId): HotelOfferSummary {
	const mid = Math.round((settings.hotelMinUsd + settings.hotelMaxUsd) / 2);
	const q = encodeURIComponent(`${CITY_LABEL[city]} hotels`);
	return {
		priceTotalUsd: mid * window.nights,
		pricePerNightUsd: mid,
		name: `${CITY_LABEL[city]} mid-band estimate`,
		bookingLink: `https://www.google.com/travel/hotels/${q}?dates=${window.departDate},${window.returnDate}&adults=${settings.adults}&curr=USD`,
		estimated: true
	};
}

function googleFlightsLink(
	origin: string,
	dest: string,
	departDate: string,
	returnDate: string,
	adults: number
): string {
	const q = `${origin}%20to%20${dest}%20${departDate}%20${returnDate}%20${adults}%20adults%20economy`;
	return `https://www.google.com/travel/flights?q=${q}&curr=USD`;
}

function buildCompare(
	quotes: CityWindowQuote[],
	settings: TripSettings,
	selectedWindowId: string | null
) {
	const pickBest = (list: CityWindowQuote[]) => {
		const ok = list.filter((q) => q.totalUsd != null);
		if (!ok.length) return null;
		return ok.reduce((a, b) => ((a.totalUsd ?? Infinity) <= (b.totalUsd ?? Infinity) ? a : b));
	};
	const bestParis = pickBest(quotes.filter((q) => q.city === 'paris'));
	const bestRome = pickBest(quotes.filter((q) => q.city === 'rome'));
	const windowIds = [...new Set(quotes.map((q) => q.window.id))];
	type Shared = {
		window: DateWindow;
		paris: CityWindowQuote;
		rome: CityWindowQuote;
		combined: number;
	};
	const sharedCandidates: Shared[] = [];
	for (const id of windowIds) {
		const paris = quotes.find((q) => q.city === 'paris' && q.window.id === id);
		const rome = quotes.find((q) => q.city === 'rome' && q.window.id === id);
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
		const sel = sharedCandidates.find((s) => s.window.id === selectedWindowId);
		if (sel) shared = sel;
	}
	const gapFlags: Array<{
		city: CityId;
		bestWindow: DateWindow;
		bestTotalUsd: number;
		sharedWindow: DateWindow;
		sharedTotalUsd: number;
		savingsUsd: number;
	}> = [];
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

function emptyStore(flightsConfigured: boolean): TripStore {
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

function normalize(raw: unknown, flightsConfigured: boolean): TripStore {
	const base = emptyStore(flightsConfigured);
	if (!raw || typeof raw !== 'object') return base;
	const o = raw as Partial<TripStore>;
	const settings = { ...DEFAULT_SETTINGS, ...(o.settings ?? {}) };
	const quotes = Array.isArray(o.quotes) ? o.quotes : [];
	const selectedWindowId = typeof o.selectedWindowId === 'string' ? o.selectedWindowId : null;
	return {
		settings,
		lastScanAt: typeof o.lastScanAt === 'string' ? o.lastScanAt : null,
		flightsConfigured,
		quotes,
		selectedWindowId,
		notes: {
			paris: typeof o.notes?.paris === 'string' ? o.notes.paris : '',
			rome: typeof o.notes?.rome === 'string' ? o.notes.rome : ''
		},
		compare: buildCompare(quotes, settings, selectedWindowId)
	};
}

async function searchFlights(
	apiKey: string,
	settings: TripSettings,
	city: CityId,
	window: DateWindow,
	cabin: CabinClass
): Promise<FlightOfferSummary | null> {
	const url = new URL('https://serpapi.com/search.json');
	url.searchParams.set('engine', 'google_flights');
	url.searchParams.set('api_key', apiKey);
	url.searchParams.set('departure_id', settings.origin);
	url.searchParams.set('arrival_id', CITY_AIRPORTS[city]);
	url.searchParams.set('outbound_date', window.departDate);
	url.searchParams.set('return_date', window.returnDate);
	url.searchParams.set('type', '1');
	url.searchParams.set('currency', 'USD');
	url.searchParams.set('hl', 'en');
	url.searchParams.set('gl', 'us');
	url.searchParams.set('adults', String(settings.adults));
	url.searchParams.set('travel_class', cabin === 'PREMIUM_ECONOMY' ? '2' : '1');

	const res = await fetch(url.toString());
	const json = (await res.json()) as {
		error?: string;
		best_flights?: Array<{ price?: number; flights?: Array<{ airline?: string }>; total_duration?: number }>;
		other_flights?: Array<{ price?: number; flights?: Array<{ airline?: string }>; total_duration?: number }>;
		price_insights?: { lowest_price?: number };
		search_metadata?: { google_flights_url?: string };
	};
	if (!res.ok || json.error) throw new Error(json.error ?? `SerpAPI ${res.status}`);

	const options = [...(json.best_flights ?? []), ...(json.other_flights ?? [])].filter(
		(o) => typeof o.price === 'number'
	);
	const best = options.sort((a, b) => (a.price ?? 0) - (b.price ?? 0))[0];
	const bookingLink =
		json.search_metadata?.google_flights_url ||
		googleFlightsLink(settings.origin, CITY_AIRPORTS[city], window.departDate, window.returnDate, settings.adults);

	if (best?.price != null) {
		return {
			priceUsd: Math.round(best.price),
			cabin,
			airline: best.flights?.[0]?.airline ?? 'Google Flights',
			stops: Math.max(0, (best.flights?.length ?? 1) - 1),
			durationOutbound: String(best.total_duration ?? '—'),
			durationReturn: '—',
			bookingLink,
			rawLabel: 'Google Flights'
		};
	}
	const lowest = json.price_insights?.lowest_price;
	if (typeof lowest === 'number') {
		return {
			priceUsd: Math.round(lowest),
			cabin,
			airline: 'Google Flights',
			stops: -1,
			durationOutbound: '—',
			durationReturn: '—',
			bookingLink,
			rawLabel: 'Google Flights lowest'
		};
	}
	return null;
}

function sleep(ms: number) {
	return new Promise((r) => setTimeout(r, ms));
}

async function runScan(store: TripStore, apiKey: string): Promise<TripStore> {
	if (!apiKey.trim()) {
		throw new Error('SERPAPI_API_KEY not configured');
	}
	const windows = generateWindows(store.settings);
	const cities: CityId[] = ['paris', 'rome'];
	const quotes: CityWindowQuote[] = [];

	for (const window of windows) {
		for (const city of cities) {
			const hotel = estimatedHotel(store.settings, window, city);
			try {
				const flight = await searchFlights(apiKey, store.settings, city, window, store.settings.cabin);
				quotes.push({
					city,
					window,
					flight,
					flightUpgrade: null,
					hotel,
					totalUsd: flight ? flight.priceUsd + hotel.priceTotalUsd : hotel.priceTotalUsd,
					error: flight ? undefined : 'No price'
				});
			} catch (e) {
				quotes.push({
					city,
					window,
					flight: null,
					flightUpgrade: null,
					hotel,
					totalUsd: hotel.priceTotalUsd,
					error: e instanceof Error ? e.message : 'fail'
				});
			}
			await sleep(200);
		}
	}

	for (const city of cities) {
		const ranked = quotes
			.filter((q) => q.city === city && q.flight)
			.sort((a, b) => a.flight!.priceUsd - b.flight!.priceUsd)
			.slice(0, 2);
		for (const q of ranked) {
			try {
				await sleep(200);
				const upgrade = await searchFlights(
					apiKey,
					store.settings,
					city,
					q.window,
					'PREMIUM_ECONOMY'
				);
				if (
					upgrade &&
					q.flight &&
					upgrade.priceUsd - q.flight.priceUsd <= store.settings.cabinUpgradeWithinUsd
				) {
					q.flightUpgrade = upgrade;
				}
			} catch {
				/* optional */
			}
		}
	}

	let selectedWindowId = store.selectedWindowId;
	let compare = buildCompare(quotes, store.settings, selectedWindowId);
	if (!selectedWindowId && compare.sharedWindow) {
		selectedWindowId = compare.sharedWindow.id;
		compare = buildCompare(quotes, store.settings, selectedWindowId);
	}

	return {
		...store,
		lastScanAt: new Date().toISOString(),
		flightsConfigured: true,
		quotes,
		selectedWindowId,
		compare
	};
}

export const triptime = onRequest(
	{
		cors: true,
		invoker: 'public',
		timeoutSeconds: 540,
		memory: '512MiB',
		secrets: [serpApiKey]
	},
	async (req, res) => {
		if (req.method === 'OPTIONS') {
			res.status(204).send('');
			return;
		}

		const db = admin.firestore();
		const ref = db.collection(COLLECTION).doc(DOC_ID);
		const configured = Boolean(serpApiKey.value()?.trim());

		const load = async (): Promise<TripStore> => {
			const doc = await ref.get();
			return normalize(doc.exists ? doc.data() : null, configured);
		};

		const save = async (store: TripStore) => {
			const { compare: _c, flightsConfigured: _f, ...persist } = store;
			await ref.set({ ...persist, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
		};

		try {
			if (req.method === 'GET') {
				const store = await load();
				res.setHeader('Cache-Control', 'no-store');
				res.status(200).json({ store });
				return;
			}

			if (req.method === 'POST') {
				let store = await load();
				const body = (req.body ?? {}) as {
					action?: string;
					settings?: Partial<TripSettings>;
					selectedWindowId?: string | null;
					notes?: { paris?: string; rome?: string };
				};
				const action = body.action ?? 'save';

				if (action === 'settings' && body.settings) {
					store = normalize(
						{ ...store, settings: { ...store.settings, ...body.settings } },
						configured
					);
					await save(store);
					res.status(200).json({ store });
					return;
				}

				if (action === 'select') {
					store.selectedWindowId =
						typeof body.selectedWindowId === 'string' ? body.selectedWindowId : null;
					store.compare = buildCompare(store.quotes, store.settings, store.selectedWindowId);
					await save(store);
					res.status(200).json({ store });
					return;
				}

				if (action === 'notes' && body.notes) {
					store.notes = {
						paris: typeof body.notes.paris === 'string' ? body.notes.paris : store.notes.paris,
						rome: typeof body.notes.rome === 'string' ? body.notes.rome : store.notes.rome
					};
					await save(store);
					res.status(200).json({ store });
					return;
				}

				if (action === 'scan') {
					store = await runScan(store, serpApiKey.value());
					await save(store);
					res.status(200).json({ store });
					return;
				}

				res.status(400).json({ error: 'Unknown action' });
				return;
			}

			res.status(405).json({ error: 'Method not allowed' });
		} catch (err) {
			console.error('triptime:', err);
			res.status(500).json({ error: err instanceof Error ? err.message : 'Failed' });
		}
	}
);
