import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getFirebaseDb } from '$lib/firebase/client';
import type { DiscoveryResults, Holding, WatchlistItem } from './types';

/** In-memory cache; persisted to `users/{uid}` in Firestore. */
const cache = {
	tickers: ['NVDA'] as string[],
	holdings: {} as Record<string, Holding>,
	watchlist: [] as WatchlistItem[],
	discovery: null as DiscoveryResults | null
};

let activeUid: string | null = null;
let persistTimer: ReturnType<typeof setTimeout> | null = null;

function userDocRef(uid: string) {
	return doc(getFirebaseDb(), 'users', uid);
}

/**
 * Firestore console only makes it practical to paste JSON as **string** fields.
 * If the value is a string, parse JSON; otherwise use native map/array from migration/API.
 */
function asFirestoreValue(raw: unknown, field: string): unknown {
	if (typeof raw !== 'string') return raw;
	const s = raw.trim();
	if (!s) return null;
	try {
		return JSON.parse(s) as unknown;
	} catch {
		console.warn(`MarketMinder: ${field} is not valid JSON string; using defaults`);
		return null;
	}
}

function normalizeWatchlist(raw: unknown): WatchlistItem[] {
	const v = asFirestoreValue(raw, 'watchlist');
	if (!Array.isArray(v)) return [];
	return v.map((row) =>
		typeof row === 'string' ? { symbol: row } : (row as WatchlistItem)
	);
}

function normalizeHoldings(raw: unknown): Record<string, Holding> {
	const v = asFirestoreValue(raw, 'holdings');
	if (!v || typeof v !== 'object' || Array.isArray(v)) return {};
	const out: Record<string, Holding> = {};
	for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
		if (val && typeof val === 'object') out[k.toUpperCase()] = val as Holding;
	}
	return out;
}

function normalizeTickers(raw: unknown): string[] {
	const v = asFirestoreValue(raw, 'tickers');
	if (Array.isArray(v) && v.length) return v.map(String);
	return ['NVDA'];
}

/**
 * Load `users/{uid}` into cache. Call after sign-in.
 */
export async function initStorageForUser(uid: string): Promise<void> {
	activeUid = uid;
	const snap = await getDoc(userDocRef(uid));
	if (!snap.exists()) {
		cache.tickers = ['NVDA'];
		cache.holdings = {};
		cache.watchlist = [];
		cache.discovery = null;
		await persistNow();
		return;
	}
	const d = snap.data();
	cache.tickers = normalizeTickers(d.tickers);
	cache.holdings = normalizeHoldings(d.holdings);
	cache.watchlist = normalizeWatchlist(d.watchlist);
	const discRaw = d.discovery;
	if (discRaw === null || discRaw === undefined) {
		cache.discovery = null;
	} else {
		const disc = asFirestoreValue(discRaw, 'discovery');
		cache.discovery =
			disc === null || disc === undefined ? null : (disc as DiscoveryResults);
	}
}

export function clearStorageUser(): void {
	activeUid = null;
	if (persistTimer) clearTimeout(persistTimer);
	persistTimer = null;
}

function schedulePersist(): void {
	if (!activeUid) return;
	if (persistTimer) clearTimeout(persistTimer);
	persistTimer = setTimeout(() => {
		persistTimer = null;
		void persistNow();
	}, 400);
}

async function persistNow(): Promise<void> {
	if (!activeUid) return;
	try {
		await setDoc(
			userDocRef(activeUid),
			{
				tickers: cache.tickers,
				holdings: cache.holdings,
				watchlist: cache.watchlist,
				discovery: cache.discovery
			},
			{ merge: true }
		);
	} catch (e) {
		console.error('MarketMinder Firestore persist failed:', e);
	}
}

/** Call before sign-out so debounced writes are not lost. */
export async function flushMarketminderPersist(): Promise<void> {
	if (persistTimer) {
		clearTimeout(persistTimer);
		persistTimer = null;
	}
	await persistNow();
}

export function loadTickers(): string[] {
	return cache.tickers.length ? [...cache.tickers] : ['NVDA'];
}

export function saveTickers(tickers: string[]): void {
	cache.tickers = tickers.length ? [...tickers] : ['NVDA'];
	schedulePersist();
}

export function loadHoldings(): Record<string, Holding> {
	return { ...cache.holdings };
}

export function saveHoldings(h: Record<string, Holding>): void {
	cache.holdings = { ...h };
	schedulePersist();
}

export function loadWatchlist(): WatchlistItem[] {
	return [...cache.watchlist];
}

export function saveWatchlist(items: WatchlistItem[]): void {
	cache.watchlist = [...items];
	schedulePersist();
}

export function loadDiscovery(): DiscoveryResults | null {
	return cache.discovery;
}

export function saveDiscovery(d: DiscoveryResults | null): void {
	cache.discovery = d;
	schedulePersist();
}
