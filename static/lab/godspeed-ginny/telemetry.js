function loadRuns(key) {
	try {
		const raw = localStorage.getItem(key);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}

function saveRuns(key, runs) {
	try {
		localStorage.setItem(key, JSON.stringify(runs));
	} catch {
		/* private mode / quota */
	}
}

export class Telemetry {
	constructor(config) {
		this.key = config.telemetryKey;
		this.keep = config.telemetryKeep;
		this.runs = loadRuns(this.key);
	}

	commitRun(record) {
		this.runs.push({ at: Date.now(), ...record });
		if (this.runs.length > this.keep) this.runs = this.runs.slice(-this.keep);
		saveRuns(this.key, this.runs);
	}

	jokeBoard() {
		const map = new Map();
		for (const run of this.runs) {
			for (const j of run.jokes || []) {
				const row = map.get(j.id) || { id: j.id, told: 0, scoreSum: 0, off: 0 };
				row.told++;
				row.scoreSum += j.score;
				if (j.offTopic) row.off++;
				map.set(j.id, row);
			}
		}
		return [...map.values()]
			.map((r) => ({
				id: r.id,
				told: r.told,
				mean: r.told ? r.scoreSum / r.told : 0,
				offPct: r.told ? (100 * r.off) / r.told : 0
			}))
			.sort((a, b) => b.told - a.told);
	}

	nodeReport() {
		const map = new Map();
		for (const run of this.runs) {
			for (const n of run.nodes || []) {
				const row = map.get(n.id) || { id: n.id, count: 0, sat: 0, threat: 0, crises: 0 };
				row.count++;
				row.sat += n.satDelta;
				row.threat += n.threatLeft;
				row.crises += (n.crises || []).length;
				map.set(n.id, row);
			}
		}
		return [...map.values()].map((r) => ({
			id: r.id,
			sat: r.count ? r.sat / r.count : 0,
			threat: r.count ? r.threat / r.count : 0,
			crises: r.crises,
			count: r.count
		}));
	}

	stationSplit() {
		const totals = { patter: 0, steer: 0, wrench: 0, bail: 0 };
		for (const run of this.runs) {
			const b = run.beatsSpent || {};
			for (const k of Object.keys(totals)) totals[k] += b[k] || 0;
		}
		const sum = Object.values(totals).reduce((a, b) => a + b, 0);
		const pct = {};
		for (const k of Object.keys(totals)) pct[k] = sum ? Math.round((100 * totals[k]) / sum) : 0;
		return { totals, pct, sum };
	}

	exportJson() {
		return JSON.stringify(this.runs, null, 2);
	}
}
