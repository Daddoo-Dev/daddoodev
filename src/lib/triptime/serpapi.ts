import type { CabinClass, FlightOfferSummary } from './types';

export type SerpApiConfig = {
	apiKey: string;
};

type SerpFlightLeg = {
	airline?: string;
	duration?: number;
	departure_airport?: { id?: string };
	arrival_airport?: { id?: string };
};

type SerpFlightOption = {
	flights?: SerpFlightLeg[];
	layovers?: unknown[];
	total_duration?: number;
	price?: number;
	type?: string;
	airline_logo?: string;
	departure_token?: string;
};

type SerpFlightsResponse = {
	error?: string;
	best_flights?: SerpFlightOption[];
	other_flights?: SerpFlightOption[];
	price_insights?: { lowest_price?: number };
	search_metadata?: { google_flights_url?: string; status?: string };
};

export function serpApiConfigured(cfg: SerpApiConfig | null | undefined): boolean {
	return Boolean(cfg?.apiKey?.trim());
}

function minutesLabel(mins: number | undefined): string {
	if (mins == null || !Number.isFinite(mins)) return '—';
	const h = Math.floor(mins / 60);
	const m = mins % 60;
	if (h <= 0) return `${m}m`;
	if (m <= 0) return `${h}h`;
	return `${h}h ${m}m`;
}

function travelClassParam(cabin: CabinClass): string {
	return cabin === 'PREMIUM_ECONOMY' ? '2' : '1';
}

function pickCheapest(options: SerpFlightOption[]): SerpFlightOption | null {
	const priced = options.filter((o) => typeof o.price === 'number' && Number.isFinite(o.price));
	if (priced.length === 0) return null;
	return priced.reduce((a, b) => ((a.price ?? Infinity) <= (b.price ?? Infinity) ? a : b));
}

function toSummary(
	opt: SerpFlightOption,
	cabin: CabinClass,
	bookingLink: string
): FlightOfferSummary {
	const legs = opt.flights ?? [];
	const airline = legs[0]?.airline ?? 'Google Flights';
	const stops = Math.max(0, legs.length - 1);
	return {
		priceUsd: Math.round(opt.price!),
		cabin,
		airline,
		stops,
		durationOutbound: minutesLabel(opt.total_duration ?? legs.reduce((s, l) => s + (l.duration ?? 0), 0)),
		durationReturn: '—',
		bookingLink,
		rawLabel: `${airline} · Google Flights`
	};
}

/** One SerpAPI call returns round-trip options with prices (free tier: ~100–250 searches/mo). */
export async function searchGoogleFlights(opts: {
	cfg: SerpApiConfig;
	origin: string;
	/** Comma-separated IATA airports OK (e.g. CDG,ORY). */
	destination: string;
	departDate: string;
	returnDate: string;
	adults: number;
	cabin: CabinClass;
	bookingLink: string;
}): Promise<FlightOfferSummary | null> {
	const url = new URL('https://serpapi.com/search.json');
	url.searchParams.set('engine', 'google_flights');
	url.searchParams.set('api_key', opts.cfg.apiKey);
	url.searchParams.set('departure_id', opts.origin);
	url.searchParams.set('arrival_id', opts.destination);
	url.searchParams.set('outbound_date', opts.departDate);
	url.searchParams.set('return_date', opts.returnDate);
	url.searchParams.set('type', '1');
	url.searchParams.set('currency', 'USD');
	url.searchParams.set('hl', 'en');
	url.searchParams.set('gl', 'us');
	url.searchParams.set('adults', String(opts.adults));
	url.searchParams.set('travel_class', travelClassParam(opts.cabin));

	const res = await fetch(url.toString());
	const json = (await res.json()) as SerpFlightsResponse;
	if (!res.ok || json.error) {
		throw new Error(json.error ?? `SerpAPI failed (${res.status})`);
	}

	const options = [...(json.best_flights ?? []), ...(json.other_flights ?? [])];
	const best = pickCheapest(options);
	if (best?.price != null) {
		const link = json.search_metadata?.google_flights_url || opts.bookingLink;
		return toSummary(best, opts.cabin, link);
	}

	const lowest = json.price_insights?.lowest_price;
	if (typeof lowest === 'number' && Number.isFinite(lowest)) {
		return {
			priceUsd: Math.round(lowest),
			cabin: opts.cabin,
			airline: 'Google Flights',
			stops: -1,
			durationOutbound: '—',
			durationReturn: '—',
			bookingLink: json.search_metadata?.google_flights_url || opts.bookingLink,
			rawLabel: 'Google Flights lowest insight'
		};
	}

	return null;
}
