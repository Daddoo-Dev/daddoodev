const CONTENT_FILES = [
	'config',
	'jokes',
	'nodes',
	'branches',
	'cargo',
	'profiles',
	'telegrams',
	'strings'
];

export async function loadContent() {
	const base = new URL('./content/', import.meta.url);
	const content = {};
	const failed = [];
	await Promise.all(
		CONTENT_FILES.map(async (name) => {
			const file = `${name}.json`;
			try {
				const res = await fetch(new URL(file, base));
				if (!res.ok) throw new Error(String(res.status));
				content[name] = await res.json();
			} catch {
				failed.push(file);
			}
		})
	);
	if (failed.length) {
		const err = new Error('content_load');
		err.files = failed;
		throw err;
	}
	return content;
}

export function validateContent(content) {
	const warnings = [];
	const { jokes, nodes, branches, cargo, profiles } = content;
	const seen = new Map();

	function claim(id, where) {
		if (id == null || id === '') return;
		if (seen.has(id)) warnings.push(`duplicate id '${id}' in ${where} (also ${seen.get(id)})`);
		else seen.set(id, where);
	}

	for (const n of nodes) claim(n.id, 'nodes.json');
	for (const j of jokes) claim(j.id, 'jokes.json');
	for (const b of branches) {
		claim(b.id, 'branches.json');
		for (const e of b.edges || []) claim(e.id, 'branches.json');
	}
	for (const c of cargo) claim(c.id, 'cargo.json');
	for (const p of profiles) claim(p.id, 'profiles.json');

	const nodeIds = new Set(nodes.map((n) => n.id));
	const jokeIds = new Set(jokes.map((j) => j.id));

	for (const j of jokes) {
		if (!Array.isArray(j.variants) || j.variants.length < 2) {
			warnings.push(`joke '${j.id}' has fewer than 2 variants`);
		}
		const req = j.requires?.nodes ?? j.requires?.node;
		const reqs = Array.isArray(req) ? req : req ? [req] : [];
		for (const nid of reqs) {
			if (!nodeIds.has(nid)) warnings.push(`joke '${j.id}' requires.node '${nid}' does not exist`);
		}
		for (const cb of j.callback_to || []) {
			if (!jokeIds.has(cb)) warnings.push(`joke '${j.id}' callback_to '${cb}' missing`);
		}
	}

	for (const b of branches) {
		for (const e of b.edges || []) {
			if (!nodeIds.has(e.to)) {
				warnings.push(`branch '${b.id}' references node '${e.to}' that is not in nodes.json`);
			}
		}
	}

	return warnings;
}

function clamp(n, a, b) {
	return Math.max(a, Math.min(b, n));
}

function pick(arr) {
	return arr[Math.floor(Math.random() * arr.length)];
}

function pickUnique(arr, n) {
	const pool = arr.slice();
	const out = [];
	while (out.length < n && pool.length) {
		const i = Math.floor(Math.random() * pool.length);
		out.push(pool.splice(i, 1)[0]);
	}
	return out;
}

function pickWeighted(variants) {
	const total = variants.reduce((s, v) => s + (v.weight || 1), 0);
	let r = Math.random() * total;
	for (const v of variants) {
		r -= v.weight || 1;
		if (r <= 0) return v.text;
	}
	return variants[0].text;
}

function indexById(arr) {
	return Object.fromEntries(arr.map((x) => [x.id, x]));
}

function loadCareer(key) {
	try {
		const raw = localStorage.getItem(key);
		if (!raw) return freshCareer();
		return { ...freshCareer(), ...JSON.parse(raw) };
	} catch {
		return freshCareer();
	}
}

function freshCareer() {
	return { runs: 0, purse: 0, notes: {}, salvage: [], leopardOut: false, best: 0 };
}

function saveCareer(key, career) {
	try {
		localStorage.setItem(key, JSON.stringify(career));
	} catch {
		/* private mode / quota */
	}
}

