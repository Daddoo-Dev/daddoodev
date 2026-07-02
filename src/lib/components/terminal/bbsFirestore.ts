import {
	addDoc,
	collection,
	doc,
	getDoc,
	getDocs,
	limit,
	orderBy,
	query,
	serverTimestamp,
	setDoc,
	increment
} from 'firebase/firestore';
import { getFirebaseDb, isFirebaseConfigured } from '$lib/firebase/client';

const LAST_SIGN_KEY = 'bbs_last_sign';
const COOLDOWN_MS = 5 * 60 * 1000;
const URL_PATTERN = /https?:\/\/|www\./i;

export type GuestbookEntry = {
	handle: string;
	message: string;
	createdAt: Date;
};

export function canSignGuestbook(): boolean {
	if (typeof localStorage === 'undefined') return true;
	const last = localStorage.getItem(LAST_SIGN_KEY);
	if (!last) return true;
	return Date.now() - Number(last) >= COOLDOWN_MS;
}

export function markSignedGuestbook(): void {
	localStorage.setItem(LAST_SIGN_KEY, String(Date.now()));
}

export function stripUrls(text: string): string {
	return text.replace(URL_PATTERN, '[link removed]');
}

export async function incrementCallerCount(): Promise<number | null> {
	if (!isFirebaseConfigured()) return null;

	try {
		const db = getFirebaseDb();
		const ref = doc(db, 'bbs_meta', 'counter');
		await setDoc(ref, { callerCount: increment(1) }, { merge: true });
		const snap = await getDoc(ref);
		const count = snap.data()?.callerCount;
		return typeof count === 'number' ? count : null;
	} catch {
		return null;
	}
}

export async function fetchGuestbookEntries(limitCount = 10): Promise<GuestbookEntry[]> {
	if (!isFirebaseConfigured()) return [];

	try {
		const db = getFirebaseDb();
		const q = query(
			collection(db, 'guestbook'),
			orderBy('createdAt', 'desc'),
			limit(limitCount)
		);
		const snap = await getDocs(q);
		return snap.docs.map((entry) => {
			const data = entry.data();
			const createdAt = data.createdAt?.toDate?.() ?? new Date();
			return {
				handle: String(data.handle ?? ''),
				message: String(data.message ?? ''),
				createdAt
			};
		});
	} catch {
		return [];
	}
}

export async function signGuestbook(
	handle: string,
	message: string
): Promise<{ ok: true } | { ok: false; error: string }> {
	if (!canSignGuestbook()) {
		return { ok: false, error: 'The SysOp asks you to slow down, caller.' };
	}

	const trimmedHandle = handle.trim();
	const trimmedMessage = stripUrls(message.trim());

	if (trimmedHandle.length < 2 || trimmedHandle.length > 24) {
		return { ok: false, error: 'Handle must be 2–24 characters.' };
	}

	if (trimmedMessage.length < 1 || trimmedMessage.length > 140) {
		return { ok: false, error: 'Message must be 1–140 characters.' };
	}

	if (!isFirebaseConfigured()) {
		return { ok: false, error: 'Guestbook offline — check back soon.' };
	}

	try {
		const db = getFirebaseDb();
		await addDoc(collection(db, 'guestbook'), {
			handle: trimmedHandle,
			message: trimmedMessage,
			createdAt: serverTimestamp()
		});
		markSignedGuestbook();
		return { ok: true };
	} catch {
		return { ok: false, error: 'Could not save entry. Try again later.' };
	}
}

// If abuse becomes a problem, route writes through a callable function with App Check.
export function formatGuestbookDate(date: Date): string {
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${month}/${day}`;
}
