import { CITIES } from './constants';
import { buildCompare } from './compare';
import { bookingLinksForWindow, estimatedHotel } from './links';
import { searchGoogleFlights, serpApiConfigured, type SerpApiConfig } from './serpapi';
import type { CityId, CityWindowQuote, TripStore } from './types';
import { generateWindows } from './windows';

function sleep(ms: number): Promise<void> {
	return new Promise((r) => setTimeout(r, ms));
}

function destAirports(city: CityId): string {
	return CITIES[city].airports.join(',');
}

async function quoteWindow(
	cfg: SerpApiConfig,
	store: TripStore,
	city: CityId,
	window: ReturnType<typeof generateWindows>[number]
): Promise<CityWindowQuote> {
	const links = bookingLinksForWindow(city, window, store.settings);
	const hotel = estimatedHotel(store.settings, window, city);
	try {
		const flight = await searchGoogleFlights({
			cfg,
			origin: store.settings.origin,
			destination: destAirports(city),
			departDate: window.departDate,
			returnDate: window.returnDate,
			adults: store.settings.adults,
			cabin: store.settings.cabin,
			bookingLink: links.flightsGoogle
		});
		return {
			city,
			window,
			flight,
			flightUpgrade: null,
			hotel,
			totalUsd: flight ? flight.priceUsd + hotel.priceTotalUsd : hotel.priceTotalUsd,
			...(flight ? {} : { error: 'No Google Flights price returned' })
		};
	} catch (e) {
		return {
			city,
			window,
			flight: null,
			flightUpgrade: null,
			hotel,
			totalUsd: hotel.priceTotalUsd,
			error: e instanceof Error ? e.message : 'Flight search failed'
		};
	}
}

/** Full matrix: Google Flights via SerpAPI (free tier) + hotel mid-band estimate. */
export async function runPriceScan(
	store: TripStore,
	cfg: SerpApiConfig | null
): Promise<TripStore> {
	const windows = generateWindows(store.settings);
	const cities: CityId[] = ['paris', 'rome'];
	const quotes: CityWindowQuote[] = [];
	const configured = serpApiConfigured(cfg);

	if (!configured || !cfg) {
		throw new Error(
			'SERPAPI_API_KEY missing. Sign up free at https://serpapi.com (free plan), put the key in .env, restart, then Scan.'
		);
	}

	for (const window of windows) {
		for (const city of cities) {
			quotes.push(await quoteWindow(cfg, store, city, window));
			await sleep(200);
		}
	}

	// Premium economy only on the 2 cheapest economy windows per city (saves free-tier quota)
	for (const city of cities) {
		const ranked = quotes
			.filter((q) => q.city === city && q.flight)
			.sort((a, b) => a.flight!.priceUsd - b.flight!.priceUsd)
			.slice(0, 2);
		for (const q of ranked) {
			const links = bookingLinksForWindow(city, q.window, store.settings);
			try {
				await sleep(200);
				const upgrade = await searchGoogleFlights({
					cfg,
					origin: store.settings.origin,
					destination: destAirports(city),
					departDate: q.window.departDate,
					returnDate: q.window.returnDate,
					adults: store.settings.adults,
					cabin: 'PREMIUM_ECONOMY',
					bookingLink: links.flightsGoogle
				});
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
