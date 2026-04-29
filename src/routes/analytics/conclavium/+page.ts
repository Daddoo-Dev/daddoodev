import type { KmWeeklySnapshot } from '$lib/km-analytics/types';
import type { PageLoad } from './$types';

/** Client-only load: fetches /api/km-analytics (SvelteKit in dev, Cloud Function when deployed). */
export const prerender = false;
export const ssr = false;

export const load: PageLoad = async ({ fetch }) => {
	try {
		const res = await fetch('/api/km-analytics');
		if (!res.ok) {
			return { snapshots: [] as KmWeeklySnapshot[] };
		}
		const data: unknown = await res.json();
		if (
			data &&
			typeof data === 'object' &&
			'snapshots' in data &&
			Array.isArray((data as { snapshots: unknown }).snapshots)
		) {
			return { snapshots: (data as { snapshots: KmWeeklySnapshot[] }).snapshots };
		}
		return { snapshots: [] as KmWeeklySnapshot[] };
	} catch {
		return { snapshots: [] as KmWeeklySnapshot[] };
	}
};