function cargoHasEffect(cargo, effect) {
	return (cargo.effects || []).some((e) => e.effect === effect);
}

function applyTypos(text, typos, range) {
	const [min, max] = range;
	const n = min + Math.floor(Math.random() * (max - min + 1));
	const available = typos.filter((t) => text.includes(t.from));
	const chosen = pickUnique(available, n);
	let out = text;
	for (const t of chosen) out = out.replace(t.from, t.to);
	return out;
}

function condMatch(cond, ctx) {
	if (!cond || cond.default) return true;
	if (cond.refunds_gte != null && ctx.refunds >= cond.refunds_gte) return true;
	if (cond.net_lt != null && ctx.net < cond.net_lt) return true;
	if (cond.sat_gte != null && ctx.sat >= cond.sat_gte) return true;
	if (cond.cargo_lost && ctx.cargoId === cond.cargo_lost && ctx.cargoHealth === 0) return true;
	return false;
}

export class Game {
	constructor(content, telemetry) {
		this.content = content;
		this.cfg = content.config;
		this.S = content.strings;
		this.telemetry = telemetry;
		this.jokes = indexById(content.jokes);
		this.nodes = indexById(content.nodes);
		this.branches = indexById(content.branches);
		this.cargo = indexById(content.cargo);
		this.profiles = indexById(content.profiles);
		this.career = loadCareer(this.cfg.storageKey);
		this.run = null;
		this.settleResult = null;
		this.screen = 'office';
		this.choiceId = null;
		this.choiceDone = false;
		this.officeWire = null;
	}

	persist() {
		saveCareer(this.cfg.storageKey, this.career);
	}

	resetCareer() {
		this.career = freshCareer();
		this.persist();
		this.run = null;
		this.settleResult = null;
		this.screen = 'office';
		this.officeWire = null;
	}

	say(cls, text) {
		this.run.log.push({ cls, text });
	}

	fmt(keyPath, vars) {
		const parts = keyPath.split('.');
		let cur = this.S;
		for (const p of parts) cur = cur?.[p];
		if (typeof cur !== 'string') return '';
		return cur.replace(/\{(\w+)\}/g, (_, k) => (vars && vars[k] != null ? String(vars[k]) : ''));
	}

	nodeOpenText(node) {
		if (Array.isArray(node.settle_stages) && node.settle_stages.length) {
			let stage = node.settle_stages[0];
			for (const st of node.settle_stages) {
				if (this.career.runs >= st.min_runs) stage = st;
			}
			return stage.text;
		}
		return node.open;
	}

	scoreJoke(joke) {
		const cfg = this.cfg;
		const run = this.run;
		const node = this.nodes[run.node];
		let s = 0;
		for (const pid of run.pax) {
			const w = this.profiles[pid].flavor_weights || {};
			let sum = 0;
			for (const f of joke.flavors || []) sum += w[f] || 0;
			s += sum;
		}
		s /= run.pax.length;
		s *= Math.pow(cfg.fatigueMultiplier, run.used[joke.id] || 0);
		const at = joke.at && joke.at.length;
		if (at) {
			const tags = node.tags || [];
			const onTopic = joke.at.some((t) => tags.includes(t));
			s *= onTopic ? cfg.onTopicBonus : cfg.offTopicPenalty;
		}
		if (node.selling) s *= cfg.sellingMultiplier;
		return Math.round(s * cfg.scoreScale);
	}

	jokeOffTopic(joke) {
		if (!joke.at || !joke.at.length) return false;
		const tags = this.nodes[this.run.node]?.tags || [];
		return !joke.at.some((t) => tags.includes(t));
	}

