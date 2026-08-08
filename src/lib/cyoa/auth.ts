import { env } from '$env/dynamic/public';

const SESSION_KEY = 'cyoa-secret-auth';

const USER = (env.PUBLIC_CYOA_USER ?? 'shawnmcpeek').trim();
const PASS = (env.PUBLIC_CYOA_PASSWORD ?? 'Mgti18il').trim();

export function isCyoaAuthed(): boolean {
	if (typeof sessionStorage === 'undefined') return false;
	return sessionStorage.getItem(SESSION_KEY) === '1';
}

export function tryCyoaLogin(username: string, password: string): boolean {
	const ok =
		username.trim().toLowerCase() === USER.toLowerCase() && password === PASS && PASS.length > 0;
	if (ok) sessionStorage.setItem(SESSION_KEY, '1');
	return ok;
}

export function cyoaLogout(): void {
	if (typeof sessionStorage === 'undefined') return;
	sessionStorage.removeItem(SESSION_KEY);
}
