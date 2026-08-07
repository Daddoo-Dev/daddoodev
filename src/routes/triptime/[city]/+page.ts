import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { emptyStore } from '$lib/triptime/emptyStore';
import type { CityId, TripStore } from '$lib/triptime/types';

export const prerender = false;
export const ssr = false;

export const load: PageLoad = async ({ fetch, params }) => {
	if (params.city !== 'paris' && params.city !== 'rome') {
		throw redirect(302, '/triptime');
	}
	const city = params.city as CityId;
	try {
		const res = await fetch('/api/triptime');
		if (!res.ok) return { store: emptyStore(false) as TripStore, city };
		const data: unknown = await res.json();
		if (data && typeof data === 'object' && 'store' in data) {
			return { store: (data as { store: TripStore }).store, city };
		}
		return { store: emptyStore(false) as TripStore, city };
	} catch {
		return { store: emptyStore(false) as TripStore, city };
	}
};