	startRun(cargoId) {
		const cfg = this.cfg;
		const goose = this.career.runs >= cfg.gooseAfterRuns;
		const pool = this.content.jokes.filter((j) => {
			if (j.unlock?.method === 'salvage' && !this.career.salvage.includes(j.id)) return false;
			if (j.at?.includes('goose') && !goose) return false;
			return true;
		});
		const hand = pickUnique(pool, cfg.handSize).map((j) => j.id);
		const pax = pickUnique(this.content.profiles, cfg.paxCount).map((p) => p.id);

		this.run = {
			boiler: cfg.startBoiler,
			water: cfg.startWater,
			hull: cfg.startHull,
			sat: cfg.startSat,
			cargo: cargoId,
			cargoHealth: cfg.startCargoHealth,
			pax,
			hand,
			used: {},
			log: [],
			step: 0,
			beat: 0,
			threat: 0,
			node: null,
			goose,
			salvageGot: 0,
			fallsScore: 0,
			told: 0,
			plan: cfg.runPlan.map((s) => ({ ...s })),
			nodeBeats: { patter: 0, steer: 0, wrench: 0, bail: 0 },
			nodeSatStart: 0,
			nodeCrises: [],
			beatsSpent: { patter: 0, steer: 0, wrench: 0, bail: 0 },
			record: {
				cargo: cargoId,
				branches: [],
				nodes: [],
				jokes: []
			}
		};
		this.settleResult = null;
		this.choiceDone = false;
		this.choiceId = null;
		this.advanceToCurrent();
	}

	currentStep() {
		return this.run?.plan[this.run.step] || null;
	}

	advanceToCurrent() {
		const s = this.currentStep();
		if (!s) {
			this.screen = 'office';
			this.run = null;
			return;
		}
		if (s.kind === 'node' && s.id) {
			this.enterNode(s.id);
			return;
		}
		if (s.kind === 'branch') {
			this.screen = 'branch';
			return;
		}
		if (s.kind === 'choice') {
			this.screen = 'choice';
			this.choiceId = s.id;
			this.choiceDone = false;
			this.run.log = [];
			return;
		}
		if (s.kind === 'settle') {
			this.screen = 'settle';
			this.settleResult = this.computeSettle();
			return;
		}
		this.screen = 'office';
	}

	enterNode(id) {
		const n = this.nodes[id];
		const carry = (this.run.log || []).filter((l) => l.cls === 'bad' || l.cls === 'good').slice(-4);
		this.run.node = id;
		this.run.beat = n.beats;
		this.run.threat = n.threat;
		this.run.log = carry;
		this.run.nodeBeats = { patter: 0, steer: 0, wrench: 0, bail: 0 };
		this.run.nodeSatStart = this.run.sat;
		this.run.nodeCrises = [];
		this.screen = 'node';
		const open = this.nodeOpenText(n);
		if (open) this.say('beat', open);
	}

	applyBeatCargo() {
		const cargo = this.cargo[this.run.cargo];
		for (const fx of cargo.effects || []) {
			if (fx.trigger === 'beat' && fx.effect === 'melt') {
				this.run.cargoHealth = Math.max(0, this.run.cargoHealth - (fx.value || 0));
			}
		}
	}

	checkCrisis() {
		const cfg = this.cfg;
		const run = this.run;
		if (run.boiler >= cfg.boilerCrisisAt) {
			this.say('bad', this.S.log.boilerCrisis);
			run.boiler = clamp(run.boiler - cfg.boilerCrisisVent, 0, cfg.gaugeClamp);
			run.threat += cfg.boilerCrisisThreat;
			run.sat = clamp(run.sat - cfg.boilerCrisisSat, 0, 100);
			this.say('bad', this.S.log.boilerCrisisFix);
			run.nodeCrises.push('boiler');
		}
		if (run.water >= cfg.waterCrisisAt) {
			this.say('bad', this.S.log.waterCrisis);
			run.water = clamp(run.water - cfg.waterCrisisVent, 0, cfg.gaugeClamp);
			run.hull += cfg.waterCrisisHull;
			run.sat = clamp(run.sat - cfg.waterCrisisSat, 0, 100);
			run.nodeCrises.push('water');
		}
	}

