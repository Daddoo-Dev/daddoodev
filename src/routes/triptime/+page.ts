import type { PageLoad } from './$types';
import { emptyStore } from '$lib/triptime/emptyStore';
import type { TripStore } from '$lib/triptime/types';

export const prerender = false;
export const ssr = false;

export const load: PageLoad = async ({ fetch }) => {
	try {
		const res = await fetch('/api/triptime');
		if (!res.ok) return { store: emptyStore(false) as TripStore };
		const data: unknown = await res.json();
		if (data && typeof data === 'object' && 'store' in data) {
			return { store: (data as { store: TripStore }).store };
		}
		return { store: emptyStore(false) as TripStore };
	} catch {
		return { store: emptyStore(false) as TripStore };
	}
};
