export type CityId = 'paris' | 'rome';

export type CabinClass = 'ECONOMY' | 'PREMIUM_ECONOMY';

export type TripSettings = {
	adults: number;
	origin: string;
	/** Trip year (June window). */
	year: number;
	windowStartMonth: number;
	windowStartDay: number;
	windowEndMonth: number;
	windowEndDay: number;
	nights: number;
	hotelMinUsd: number;
	hotelMaxUsd: number;
	/** Flag when a city's own best window beats the shared pick by this amount. */
	gapThresholdUsd: number;
	cabin: CabinClass;
	/** Show premium-economy option when within this of economy. */
	cabinUpgradeWithinUsd: number;
};

export type DateWindow = {
	id: string;
	departDate: string;
	returnDate: string;
	nights: number;
};

export type FlightOfferSummary = {
	priceUsd: number;
	cabin: CabinClass;
	airline: string;
	stops: number;
	durationOutbound: string;
	durationReturn: string;
	bookingLink: string;
	rawLabel: string;
};

export type HotelOfferSummary = {
	priceTotalUsd: number;
	pricePerNightUsd: number;
	name: string;
	bookingLink: string;
	estimated: boolean;
};

export type CityWindowQuote = {
	city: CityId;
	window: DateWindow;
	flight: FlightOfferSummary | null;
	flightUpgrade: FlightOfferSummary | null;
	hotel: HotelOfferSummary | null;
	totalUsd: number | null;
	error?: string;
};

export type GapFlag = {
	city: CityId;
	bestWindow: DateWindow;
	bestTotalUsd: number;
	sharedWindow: DateWindow;
	sharedTotalUsd: number;
	savingsUsd: number;
};

export type CompareResult = {
	sharedWindow: DateWindow | null;
	sharedParis: CityWindowQuote | null;
	sharedRome: CityWindowQuote | null;
	sharedTotalParis: number | null;
	sharedTotalRome: number | null;
	bestParis: CityWindowQuote | null;
	bestRome: CityWindowQuote | null;
	gapFlags: GapFlag[];
};

export type ItineraryDay = {
	dayIndex: number;
	date: string;
	weekday: string;
	title: string;
	notes: string[];
	isMassDay: boolean;
	isLourdesOvernight?: boolean;
};

export type TripStore = {
	settings: TripSettings;
	lastScanAt: string | null;
	flightsConfigured: boolean;
	quotes: CityWindowQuote[];
	selectedWindowId: string | null;
	notes: Record<CityId, string>;
	compare: CompareResult | null;
};

export type TripApiResponse = {
	store: TripStore;
	error?: string;
};