	spend(cost, station) {
		const cfg = this.cfg;
		const node = this.nodes[this.run.node];
		const wasTalk = station === 'patter';
		for (let i = 0; i < cost; i++) {
			this.run.beat--;
			this.run.boiler = clamp(this.run.boiler + node.boiler_rate, 0, cfg.gaugeClamp);
			this.run.water = clamp(
				this.run.water + node.water_rate + Math.floor(this.run.hull / cfg.hullWaterFactor),
				0,
				cfg.gaugeClamp
			);
			if (!wasTalk) this.run.sat = clamp(this.run.sat - cfg.silenceDrain, 0, 100);
			this.applyBeatCargo();
			this.run.beatsSpent[station] = (this.run.beatsSpent[station] || 0) + 1;
			this.run.nodeBeats[station] = (this.run.nodeBeats[station] || 0) + 1;
			this.checkCrisis();
		}
		if (this.run.beat <= 0) this.endNode();
	}

	tellJoke(id) {
		const cfg = this.cfg;
		const joke = this.jokes[id];
		const timesPrev = this.run.used[id] || 0;
		const gain = this.scoreJoke(joke);
		const offTopic = this.jokeOffTopic(joke);
		this.run.used[id] = timesPrev + 1;
		this.run.told++;
		this.say('skip', pickWeighted(joke.variants));
		if (joke.deadpan) this.say('beat', this.S.log.deadpan);

		this.run.sat = clamp(this.run.sat + gain, 0, 100);
		if (gain >= cfg.jokeStrongAt) this.say('good', this.S.log.jokeStrong);
		else if (gain >= cfg.jokeFairAt) this.say('act', this.S.log.jokeFair);
		else if (gain > cfg.jokeFlatAt) this.say('act', this.S.log.jokeFlat);
		else this.say('bad', this.S.log.jokeBad);

		if (this.nodes[this.run.node].selling) this.run.fallsScore += gain;

		this.run.record.jokes.push({
			id,
			node: this.run.node,
			score: gain,
			timesPreviouslyTold: timesPrev,
			offTopic
		});

		if (joke.risk && Math.random() < joke.risk.chance) {
			this.say('bad', this.S.log.riskTrigger);
			this.run.threat += cfg.riskThreat;
			this.run.sat = clamp(this.run.sat - cfg.riskSat, 0, 100);
			this.run.water = clamp(this.run.water + cfg.riskWater, 0, cfg.gaugeClamp);
			this.say('bad', this.S.log.riskOverboard);
		}
		this.spend(joke.attention_cost || 1, 'patter');
	}

	doAction(kind) {
		const cfg = this.cfg;
		const node = this.nodes[this.run.node];
		if (kind === 'steer') {
			if (node.selling) this.say('act', this.S.log.steerSelling);
			else {
				this.run.threat = Math.max(0, this.run.threat - cfg.steerThreatReduce);
				this.say('act', this.S.log.steer);
			}
		}
		if (kind === 'wrench') {
			this.run.boiler = clamp(this.run.boiler - cfg.wrenchBoilerReduce, 0, cfg.gaugeClamp);
			this.say('act', this.S.log.wrench);
		}
		if (kind === 'bail') {
			this.run.water = clamp(this.run.water - cfg.bailWaterReduce, 0, cfg.gaugeClamp);
			this.say('act', this.S.log.bail);
		}
		this.spend(1, kind);
	}

