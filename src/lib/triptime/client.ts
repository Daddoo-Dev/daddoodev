import type { TripApiResponse, TripStore } from './types';

export async function fetchTripStore(fetcher: typeof fetch = fetch): Promise<TripStore> {
	const res = await fetcher('/api/triptime');
	if (!res.ok) throw new Error('Failed to load TripTime data');
	const data = (await res.json()) as TripApiResponse;
	return data.store;
}

export async function postTripAction(
	body: Record<string, unknown>,
	fetcher: typeof fetch = fetch
): Promise<TripApiResponse> {
	const res = await fetcher('/api/triptime', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
	const data = (await res.json()) as TripApiResponse;
	if (!res.ok) {
		throw new Error(data.error ?? 'Request failed');
	}
	return data;
}
