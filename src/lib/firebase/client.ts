import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

/**
 * Public web client IDs (same as Firebase Console → Project settings → Your apps).
 * Used when `PUBLIC_FIREBASE_*` are not set at build time so production hosting still works.
 */
const FIREBASE_WEB_DEFAULTS = {
	apiKey: 'AIzaSyBL31JePSmTkVkBWx9MJmaLT6XylIzBRDM',
	authDomain: 'daddoodev.firebaseapp.com',
	projectId: 'daddoodev',
	appId: '1:689811706212:web:3a8dbbf6e11a0d16ad2a71'
} as const;

function firebaseWebOptions() {
	return {
		apiKey: import.meta.env.PUBLIC_FIREBASE_API_KEY || FIREBASE_WEB_DEFAULTS.apiKey,
		authDomain: import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN || FIREBASE_WEB_DEFAULTS.authDomain,
		projectId: import.meta.env.PUBLIC_FIREBASE_PROJECT_ID || FIREBASE_WEB_DEFAULTS.projectId,
		appId: import.meta.env.PUBLIC_FIREBASE_APP_ID || FIREBASE_WEB_DEFAULTS.appId
	};
}

export function isFirebaseConfigured(): boolean {
	const c = firebaseWebOptions();
	return Boolean(c.apiKey?.trim() && c.projectId?.trim());
}

export function getFirebaseApp(): FirebaseApp {
	if (!isFirebaseConfigured()) {
		throw new Error('Firebase is not configured (missing PUBLIC_FIREBASE_* env).');
	}
	if (!app) {
		const existing = getApps()[0];
		if (existing) app = existing;
		else {
			app = initializeApp(firebaseWebOptions());
		}
	}
	return app;
}

export function getFirebaseAuth(): Auth {
	if (!auth) auth = getAuth(getFirebaseApp());
	return auth;
}

export function getFirebaseDb(): Firestore {
	if (!db) db = getFirestore(getFirebaseApp());
	return db;
}