	endNode() {
		const cfg = this.cfg;
		const n = this.nodes[this.run.node];
		const cargo = this.cargo[this.run.cargo];
		if (this.run.threat > 0) {
			const t = this.run.threat;
			this.say(
				'bad',
				this.fmt('log.unresolved', { label: n.threat_label || this.S.log.unresolvedFallback })
			);
			this.run.hull += Math.round(t * cfg.unresolvedHullScale);
			this.run.water = clamp(this.run.water + t * cfg.unresolvedWaterScale, 0, cfg.gaugeClamp);
			this.run.sat = clamp(this.run.sat - t * cfg.unresolvedSatScale, 0, 100);
			if (cargoHasEffect(cargo, 'play_note')) this.say('act', this.S.log.pianoNote);
			if (cargoHasEffect(cargo, 'escape') && !this.career.leopardOut) {
				const fx = (cargo.effects || []).find((e) => e.effect === 'escape');
				const chance = fx?.chance_key ? cfg[fx.chance_key] : fx?.chance || 0;
				if (Math.random() < chance) {
					this.career.leopardOut = true;
					this.persist();
					this.say('bad', this.S.log.leopardGone);
					this.run.cargoHealth = 0;
				}
			}
		} else {
			this.say('good', n.selling ? this.S.log.cleanSelling : this.S.log.clean);
		}
		if (n.selling) {
			const r = this.run.fallsScore;
			if (r >= cfg.fallsRatingHigh) this.say('good', this.S.log.fallsHigh);
			else if (r >= cfg.fallsRatingMid) this.say('act', this.S.log.fallsMid);
			else this.say('bad', this.S.log.fallsLow);
		}
		if (n.salvage && this.run.threat <= cfg.salvageThreatMax) {
			this.run.salvageGot = 1;
			this.say('good', this.S.log.salvage);
		}

		this.run.record.nodes.push({
			id: this.run.node,
			satDelta: this.run.sat - this.run.nodeSatStart,
			threatLeft: this.run.threat,
			crises: this.run.nodeCrises.slice(),
			beats: { ...this.run.nodeBeats }
		});

		this.run.step++;
		const nx = this.currentStep();
		if (nx && nx.kind === 'node' && nx.id) this.enterNode(nx.id);
		else this.advanceToCurrent();
	}

	chooseBranch(edgeId) {
		const step = this.currentStep();
		const branch = this.branches[step.id];
		const edge = branch.edges.find((e) => e.id === edgeId);
		this.career.notes[edge.id] = edge.annotation_on_discovery;
		this.persist();
		this.run.record.branches.push(edge.id);
		const next = this.run.plan[this.run.step + 1];
		if (next && next.kind === 'node') next.id = edge.to;
		if (edge.boiler_bonus) {
			this.run.boiler = clamp(this.run.boiler + edge.boiler_bonus, 0, this.cfg.gaugeClamp);
		}
		this.run.step++;
		this.enterNode(edge.to);
		this.say('beat', this.fmt('log.chartSaid', { claim: edge.charted.claim }));
	}

	chooseDucks(choice) {
		const cfg = this.cfg.ducks;
		const S = this.S.ducks;
		this.run.log = [];
		this.say('beat', this.run.goose ? S.openGoose : S.open);

		if (choice === 'funny') {
			const gooseJoke = this.jokes[cfg.gooseJokeId];
			const paraJoke = this.jokes[cfg.paraJokeId];
			if (this.run.goose && !this.career.salvage.includes(cfg.gooseJokeId)) {
				this.say('skip', S.funnySetup);
				this.say('bad', S.funnyFail);
				this.say('skip', pickWeighted(gooseJoke.variants));
				this.say('good', S.funnyLand);
				this.career.salvage.push(cfg.gooseJokeId);
				this.persist();
				this.run.sat = clamp(this.run.sat + cfg.gooseSat, 0, 100);
			} else if (this.run.goose) {
				this.say('skip', pickWeighted(gooseJoke.variants));
				this.run.sat = clamp(this.run.sat + cfg.gooseRepeatSat, 0, 100);
				this.say('good', S.funnyRepeat);
			} else {
				this.say('skip', pickWeighted(paraJoke.variants));
				this.run.sat = clamp(this.run.sat + cfg.funnySat, 0, 100);
				this.say('good', S.funnyGroan);
			}
			this.run.boiler = clamp(this.run.boiler + cfg.funnyBoiler, 0, this.cfg.gaugeClamp);
			this.say('act', S.funnyCost);
			this.checkCrisis();
		} else {
			this.say('act', S.fastAct);
			this.run.sat = clamp(this.run.sat + cfg.fastSat, 0, 100);
			this.run.boiler = clamp(this.run.boiler + cfg.fastBoiler, 0, this.cfg.gaugeClamp);
			this.say('beat', S.fastAsk);
		}
		this.choiceDone = true;
	}

