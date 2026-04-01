import { env } from '$env/dynamic/private';

const APPS_SCRIPT_URL =
	(env.VITE_APPS_SCRIPT_URL ?? (typeof process !== 'undefined' && process.env?.VITE_APPS_SCRIPT_URL)) as
		| string
		| undefined;

export async function GET({ url }) {
	if (!APPS_SCRIPT_URL) {
		return new Response(JSON.stringify({ error: 'Not configured' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}
	const target = url.searchParams.toString()
		? `${APPS_SCRIPT_URL}?${url.searchParams.toString()}`
		: APPS_SCRIPT_URL;
	const res = await fetch(target);
	const text = await res.text();
	return new Response(text, {
		status: res.status,
		headers: { 'Content-Type': res.headers.get('Content-Type') || 'application/json' }
	});
}

export async function POST({ request }) {
	if (!APPS_SCRIPT_URL) {
		return new Response(JSON.stringify({ success: false }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}
	const body = await request.text();
	const res = await fetch(APPS_SCRIPT_URL, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body
	});
	const text = await res.text();
	return new Response(text, {
		status: res.status,
		headers: { 'Content-Type': res.headers.get('Content-Type') || 'application/json' }
	});
}
