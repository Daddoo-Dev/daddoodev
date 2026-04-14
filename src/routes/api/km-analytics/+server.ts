import { readFile, writeFile } from 'node:fs/promises';
import { json } from '@sveltejs/kit';
import { KM_ANALYTICS_FILE } from '$lib/km-analytics/dataPath';
import { parseKnightsManagementReport } from '$lib/km-analytics/parseReport';
import type { KmWeeklySnapshot } from '$lib/km-analytics/types';

/** Dev / local: read JSON file. Production uses Firebase Hosting → kmAnalytics function. */
export async function GET() {
	try {
		const raw = await readFile(KM_ANALYTICS_FILE, 'utf-8');
		const parsed: unknown = JSON.parse(raw);
		const list = Array.isArray(parsed) ? (parsed as KmWeeklySnapshot[]) : [];
		list.sort((a, b) => a.week.localeCompare(b.week));
		return json({ snapshots: list });
	} catch (e) {
		const code = (e as NodeJS.ErrnoException)?.code;
		if (code === 'ENOENT') {
			return json({ snapshots: [] as KmWeeklySnapshot[] });
		}
		return json({ error: 'Could not read analytics file' }, { status: 500 });
	}
}

async function readPostBody(request: Request): Promise<string> {
	const ct = request.headers.get('content-type') ?? '';
	if (ct.includes('application/json')) {
		const j: unknown = await request.json();
		if (j && typeof j === 'object' && 'report' in j && typeof (j as { report: unknown }).report === 'string') {
			return (j as { report: string }).report;
		}
		return '';
	}
	return request.text();
}

export async function POST({ request }) {
	const text = await readPostBody(request);
	if (!text.trim()) {
		return json({ error: 'Empty body' }, { status: 400 });
	}
	let snapshot: KmWeeklySnapshot;
	try {
		snapshot = parseKnightsManagementReport(text);
	} catch (e) {
		const message = e instanceof Error ? e.message : 'Failed to parse report';
		return json({ error: message }, { status: 400 });
	}

	let list: KmWeeklySnapshot[];
	try {
		const raw = await readFile(KM_ANALYTICS_FILE, 'utf-8');
		const parsed: unknown = JSON.parse(raw);
		list = Array.isArray(parsed) ? (parsed as KmWeeklySnapshot[]) : [];
	} catch {
		list = [];
	}

	const idx = list.findIndex((s) => s.week === snapshot.week);
	if (idx >= 0) list[idx] = snapshot;
	else list.push(snapshot);

	list.sort((a, b) => a.week.localeCompare(b.week));

	await writeFile(KM_ANALYTICS_FILE, `${JSON.stringify(list, null, '\t')}\n`, 'utf-8');

	return json(snapshot);
}
