import type { CityId, TripSettings } from './types';

/** Next June from Aug 2026 planning context. */
export const DEFAULT_SETTINGS: TripSettings = {
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

export type CityMeta = {
	id: CityId;
	label: string;
	country: string;
	/** City code for Google/Skyscanner links. */
	cityCode: string;
	/** Primary airport for Amadeus flight offers. */
	primaryAirport: string;
	airports: string[];
	mustSees: string[];
	constraints: string[];
};

export const CITIES: Record<CityId, CityMeta> = {
	paris: {
		id: 'paris',
		label: 'Paris',
		country: 'France',
		cityCode: 'PAR',
		primaryAirport: 'CDG',
		airports: ['CDG', 'ORY'],
		mustSees: [
			'Eiffel Tower (going up optional)',
			'Louvre',
			'Disneyland Paris (full day)',
			'Lourdes overnight',
			'Notre Dame',
			'Catacombs'
		],
		constraints: [
			'Saturday vigil or Sunday Mass is required — never skip',
			'Do not schedule Disneyland on Mass day',
			'Lourdes is an overnight, not a same-day trip'
		]
	},
	rome: {
		id: 'rome',
		label: 'Rome',
		country: 'Italy',
		cityCode: 'ROM',
		primaryAirport: 'FCO',
		airports: ['FCO', 'CIA'],
		mustSees: [
			'Vatican City / St. Peter’s',
			'Early morning Vatican daily Mass (bonus, separate from obligatory Mass)',
			'Other Catholic historic sites',
			'Classic Rome historic sites',
			'Saturday vigil or Sunday Mass (required)'
		],
		constraints: [
			'Saturday vigil or Sunday Mass is required — never skip',
			'Early Vatican daily Mass is a bonus try, separate from the obligatory Mass'
		]
	}
};

export const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
