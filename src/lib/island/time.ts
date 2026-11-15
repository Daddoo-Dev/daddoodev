/** Local civil day is 6:00–18:00. Night is the rest of the clock. */
const DAY_START_HOUR = 6;
const NIGHT_START_HOUR = 18;

export function isLocalNight(date = new Date()): boolean {
	const hour = date.getHours();
	return hour < DAY_START_HOUR || hour >= NIGHT_START_HOUR;
}
