import type { DateWindow, TripSettings } from './types';

function pad(n: number): string {
	return String(n).padStart(2, '0');
}

export function isoDate(year: number, month: number, day: number): string {
	return `${year}-${pad(month)}-${pad(day)}`;
}

export function parseIso(iso: string): Date {
	const [y, m, d] = iso.split('-').map(Number);
	return new Date(Date.UTC(y!, m! - 1, d!));
}

export function addDaysIso(iso: string, days: number): string {
	const dt = parseIso(iso);
	dt.setUTCDate(dt.getUTCDate() + days);
	return isoDate(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate());
}

export function weekdayName(iso: string): string {
	const dt = parseIso(iso);
	return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][
		dt.getUTCDay()
	]!;
}

export function formatWindowLabel(w: DateWindow): string {
	return `${w.departDate} → ${w.returnDate}`;
}

/** Every valid nights-long stay fully inside the June planning window. */
export function generateWindows(settings: TripSettings): DateWindow[] {
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
