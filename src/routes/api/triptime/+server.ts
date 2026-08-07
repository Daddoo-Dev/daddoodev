import { env } from '$env/dynamic/private';
import { json } from '@sveltejs/kit';
import { buildCompare } from '$lib/triptime/compare';
import { runPriceScan } from '$lib/triptime/scan';
import { serpApiConfigured, type SerpApiConfig } from '$lib/triptime/serpapi';
import { normalizeStore, readTripStore, writeTripStore } from '$lib/triptime/storage';
import type { TripSettings } from '$lib/triptime/types';

function getSerpConfig(): SerpApiConfig | null {
	const apiKey = (env.SERPAPI_API_KEY ?? '').trim();
	if (!apiKey) return null;
	return { apiKey };
}

export async function GET() {
	const cfg = getSerpConfig();
	const store = await readTripStore(serpApiConfigured(cfg));
	return json({ store });
}

export async function POST({ request }) {
	const cfg = getSerpConfig();
	let store = await readTripStore(serpApiConfigured(cfg));
	const body = (await request.json().catch(() => null)) as
		| {
				action?: string;
				settings?: Partial<TripSettings>;
				selectedWindowId?: string | null;
				notes?: { paris?: string; rome?: string };
		  }
		| null;

	const action = body?.action ?? 'save';

	if (action === 'settings' && body?.settings) {
		store = normalizeStore(
			{
				...store,
				settings: { ...store.settings, ...body.settings }
			},
			serpApiConfigured(cfg)
		);
		await writeTripStore(store);
		return json({ store });
	}

	if (action === 'select') {
		store.selectedWindowId =
			typeof body?.selectedWindowId === 'string' ? body.selectedWindowId : null;
		store.compare = buildCompare(store.quotes, store.settings, store.selectedWindowId);
		await writeTripStore(store);
		return json({ store });
	}

	if (action === 'notes' && body?.notes) {
		store.notes = {
			paris: typeof body.notes.paris === 'string' ? body.notes.paris : store.notes.paris,
			rome: typeof body.notes.rome === 'string' ? body.notes.rome : store.notes.rome
		};
		await writeTripStore(store);
		return json({ store });
	}

	if (action === 'scan') {
		try {
			store = await runPriceScan(store, cfg);
			await writeTripStore(store);
			return json({ store });
		} catch (e) {
			const message = e instanceof Error ? e.message : 'Scan failed';
			store = await readTripStore(serpApiConfigured(cfg));
			return json({ store, error: message }, { status: 500 });
		}
	}

	return json({ error: 'Unknown action' }, { status: 400 });
}
