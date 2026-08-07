import { CITIES } from './constants';
import type { CabinClass, CityId, FlightOfferSummary, TripSettings } from './types';
import type { DateWindow } from './types';

/** Google Flights deep link for a round trip. */
export function googleFlightsLink(
	origin: string,
	destCityCode: string,
	departDate: string,
	returnDate: string,
	adults: number,
	cabin: CabinClass = 'ECONOMY'
): string {
	const cabinMap: Record<CabinClass, string> = {
		ECONOMY: 'economy',
		PREMIUM_ECONOMY: 'premium-economy'
	};
	const tsf = cabinMap[cabin];
	// Simple Google Flights search URL (opens explorer for the route/dates).
	const q = `${origin}%20to%20${destCityCode}%20${departDate}%20${returnDate}%20${adults}%20adults%20${tsf}`;
	return `https://www.google.com/travel/flights?q=${q}&curr=USD`;
}

/** Skyscanner explore link for the route/dates. */
export function skyscannerLink(
	origin: string,
	destCityCode: string,
	departDate: string,
	returnDate: string,
	adults: number
): string {
	const d = departDate.replace(/-/g, '');
	const r = returnDate.replace(/-/g, '');
	return `https://www.skyscanner.com/transport/flights/${origin.toLowerCase()}/${destCityCode.toLowerCase()}/${d}/${r}/?adults=${adults}&cabinclass=economy&rtn=1&preferdirects=false&outboundaltsenabled=false&inboundaltsenabled=false`;
}

export function googleHotelsLink(
	cityLabel: string,
	checkIn: string,
	checkOut: string,
	adults: number,
	minUsd: number,
	maxUsd: number
): string {
	const q = encodeURIComponent(`${cityLabel} hotels`);
	return `https://www.google.com/travel/hotels/${q}?q=${q}&dates=${checkIn},${checkOut}&adults=${adults}&curr=USD&price=${minUsd},${maxUsd}`;
}

export function bookingLinksForWindow(
	city: CityId,
	window: DateWindow,
	settings: TripSettings
): { flightsGoogle: string; flightsSkyscanner: string; hotels: string } {
	const meta = CITIES[city];
	return {
		flightsGoogle: googleFlightsLink(
			settings.origin,
			meta.cityCode,
			window.departDate,
			window.returnDate,
			settings.adults,
			settings.cabin
		),
		flightsSkyscanner: skyscannerLink(
			settings.origin,
			meta.cityCode,
			window.departDate,
			window.returnDate,
			settings.adults
		),
		hotels: googleHotelsLink(
			meta.label,
			window.departDate,
			window.returnDate,
			settings.adults,
			settings.hotelMinUsd,
			settings.hotelMaxUsd
		)
	};
}

export function estimatedHotel(
	settings: TripSettings,
	window: DateWindow,
	city: CityId
): {
	priceTotalUsd: number;
	pricePerNightUsd: number;
	name: string;
	bookingLink: string;
	estimated: boolean;
} {
	const mid = Math.round((settings.hotelMinUsd + settings.hotelMaxUsd) / 2);
	const links = bookingLinksForWindow(city, window, settings);
	return {
		priceTotalUsd: mid * window.nights,
		pricePerNightUsd: mid,
		name: `${CITIES[city].label} mid-band estimate ($${settings.hotelMinUsd}–$${settings.hotelMaxUsd}/night)`,
		bookingLink: links.hotels,
		estimated: true
	};
}

export function fallbackFlight(
	settings: TripSettings,
	window: DateWindow,
	city: CityId,
	cabin: CabinClass
): FlightOfferSummary {
	const links = bookingLinksForWindow(city, window, settings);
	return {
		priceUsd: 0,
		cabin,
		airline: 'See provider',
		stops: -1,
		durationOutbound: '—',
		durationReturn: '—',
		bookingLink: links.flightsGoogle,
		rawLabel: 'Open Google Flights / Skyscanner to compare live fares'
	};
}