	continueAfterChoice() {
		this.run.step++;
		this.advanceToCurrent();
	}

	cargoPay() {
		const cfg = this.cfg;
		const cargo = this.cargo[this.run.cargo];
		let pay = cargo.pay;
		if (cargoHasEffect(cargo, 'melt')) {
			pay =
				this.run.cargoHealth >= cfg.iceSurvivePct
					? cargo.pay + cfg.iceSurviveBonus
					: Math.round(cargo.pay * (this.run.cargoHealth / 100));
		}
		if (cargoHasEffect(cargo, 'escape') && this.run.cargoHealth === 0) pay = cfg.leopardLostPay;
		if (cargoHasEffect(cargo, 'play_note') && this.run.hull > cfg.pianoDamageHull) {
			pay = Math.round(cargo.pay * cfg.pianoDamagedPayScale);
		}
		return pay;
	}

	computeSettle() {
		const cfg = this.cfg;
		const cargo = this.cargo[this.run.cargo];
		const tips = Math.round(Math.max(0, this.run.sat - cfg.tipSatFloor) * cfg.tipScale);
		const refunds = this.run.sat < cfg.refundSatFloor ? Math.floor((cfg.refundSatFloor - this.run.sat) / cfg.refundDivisor) : 0;
		const refundCost = refunds * cfg.refundEach;
		const repairs = Math.round(this.run.hull * cfg.repairScale);
		const cargoPay = this.cargoPay();
		const salvage = this.run.salvageGot ? cfg.salvagePay : 0;
		const net = cfg.baseFare + tips + cargoPay + salvage - refundCost - repairs;

		this.career.runs++;
		this.career.purse += net;
		this.career.best = Math.max(this.career.best, this.run.sat);
		this.persist();

		const ctx = {
			refunds,
			net,
			sat: this.run.sat,
			cargoId: this.run.cargo,
			cargoHealth: this.run.cargoHealth
		};
		const wireRule = this.content.telegrams.settle.find((w) => condMatch(w.if, ctx));
		let wire = (wireRule?.text || '').replace('{refunds}', String(refunds));
		wire = applyTypos(wire, this.content.telegrams.typos, cfg.typosPerTelegram);

		const result = {
			base: cfg.baseFare,
			tips,
			refunds,
			refundCost,
			repairs,
			cargoPay,
			cargoName: cargo.name,
			salvage,
			net,
			wire
		};

		this.telemetry?.commitRun({
			cargo: this.run.record.cargo,
			branches: this.run.record.branches,
			nodes: this.run.record.nodes,
			jokes: this.run.record.jokes,
			beatsSpent: this.run.beatsSpent,
			final: {
				boiler: this.run.boiler,
				water: this.run.water,
				hull: this.run.hull,
				sat: this.run.sat
			},
			refunds,
			net
		});

		return result;
	}

	officeTelegram() {
		if (!this.officeWire) {
			const t = this.content.telegrams.office;
			const body = t.lines.join('\n');
			this.officeWire = {
				header: t.header,
				body: applyTypos(body, this.content.telegrams.typos, this.cfg.typosPerTelegram),
				signoff: t.signoff
			};
		}
		return this.officeWire;
	}

	returnToOffice() {
		this.run = null;
		this.settleResult = null;
		this.screen = 'office';
		this.officeWire = null;
	}

	formatPurse(n) {
		const sign = n >= 0 ? '£' : '−£';
		return `${sign}${Math.abs(n)}`;
	}
}
