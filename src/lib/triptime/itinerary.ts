import type { CityId, ItineraryDay, DateWindow } from './types';
import { addDaysIso, weekdayName } from './windows';

function massDayIndex(window: DateWindow): number {
	// Prefer Sunday; else Saturday (vigil). Within stay nights (0..nights-1).
	for (let i = 0; i < window.nights; i++) {
		const d = addDaysIso(window.departDate, i);
		if (weekdayName(d) === 'Sunday') return i;
	}
	for (let i = 0; i < window.nights; i++) {
		const d = addDaysIso(window.departDate, i);
		if (weekdayName(d) === 'Saturday') return i;
	}
	// Fallback: middle day
	return Math.min(3, window.nights - 1);
}

function freeSlots(nights: number, reserved: Set<number>): number[] {
	const out: number[] = [];
	for (let i = 0; i < nights; i++) {
		if (!reserved.has(i)) out.push(i);
	}
	return out;
}

function dayShell(window: DateWindow, dayIndex: number, title: string, notes: string[], isMassDay: boolean, extra?: Partial<ItineraryDay>): ItineraryDay {
	const date = addDaysIso(window.departDate, dayIndex);
	return {
		dayIndex,
		date,
		weekday: weekdayName(date),
		title,
		notes,
		isMassDay,
		...extra
	};
}

export function buildParisItinerary(window: DateWindow): ItineraryDay[] {
	const nights = window.nights;
	const mass = massDayIndex(window);
	const reserved = new Set<number>([mass]);

	// Lourdes overnight: pick two consecutive free days (travel + overnight), prefer mid-week.
	let lourdesStart = -1;
	const slots = freeSlots(nights, reserved);
	for (const s of slots) {
		if (s + 1 < nights && !reserved.has(s + 1) && s !== 0) {
			lourdesStart = s;
			break;
		}
	}
	if (lourdesStart < 0) {
		for (let i = 1; i < nights - 1; i++) {
			if (i !== mass && i + 1 !== mass) {
				lourdesStart = i;
				break;
			}
		}
	}
	if (lourdesStart >= 0) {
		reserved.add(lourdesStart);
		reserved.add(lourdesStart + 1);
	}

	// Disneyland: one full free day, never Mass day.
	const disney = freeSlots(nights, reserved).find((i) => i !== 0) ?? freeSlots(nights, reserved)[0];
	if (disney != null) reserved.add(disney);

	const days: ItineraryDay[] = [];
	for (let i = 0; i < nights; i++) {
		if (i === mass) {
			days.push(
				dayShell(window, i, 'Obligatory Mass day', [
					'Saturday vigil or Sunday Mass — non-negotiable',
					'Keep the day lighter: Notre Dame exterior / Île de la Cité stroll',
					'No Disneyland today'
				], true)
			);
			continue;
		}
		if (i === lourdesStart) {
			days.push(
				dayShell(
					window,
					i,
					'Lourdes overnight — travel',
					['Train toward Lourdes', 'Evening at the Sanctuary', 'Overnight in Lourdes'],
					false,
					{ isLourdesOvernight: true }
				)
			);
			continue;
		}
		if (i === lourdesStart + 1) {
			days.push(
				dayShell(
					window,
					i,
					'Lourdes morning → return Paris',
					['Morning at Lourdes', 'Return train to Paris', 'Easy dinner near hotel'],
					false,
					{ isLourdesOvernight: true }
				)
			);
			continue;
		}
		if (i === disney) {
			days.push(
				dayShell(window, i, 'Disneyland Paris (full day)', [
					'Full park day — leave early, return late',
					'Not scheduled on Mass day'
				], false)
			);
			continue;
		}
		if (i === 0) {
			days.push(
				dayShell(window, i, 'Arrive Paris', [
					'Settle hotel',
					'Neighborhood walk / easy meal',
					'Optional: Eiffel Tower exterior at dusk'
				], false)
			);
			continue;
		}
		// Remaining cultural days rotate must-sees
		const cultural = [
			{
				title: 'Louvre + Seine',
				notes: ['Louvre (timed entry)', 'Walk along the Seine', 'Romance dinner']
			},
			{
				title: 'Eiffel + Left Bank',
				notes: ['Eiffel Tower (ascent optional)', 'Left Bank wander', 'Café stop']
			},
			{
				title: 'Catacombs + Latin Quarter',
				notes: ['Paris Catacombs', 'Latin Quarter lunch', 'Evening stroll']
			},
			{
				title: 'Notre Dame area + islands',
				notes: ['Notre Dame / Île de la Cité', 'Sainte-Chapelle if open', 'Ice cream on Île Saint-Louis']
			}
		];
		const pick = cultural[(i + 1) % cultural.length]!;
		days.push(dayShell(window, i, pick.title, pick.notes, false));
	}
	return days;
}

export function buildRomeItinerary(window: DateWindow): ItineraryDay[] {
	const nights = window.nights;
	const mass = massDayIndex(window);
	const reserved = new Set<number>([mass]);

	// Early Vatican daily Mass: a different morning than obligatory Mass day.
	const vaticanEarly = freeSlots(nights, reserved).find((i) => i !== 0) ?? null;
	if (vaticanEarly != null) reserved.add(vaticanEarly);

	const days: ItineraryDay[] = [];
	for (let i = 0; i < nights; i++) {
		if (i === mass) {
			days.push(
				dayShell(window, i, 'Obligatory Mass day', [
					'Saturday vigil or Sunday Mass — non-negotiable',
					'Prefer a parish or basilica Mass you can get to without rushing',
					'Keep the rest of the day gentle (Trastevere wander / gelato)'
				], true)
			);
			continue;
		}
		if (i === vaticanEarly) {
			days.push(
				dayShell(window, i, 'Vatican early Mass + St. Peter’s', [
					'Try early morning daily Mass inside the Vatican (bonus — separate from obligatory Mass)',
					'St. Peter’s Basilica / square after',
					'Vatican Museums / Sistine if energy allows (or move museums to another day)'
				], false)
			);
			continue;
		}
		if (i === 0) {
			days.push(
				dayShell(window, i, 'Arrive Rome', [
					'Settle hotel',
					'Piazza Navona / Pantheon evening circuit',
					'Easy dinner nearby'
				], false)
			);
			continue;
		}
		const cultural = [
			{
				title: 'Ancient Rome',
				notes: ['Colosseum', 'Roman Forum / Palatine', 'Romance dinner near Centro Storico']
			},
			{
				title: 'Catholic Rome beyond the Vatican',
				notes: ['Santa Maria Maggiore', 'San Giovanni in Laterano', 'Santa Croce in Gerusalemme or similar']
			},
			{
				title: 'Baroque Rome',
				notes: ['Trevi Fountain', 'Spanish Steps', 'Via Condotti stroll']
			},
			{
				title: 'Trastevere + river',
				notes: ['Morning across the Tiber', 'Santa Maria in Trastevere', 'Long lunch']
			},
			{
				title: 'Borghese / views',
				notes: ['Villa Borghese gardens (gallery optional)', 'Pincio terrace views', 'Slow evening']
			}
		];
		const pick = cultural[(i + 2) % cultural.length]!;
		days.push(dayShell(window, i, pick.title, pick.notes, false));
	}
	return days;
}

export function buildItinerary(city: CityId, window: DateWindow): ItineraryDay[] {
	return city === 'paris' ? buildParisItinerary(window) : buildRomeItinerary(window);
}
