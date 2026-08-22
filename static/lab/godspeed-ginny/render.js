import { Game, loadContent, validateContent } from './engine.js';
import { Telemetry } from './telemetry.js';

const $ = (s, root = document) => root.querySelector(s);

function esc(s) {
	return String(s)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

let game;
let telemetry;
let strings;
let showTelemetry = false;

function fmt(template, vars) {
	return template.replace(/\{(\w+)\}/g, (_, k) => (vars && vars[k] != null ? String(vars[k]) : ''));
}

function careerLine() {
	const extra = game.career.leopardOut ? ` · ${strings.office.leopardAtLarge}` : '';
	return fmt(strings.career, {
		runs: game.career.runs,
		purse: game.formatPurse(game.career.purse),
		best: game.career.best,
		extra
	});
}

function gauges() {
	if (!game.run) return '';
	const max = game.cfg.gaugeDisplayMax;
	const R = game.run;
	const d = game.run.card?.deltas || {};
	const g = (cls, lbl, val, hot, dkey) => {
		const w = Math.max(0, Math.min(100, (val / max) * 100));
		const delta = d[dkey];
		const chip = delta
			? `<span class="g-d ${deltaClass(dkey, delta)}">${esc(fmtDelta(delta))}</span>`
			: '';
		return `<div class="g ${cls}${hot ? ' hot' : ''}"><div class="lbl">${esc(lbl)}</div><div class="val">${Math.round(val)}${chip}</div><div class="bar"><i style="width:${w}%"></i></div></div>`;
	};
	const L = strings.gauges;
	return `<div class="gauges">
		${g('boiler', L.boiler, R.boiler, R.boiler >= 80, 'boiler')}
		${g('water', L.water, R.water, R.water >= 80, 'water')}
		${g('hull', L.hull, R.hull, R.hull >= 50, 'hull')}
		${g('mood', L.sat, R.sat, R.sat <= 30, 'sat')}
	</div>`;
}

function fmtDelta(n) {
	return n > 0 ? `+${n}` : `−${Math.abs(n)}`;
}

function deltaClass(key, n) {
	const badUp = key === 'boiler' || key === 'water' || key === 'hull' || key === 'threat';
	if (n > 0) return badUp ? 'delta-bad' : 'delta-good';
	return badUp ? 'delta-good' : 'delta-bad';
}

function cardHtml(card) {
	if (!card) return '';
	const C = strings.card;
	const station = C.stations[card.station] || card.station;
	const bits = [station];
	if (card.beatsSpent) {
		bits.push(
			card.beatsSpent === 1 ? fmt(C.beat, { n: card.beatsSpent }) : fmt(C.beats, { n: card.beatsSpent })
		);
	}
	if (card.ended) bits.push(C.ended);
	const eyebrow = esc(strings.log.skipperEyebrow);
	const lines = (card.lines || [])
		.map((l) =>
			l.cls === 'skip'
				? `<li class="skip" data-eyebrow="${eyebrow}">${esc(l.text)}</li>`
				: `<li class="${esc(l.cls)}">${esc(l.text)}</li>`
		)
		.join('');
	const order = ['threat', 'boiler', 'water', 'hull', 'sat', 'cargoHealth'];
	const chips = order
		.filter((k) => card.deltas?.[k])
		.map((k) => {
			const n = card.deltas[k];
			return `<span class="dchip ${deltaClass(k, n)}"><i>${esc(C.labels[k])}</i> ${esc(fmtDelta(n))}</span>`;
		})
		.join('');
	return `<article class="play-card">
		<div class="card-kicker">${esc(bits.join(' · '))}</div>
		<ul class="log">${lines}</ul>
		${chips ? `<div class="delta-row">${chips}</div>` : ''}
	</article>`;
}

function jokeMeta(joke, times, est) {
	const cfg = game.cfg;
	const bits = [];
	const cost = joke.attention_cost || 1;
	bits.push(cost === 1 ? fmt(strings.jokeMeta.beats, { n: cost }) : fmt(strings.jokeMeta.beatsPlural, { n: cost }));
	if (times) bits.push(fmt(strings.jokeMeta.told, { n: times }));
	if (joke.risk) bits.push(strings.jokeMeta.risky);
	if (joke.deadpan) bits.push(strings.jokeMeta.deadpan);
	const read =
		est >= cfg.jokeStrongAt
			? strings.jokeMeta.readsStrong
			: est >= cfg.jokeFairAt
				? strings.jokeMeta.readsFair
				: strings.jokeMeta.readsFlat;
	bits.push(read);
	return `${(joke.flavors || []).join(' / ')} · ${bits.join(' · ')}`;
}

function renderOffice() {
	const t = game.officeTelegram();
	const notes = Object.entries(game.career.notes);
	const salvage = game.career.salvage
		.map((id) => game.jokes[id]?.title)
		.filter(Boolean);
	return `
	<div class="telegram">
		<div class="hd">${esc(t.header)}</div>
		${esc(t.body).replace(/\n/g, '<br>')}
		<br><br>${esc(t.signoff)}
	</div>
	<p class="note">${esc(strings.office.note)}</p>
	<div class="sect">${esc(strings.office.manifest)}</div>
	${game.content.cargo
		.map(
			(c) => `<button class="chart-card" type="button" data-cargo="${esc(c.id)}">
			<div class="nm">${esc(c.name)}</div>
			<div class="pay">${esc(fmt(strings.office.pays, { pay: c.pay }))}</div>
			<div class="an">${esc(c.note)}</div>
		</button>`
		)
		.join('')}
	${
		notes.length
			? `<div class="sect">${esc(strings.office.chartSect)}</div>
		${notes
			.map(([id, note]) => {
				const edge = game.content.branches.flatMap((b) => b.edges).find((e) => e.id === id);
				const label = edge?.charted?.label || id;
				return `<div class="chart-card"><div class="nm">${esc(label)}</div><div class="an">${esc(note)}</div></div>`;
			})
			.join('')}`
			: ''
	}
	${
		salvage.length
			? `<div class="sect">${esc(strings.office.salvageSect)}</div><p class="pax">${salvage.map((t) => `<b>${esc(t)}</b>`).join(' · ')}</p>`
			: ''
	}`;
}

function renderNode() {
	const n = game.nodes[game.run.node];
	const waiting = game.run.awaitingContinue;
	const pips = Array.from(
		{ length: n.beats },
		(_, i) => `<div class="pip${i >= game.run.beat ? ' spent' : ''}"></div>`
	).join('');
	const beatLabel =
		game.run.beat === 1
			? fmt(strings.node.beatsLeft, { n: game.run.beat })
			: fmt(strings.node.beatsLeftPlural, { n: game.run.beat });
	const threat = n.threat_label
		? `<div class="threat">${esc(fmt(strings.node.threatClear, { label: n.threat_label.toUpperCase(), threat: game.run.threat }))}</div>`
		: `<div class="threat">${esc(strings.node.sellingThreat)}</div>`;
	const jokes = game.run.hand
		.map((id) => {
			const j = game.jokes[id];
			const times = game.run.used[id] || 0;
			const est = game.scoreJoke(j);
			const disabled = waiting || game.run.beat < (j.attention_cost || 1);
			return `<button class="joke${times ? ' tired' : ''}${j.risk ? ' risky' : ''}" type="button" data-joke="${esc(id)}" ${disabled ? 'disabled' : ''}>
				<div class="t">${esc(j.title)}</div>
				<div class="m">${esc(jokeMeta(j, times, est))}</div>
			</button>`;
		})
		.join('');
	const cargo = game.cargo[game.run.cargo];
	const ice = cargo.effects?.some((e) => e.effect === 'melt')
		? fmt(strings.node.iceLeft, { pct: game.run.cargoHealth })
		: '';
	const actions = waiting
		? `<button class="btn wide" type="button" id="next-passage">${esc(strings.card.continue)}</button>`
		: `<div class="sect">${esc(strings.node.doSomething)}</div>
	<div class="act-row">
		<button class="btn" type="button" data-act="steer" ${game.run.beat < 1 ? 'disabled' : ''}>${esc(strings.node.steer)}<small>${esc(fmt(strings.node.steerHint, { n: game.cfg.steerThreatReduce }))}</small></button>
		<button class="btn" type="button" data-act="wrench" ${game.run.beat < 1 ? 'disabled' : ''}>${esc(strings.node.wrench)}<small>${esc(fmt(strings.node.wrenchHint, { n: game.cfg.wrenchBoilerReduce }))}</small></button>
		<button class="btn" type="button" data-act="bail" ${game.run.beat < 1 ? 'disabled' : ''}>${esc(strings.node.bail)}<small>${esc(fmt(strings.node.bailHint, { n: game.cfg.bailWaterReduce }))}</small></button>
	</div>
	<div class="sect">${esc(strings.node.orSay)}</div>
	${jokes}`;
	return `<div class="play-board">
	${gauges()}
	<div class="play-head">
		<h2 class="node-head">${esc(n.name)}</h2>
		<div class="node-sub">${esc(n.sub)}</div>
		${threat}
		<div class="beats">${pips}<span class="cap">${esc(beatLabel)} · ${esc(strings.node.beatHint)}</span></div>
	</div>
	${cardHtml(game.run.card)}
	<div class="play-actions">
		${actions}
		<p class="pax">${esc(strings.node.aboard)} ${game.run.pax.map((p) => `<b>${esc(game.profiles[p].name)}</b>`).join(' · ')}<br>${esc(strings.node.hold)} <b>${esc(cargo.name)}</b>${esc(ice)}</p>
	</div>
	</div>`;
}

function renderBranch() {
	const step = game.currentStep();
	const b = game.branches[step.id];
	return `<div class="play-board">
	${gauges()}
	<div class="play-head">
		<h2 class="node-head">${esc(strings.branch.title)}</h2>
		<div class="node-sub">${esc(strings.branch.sub)}</div>
	</div>
	${cardHtml(game.run.card)}
	<div class="play-actions">
		<p class="note">${esc(b.prompt)}</p>
		${b.edges
			.map((o) => {
				const note = game.career.notes[o.id];
				return `<button class="chart-card" type="button" data-opt="${esc(o.id)}">
				<div class="nm">${esc(o.charted.label)}</div>
				<div class="cl" data-k="${esc(strings.branch.chartPrefix)}">${esc(o.charted.claim)}</div>
				${note ? `<div class="an">${esc(note)}</div>` : ''}
			</button>`;
			})
			.join('')}
	</div>
	</div>`;
}

function renderDucks() {
	const d = strings.ducks;
	const done = game.choiceDone;
	return `<div class="play-board">
	${gauges()}
	<div class="play-head">
		<h2 class="node-head">${esc(game.run.goose ? d.titleGoose : d.title)}</h2>
		<div class="node-sub">${esc(d.sub)}</div>
	</div>
	${done ? cardHtml(game.run.card) : `<article class="play-card"><p class="note">${esc(d.note)}</p></article>`}
	<div class="play-actions">
	${
		done
			? `<button class="btn wide" type="button" id="on">${esc(d.carryOn)}</button>`
			: `<div class="act-row">
			<button class="btn" type="button" data-d="fast">${esc(d.fast)}<small>${esc(d.fastHint)}</small></button>
			<button class="btn hot" type="button" data-d="funny">${esc(d.funny)}<small>${esc(d.funnyHint)}</small></button>
		</div>`
	}
	</div>
	</div>`;
}

function renderBoulder() {
	const b = strings.boulder;
	const done = game.choiceDone;
	return `<div class="play-board">
	${gauges()}
	<div class="play-head">
		<h2 class="node-head">${esc(b.title)}</h2>
		<div class="node-sub">${esc(b.sub)}</div>
	</div>
	${done ? cardHtml(game.run.card) : `<article class="play-card"><p class="note">${esc(b.note)}</p></article>`}
	<div class="play-actions">
	${
		done
			? `<button class="btn wide" type="button" id="on">${esc(b.carryOn)}</button>`
			: `<div class="act-row">
			<button class="btn" type="button" data-b="left">${esc(b.left)}<small>${esc(b.leftHint)}</small></button>
			<button class="btn" type="button" data-b="right">${esc(b.right)}<small>${esc(b.rightHint)}</small></button>
		</div>`
	}
	</div>
	</div>`;
}

function renderChoice() {
	return game.choiceId === 'boulder' ? renderBoulder() : renderDucks();
}

function renderSettle() {
	const t = game.settleResult;
	const s = strings.settle;
	const row = (l, v, neg) =>
		`<tr><td>${esc(l)}</td><td class="${neg ? 'neg' : ''}">${neg ? '−' : ''}£${Math.abs(v)}</td></tr>`;
	return `
	<h2 class="node-head">${esc(s.title)}</h2>
	<div class="node-sub">${esc(s.sub)}</div>
	<p class="note">${esc(s.note)}</p>
	<div class="sect">${esc(s.sect)}</div>
	<table class="tally">
		${row(s.fares, t.base)}
		${row(s.tips, t.tips)}
		${row(t.cargoName, t.cargoPay, t.cargoPay < 0)}
		${t.salvage ? row(s.salvage, t.salvage) : ''}
		${t.refunds ? row(fmt(s.refunds, { n: t.refunds }), t.refundCost, true) : ''}
		${t.repairs ? row(s.repairs, t.repairs, true) : ''}
		<tr class="net"><td>${esc(s.net)}</td><td class="${t.net < 0 ? 'neg' : ''}">${t.net < 0 ? '−' : ''}£${Math.abs(t.net)}</td></tr>
	</table>
	<div class="telegram"><div class="hd">${esc(s.incomingHeader)}</div>${esc(t.wire).replace(/\n/g, '<br>')}<br><br>${esc(game.content.telegrams.office.signoff)}</div>
	<p class="pax">${esc(fmt(s.summary, { sat: game.run.sat, told: game.run.told, leopard: game.career.leopardOut ? s.leopard : '' }))}</p>
	<button class="btn wide" type="button" id="again">${esc(s.again)}</button>`;
}

function renderTelemetry() {
	const T = strings.telemetry;
	if (!showTelemetry) return '';
	if (!telemetry.runs.length) {
		return `<section class="telem" id="telem"><div class="sect">${esc(T.title)}</div><p class="note">${esc(T.empty)}</p></section>`;
	}
	const jokes = telemetry.jokeBoard();
	const nodes = telemetry.nodeReport();
	const split = telemetry.stationSplit();
	return `<section class="telem" id="telem">
		<div class="sect">${esc(T.title)}</div>
		<p class="note">${esc(fmt(T.runs, { n: telemetry.runs.length, keep: game.cfg.telemetryKeep }))}</p>
		<div class="sect">${esc(T.jokes)}</div>
		<p class="telem-cap">${esc(T.jokeCols)}</p>
		<table class="tally">${jokes
			.map(
				(j) =>
					`<tr><td>${esc(j.id)}</td><td>${j.told} · ${j.mean.toFixed(1)} · ${Math.round(j.offPct)}%</td></tr>`
			)
			.join('')}</table>
		<div class="sect">${esc(T.nodes)}</div>
		<p class="telem-cap">${esc(T.nodeCols)}</p>
		<table class="tally">${nodes
			.map(
				(n) =>
					`<tr><td>${esc(n.id)}</td><td>${n.sat.toFixed(1)} · ${n.threat.toFixed(1)} · ${n.crises}</td></tr>`
			)
			.join('')}</table>
		<div class="sect">${esc(T.stations)}</div>
		<p class="pax">patter <b>${split.pct.patter}%</b> · steer <b>${split.pct.steer}%</b> · wrench <b>${split.pct.wrench}%</b> · bail <b>${split.pct.bail}%</b></p>
		<button class="btn" type="button" id="telem-export">${esc(T.export)}</button>
		<p class="note" id="telem-status" hidden></p>
	</section>`;
}

function render() {
	$('#career').textContent = careerLine();
	const app = $('#app');
	if (game.screen === 'office' || !game.run) app.innerHTML = renderOffice();
	else if (game.screen === 'branch') app.innerHTML = renderBranch();
	else if (game.screen === 'choice') app.innerHTML = renderChoice();
	else if (game.screen === 'settle') app.innerHTML = renderSettle();
	else app.innerHTML = renderNode();

	const playing =
		game.run &&
		(game.screen === 'node' || game.screen === 'branch' || game.screen === 'choice') &&
		!showTelemetry;
	document.body.classList.toggle('play', playing);

	let telem = $('#telem-slot');
	if (!telem) {
		telem = document.createElement('div');
		telem.id = 'telem-slot';
		$('.wrap').insertBefore(telem, $('footer'));
	}
	telem.innerHTML = renderTelemetry();
	bind();
}

function bind() {
	const app = $('#app');
	app.querySelectorAll('[data-cargo]').forEach((b) => {
		b.onclick = () => {
			game.startRun(b.dataset.cargo);
			render();
		};
	});
	app.querySelectorAll('[data-act]').forEach((b) => {
		b.onclick = () => {
			game.doAction(b.dataset.act);
			render();
		};
	});
	app.querySelectorAll('[data-joke]').forEach((b) => {
		b.onclick = () => {
			game.tellJoke(b.dataset.joke);
			render();
		};
	});
	app.querySelectorAll('[data-opt]').forEach((b) => {
		b.onclick = () => {
			game.chooseBranch(b.dataset.opt);
			render();
		};
	});
	app.querySelectorAll('[data-d]').forEach((b) => {
		b.onclick = () => {
			game.chooseDucks(b.dataset.d);
			render();
		};
	});
	app.querySelectorAll('[data-b]').forEach((b) => {
		b.onclick = () => {
			game.chooseBoulder(b.dataset.b);
			render();
		};
	});
	const next = $('#next-passage');
	if (next)
		next.onclick = () => {
			game.continueNode();
			render();
		};
	const on = $('#on');
	if (on)
		on.onclick = () => {
			game.continueAfterChoice();
			render();
		};
	const again = $('#again');
	if (again)
		again.onclick = () => {
			game.returnToOffice();
			render();
		};
	const exp = $('#telem-export');
	if (exp)
		exp.onclick = async () => {
			const status = $('#telem-status');
			try {
				await navigator.clipboard.writeText(telemetry.exportJson());
				status.hidden = false;
				status.textContent = strings.telemetry.copied;
			} catch {
				status.hidden = false;
				status.textContent = strings.telemetry.copyFail;
			}
		};
}

function bootError(files) {
	const app = $('#app');
	app.innerHTML = (files || ['content']).map((f) => `<p class="note">${esc(fmt(strings?.loadError || 'Failed to load {file}.', { file: f }))}</p>`).join('');
}

async function boot() {
	let content;
	try {
		content = await loadContent();
	} catch (e) {
		strings = { loadError: 'Failed to load {file}.' };
		bootError(e.files || ['content']);
		return;
	}
	strings = content.strings;
	document.title = strings.docTitle;
	const h1 = document.createElement('h1');
	for (const [i, line] of strings.mastTitle.entries()) {
		if (i) h1.appendChild(document.createElement('br'));
		h1.appendChild(document.createTextNode(line));
	}
	$('.mast').replaceChildren(h1);
	const slug = document.createElement('div');
	slug.className = 'slug';
	slug.appendChild(document.createTextNode(`${strings.mastCompany}  ·  `));
	const tag = document.createElement('b');
	tag.textContent = strings.mastTag;
	slug.appendChild(tag);
	slug.appendChild(document.createTextNode(`  ·  ${strings.mastPort}`));
	$('.mast').appendChild(slug);

	const warnings = validateContent(content);
	for (const w of warnings) console.warn(w);

	telemetry = new Telemetry(content.config);
	game = new Game(content, telemetry);

	$('#wipe').textContent = strings.wipe;
	$('#telem-link').textContent = strings.telemetryToggle;
	$('#wipe').onclick = () => {
		if (confirm(strings.wipeConfirm)) {
			game.resetCareer();
			render();
		}
	};
	$('#telem-link').onclick = () => {
		showTelemetry = !showTelemetry;
		render();
	};
	render();
}

boot();
