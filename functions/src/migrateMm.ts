/**
 * One-shot: copy personalstockmonitor JSON into Firestore users/{uid}.
 *
 * Usage (from repo root):
 *   cd functions && npm run build && MM_UID=yourAuthUid node lib/migrateMm.js
 *
 * Optional: MM_DATA_DIR=/absolute/path/to/personalstockmonitor/data
 *
 * Auth: set GOOGLE_APPLICATION_CREDENTIALS to a service account JSON, or run
 * `gcloud auth application-default login` with a user who can write Firestore.
 *
 * Project id: GCLOUD_PROJECT / GOOGLE_CLOUD_PROJECT, else default from repo
 * `.firebaserc` (so local runs work without gcloud project config).
 */
import * as fs from 'fs';
import * as path from 'path';
import * as admin from 'firebase-admin';

function defaultDataDir(): string {
	const fromLib = path.join(__dirname, '../../../personalstockmonitor/data');
	if (fs.existsSync(path.join(fromLib, 'tickers.json'))) return fromLib;
	const cwdGuess = path.join(process.cwd(), '..', 'personalstockmonitor', 'data');
	if (fs.existsSync(path.join(cwdGuess, 'tickers.json'))) return cwdGuess;
	throw new Error(
		'Could not find personalstockmonitor/data. Set MM_DATA_DIR to the folder containing tickers.json.'
	);
}

async function main(): Promise<void> {
	const uid = process.env.MM_UID?.trim() || process.argv[2]?.trim();
	if (!uid) {
		console.error('Usage: MM_UID=<firebaseAuthUid> node lib/migrateMm.js');
		console.error('   or: node lib/migrateMm.js <firebaseAuthUid>');
		process.exit(1);
	}

	const dataDir = process.env.MM_DATA_DIR?.trim() || defaultDataDir();
	const tickersPath = path.join(dataDir, 'tickers.json');
	const holdingsPath = path.join(dataDir, 'holdings.json');
	const watchlistPath = path.join(dataDir, 'watchlist.json');
	const discoveryPath = path.join(dataDir, 'discovery_results.json');

	for (const p of [tickersPath, holdingsPath, watchlistPath]) {
		if (!fs.existsSync(p)) {
			throw new Error(`Missing file: ${p}`);
		}
	}

	const tickers = JSON.parse(fs.readFileSync(tickersPath, 'utf-8')) as string[];
	const holdings = JSON.parse(fs.readFileSync(holdingsPath, 'utf-8')) as Record<string, unknown>;
	const watchlist = JSON.parse(fs.readFileSync(watchlistPath, 'utf-8')) as unknown[];

	let discovery: unknown = null;
	if (fs.existsSync(discoveryPath)) {
		discovery = JSON.parse(fs.readFileSync(discoveryPath, 'utf-8'));
	}

	function resolveProjectId(): string | undefined {
		const fromEnv =
			process.env.GCLOUD_PROJECT?.trim() ||
			process.env.GOOGLE_CLOUD_PROJECT?.trim() ||
			process.env.FIREBASE_CONFIG?.trim();
		if (fromEnv) {
			if (fromEnv.startsWith('{')) {
				try {
					const cfg = JSON.parse(fromEnv) as { projectId?: string };
					if (cfg.projectId) return cfg.projectId;
				} catch {
					/* ignore */
				}
			} else {
				return fromEnv;
			}
		}
		const firebaserc = path.join(__dirname, '..', '..', '.firebaserc');
		if (fs.existsSync(firebaserc)) {
			try {
				const rc = JSON.parse(fs.readFileSync(firebaserc, 'utf-8')) as {
					projects?: { default?: string };
				};
				const id = rc.projects?.default?.trim();
				if (id) return id;
			} catch {
				/* ignore */
			}
		}
		return undefined;
	}

	if (!admin.apps.length) {
		const projectId = resolveProjectId();
		admin.initializeApp(projectId ? { projectId } : undefined);
	}

	const ref = admin.firestore().doc(`users/${uid}`);
	await ref.set(
		{
			tickers,
			holdings,
			watchlist,
			discovery
		},
		{ merge: true }
	);

	console.log(`Wrote users/${uid} from ${dataDir} (merge: true).`);
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
