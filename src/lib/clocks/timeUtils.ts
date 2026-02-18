const SECONDS_PER_DAY = 24 * 60 * 60;
const DECIMAL_HOURS_PER_DAY = 10;
const DECIMAL_MINUTES_PER_HOUR = 100;
const DECIMAL_SECONDS_PER_MINUTE = 100;

export function getSecondsSinceMidnight(date: Date): number {
	return date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds() + date.getMilliseconds() / 1000;
}

export function toDecimalTime(date: Date): { hours: number; minutes: number; seconds: number } {
	const totalSeconds = getSecondsSinceMidnight(date);
	const fractionOfDay = totalSeconds / SECONDS_PER_DAY;
	const totalDecimalSeconds = fractionOfDay * DECIMAL_HOURS_PER_DAY * DECIMAL_MINUTES_PER_HOUR * DECIMAL_SECONDS_PER_MINUTE;

	const hours = Math.floor(totalDecimalSeconds / (DECIMAL_MINUTES_PER_HOUR * DECIMAL_SECONDS_PER_MINUTE));
	const remainderAfterHours = totalDecimalSeconds % (DECIMAL_MINUTES_PER_HOUR * DECIMAL_SECONDS_PER_MINUTE);
	const minutes = Math.floor(remainderAfterHours / DECIMAL_SECONDS_PER_MINUTE);
	const seconds = Math.floor(remainderAfterHours % DECIMAL_SECONDS_PER_MINUTE);

	return { hours, minutes, seconds };
}

export interface HobbitMeal {
	name: string;
	startHour: number;
	endHour: number;
}

export const HOBBIT_MEALS: HobbitMeal[] = [
	{ name: 'Breakfast', startHour: 7, endHour: 9 },
	{ name: 'Second Breakfast', startHour: 9, endHour: 11 },
	{ name: 'Elevenses', startHour: 11, endHour: 13 },
	{ name: 'Luncheon', startHour: 13, endHour: 15 },
	{ name: 'Afternoon Tea', startHour: 15, endHour: 18 },
	{ name: 'Dinner', startHour: 18, endHour: 21 },
	{ name: 'Supper', startHour: 21, endHour: 24 }
];

export function getCurrentHobbitMeal(date: Date): { current: HobbitMeal; next: HobbitMeal; progress: number } {
	const hour = date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600;

	for (let i = 0; i < HOBBIT_MEALS.length; i++) {
		const meal = HOBBIT_MEALS[i];
		const start = meal.startHour;
		const end = meal.endHour === 0 ? 24 : meal.endHour;
		const inRange = end > start ? hour >= start && hour < end : hour >= start || hour < end;
		if (inRange) {
			const span = end > start ? end - start : 24 - start + end;
			const elapsed = end > start ? hour - start : hour >= start ? hour - start : hour + (24 - start);
			const progress = span > 0 ? elapsed / span : 0;
			const next = HOBBIT_MEALS[(i + 1) % HOBBIT_MEALS.length];
			return { current: meal, next, progress: Math.min(1, Math.max(0, progress)) };
		}
	}
	const current = HOBBIT_MEALS[0];
	return { current, next: HOBBIT_MEALS[1], progress: 0 };
}

/** 12-hour position for clock face. Your source: 7, 9, 11, 1, 3, 6, 9. Supper (9pm) offset to 8.5 to avoid overlap with Second Breakfast (9am). */
export const HOBBIT_MEAL_POSITIONS: { name: string; hour12: number; rotationDeg: number }[] = [
	{ name: 'Breakfast', hour12: 7, rotationDeg: 7 * 30 },
	{ name: 'Second Breakfast', hour12: 9, rotationDeg: 9 * 30 },
	{ name: 'Elevenses', hour12: 11, rotationDeg: 11 * 30 },
	{ name: 'Luncheon', hour12: 1, rotationDeg: 1 * 30 },
	{ name: 'Afternoon Tea', hour12: 3, rotationDeg: 3 * 30 },
	{ name: 'Dinner', hour12: 6, rotationDeg: 6 * 30 },
	{ name: 'Supper', hour12: 8.5, rotationDeg: 8.5 * 30 }
];

export function getMinutesUntilNextMeal(now: Date, nextMeal: HobbitMeal): number {
	const startHour = nextMeal.startHour;
	const today = new Date(now);
	today.setHours(startHour, 0, 0, 0);
	let nextStart = today.getTime();
	if (nextStart <= now.getTime()) {
		nextStart += 24 * 60 * 60 * 1000;
	}
	return Math.max(0, Math.floor((nextStart - now.getTime()) / (60 * 1000)));
}

export const WORLD_CLOCKS: { id: string; label: string }[] = [
	{ id: 'auto', label: 'Local' },
	{ id: 'America/New_York', label: 'Washington' },
	{ id: 'Europe/London', label: 'London' },
	{ id: 'Europe/Paris', label: 'Paris' },
	{ id: 'Asia/Dubai', label: 'Dubai' },
	{ id: 'Asia/Tokyo', label: 'Tokyo' },
	{ id: 'UTC', label: 'UTC' }
];

export function getTimeZoneOptions(): { value: string; label: string }[] {
	const zones: { value: string; label: string }[] = [
		{ value: 'auto', label: 'Local (browser)' }
	];
	try {
		const formatter = new Intl.DateTimeFormat(undefined, { timeZoneName: 'long' });
		const local = formatter.resolvedOptions().timeZone;
		if (local) zones[0].label = `Local (${local})`;
	} catch {
		// keep "Local (browser)"
	}
	const common = [
		'America/New_York',
		'America/Chicago',
		'America/Denver',
		'America/Los_Angeles',
		'Europe/London',
		'Europe/Paris',
		'Asia/Tokyo',
		'Australia/Sydney',
		'UTC'
	];
	common.forEach((tz) => {
		try {
			new Date().toLocaleString(undefined, { timeZone: tz });
			zones.push({ value: tz, label: tz.replace(/_/g, ' ') });
		} catch {
			// skip invalid
		}
	});
	return zones;
}
