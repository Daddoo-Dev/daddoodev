<script lang="ts">
	import { onMount } from 'svelte';
	import { ENTRIES, FIND_IDS, FOUND_STORAGE_KEY, type IslandLink } from '$lib/island/data';
	import { setViewPref } from '$lib/island/preference';
	import { isLocalNight } from '$lib/island/time';
	import type { IslandController, IslandHud, TimeMode } from '$lib/island/createIsland';
	import { fetchWeather, SKY_FLAG } from '$lib/island/weather';

	let { onBack }: { onBack: () => void } = $props();

	type LinkBlock =
		| { type: 'app'; project: string; icon?: string; site?: string; badges: IslandLink[] }
		| { type: 'chips'; links: IslandLink[] };
	/** Group a card's links: each app becomes a small card (icon, name, store badges); loose links stay chips. */
	function blocks(links: IslandLink[]): LinkBlock[] {
		const out: LinkBlock[] = [];
		for (const l of links) {
			if (l.project) {
				let b = out.find((x): x is Extract<LinkBlock, { type: 'app' }> => x.type === 'app' && x.project === l.project);
				if (!b) {
					b = { type: 'app', project: l.project, icon: l.icon, badges: [] };
					out.push(b);
				}
				if (l.kind) b.badges.push(l);
				else b.site = l.url;
			} else {
				const last = out[out.length - 1];
				if (last?.type === 'chips') last.links.push(l);
				else out.push({ type: 'chips', links: [l] });
			}
		}
		return out;
	}

	let host = $state<HTMLDivElement | null>(null);
	let ctl: IslandController | null = null;
	let ready = $state(false);
	let failed = $state(false);
	let mode = $state<TimeMode>('dusk');
	let touring = $state(false);

	type SkyState = 'off' | 'asking' | 'loading' | 'on' | 'error';
	let sky = $state<SkyState>('off');
	let skyLabel = $state('');
	let refreshTimer: ReturnType<typeof setInterval> | undefined;

	function getPosition(): Promise<{ lat: number; lon: number }> {
		return new Promise((resolve, reject) => {
			if (!('geolocation' in navigator)) return reject(new Error('no geolocation'));
			navigator.geolocation.getCurrentPosition(
				(p) => resolve({ lat: p.coords.latitude, lon: p.coords.longitude }),
				reject,
				{ enableHighAccuracy: false, timeout: 10000, maximumAge: 3_600_000 }
			);
		});
	}
	async function matchSky(silent = false) {
		sky = 'loading';
		try {
			const { lat, lon } = await getPosition();
			const w = await fetchWeather(lat, lon);
			ctl?.setWeather(w);
			ctl?.setTime(w.mode);
			skyLabel = w.label;
			sky = 'on';
			try {
				localStorage.setItem(SKY_FLAG, '1');
			} catch {
				/* storage unavailable: opt-in lasts for this visit only */
			}
			clearInterval(refreshTimer);
			refreshTimer = setInterval(() => void matchSky(true), 15 * 60 * 1000);
		} catch {
			// a failed silent refresh keeps the current sky; a failed manual attempt explains itself
			sky = silent && skyLabel ? 'on' : 'error';
		}
	}
	function resetSky() {
		clearInterval(refreshTimer);
		ctl?.setWeather(null);
		skyLabel = '';
		sky = 'off';
		try {
			localStorage.removeItem(SKY_FLAG);
		} catch {
			/* ignore */
		}
	}
	async function resumeSky() {
		// only re-run without asking if the browser already granted permission and the visitor opted in before
		try {
			if (localStorage.getItem(SKY_FLAG) !== '1' || !navigator.permissions) return;
			const st = await navigator.permissions.query({ name: 'geolocation' });
			if (st.state === 'granted') void matchSky(true);
		} catch {
			/* ignore */
		}
	}
	let selected = $state<string | null>(null);
	let hover = $state<{ id: string; x: number; y: number } | null>(null);
	let found = $state<string[]>([]);
	let hud = $state<IslandHud>({ utc: '--:--:--', met: '00:00', az: 0, el: 0, alt: 0 });

	const card = $derived(selected ? ENTRIES[selected] : null);
	const tip = $derived(hover ? ENTRIES[hover.id] : null);

	function loadFound(): string[] {
		try {
			const raw = localStorage.getItem(FOUND_STORAGE_KEY);
			const parsed: unknown = raw ? JSON.parse(raw) : [];
			return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
		} catch {
			return [];
		}
	}
	function saveFound(list: string[]) {
		try {
			localStorage.setItem(FOUND_STORAGE_KEY, JSON.stringify(list));
		} catch {
			/* storage unavailable: session-only */
		}
	}
	/** Site pages open in a panel over the island instead of navigating away. */
	let panel = $state<{ url: string; title: string } | null>(null);
	const inPanel = (url: string) => url.startsWith('/') && url !== '/' && !url.startsWith('/island');
	function openPanel(e: MouseEvent, url: string, title: string) {
		if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
		e.preventDefault();
		panel = { url, title };
	}
	function onSelect(id: string | null) {
		selected = id;
		if (id && ENTRIES[id]?.find && !found.includes(id)) {
			found = [...found, id];
			saveFound(found);
		}
	}

	onMount(() => {
		mode = isLocalNight() ? 'night' : 'day';
		found = loadFound();
		let cancelled = false;
		(async () => {
			try {
				if (!host) return;
				const mod = await import('$lib/island/createIsland');
				if (cancelled || !host) return;
				ctl = await mod.createIsland(host, {
					isFound: (id) => found.includes(id),
					onHover: (id, x, y) => (hover = id ? { id, x, y } : null),
					onSelect,
					onHud: (h) => (hud = h),
					onTime: (m) => (mode = m),
					onTour: (a) => (touring = a),
					onReady: () => (ready = true),
					onBack
				});
				if (cancelled) ctl.dispose();
				else void resumeSky();
			} catch {
				failed = true;
				setViewPref('normal');
			}
		})();
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				if (panel) panel = null;
				else ctl?.closeCard();
			}
		};
		window.addEventListener('keydown', onKey);
		return () => {
			cancelled = true;
			clearInterval(refreshTimer);
			window.removeEventListener('keydown', onKey);
			ctl?.dispose();
			ctl = null;
		};
	});
</script>

<section class="island-stage" aria-label="Daddoo Dev Field Station">
	<div class="island-host" bind:this={host}></div>

	{#if !ready && !failed}
		<div class="island-loading">Powering up the station…</div>
	{/if}
	{#if failed}
		<div class="island-loading">
			<div class="island-fallback">
				<p>WebGL is not available here.</p>
				<a class="island-btn" href="/" onclick={() => setViewPref('normal')}>Go to the standard site</a>
			</div>
		</div>
	{/if}

	<div class="island-hud" aria-hidden="true">
		<span>UTC {hud.utc}</span><span>MET {hud.met}</span><span>AZ {hud.az}°</span><span>EL {hud.el}°</span>
	</div>

	<div class="island-bar">
		<span class="island-count" aria-live="polite">Field journal {found.length}/{FIND_IDS.length}</span>
		<button type="button" class="island-btn" onclick={() => (touring ? ctl?.stopTour() : ctl?.startTour())}>
			{touring ? 'Stop tour' : 'Play tour'}
		</button>
		{#if sky === 'on' || sky === 'loading'}
			<button type="button" class="island-btn" onclick={resetSky}>Reset sky</button>
		{:else}
			<button type="button" class="island-btn" onclick={() => (sky = 'asking')}>Match my sky</button>
		{/if}
		<button type="button" class="island-btn" onclick={() => ctl?.cycleTime()}>
			{mode === 'day' ? 'Day' : mode === 'dusk' ? 'Golden hour' : 'Night'} ▸
		</button>
	</div>
	<p class="island-hint">Drag to orbit, all the way around and underneath. Click things. Some are hidden.</p>

	{#if tip && hover && !card}
		<div class="island-tip" style:left="{hover.x + 14}px" style:top="{hover.y + 14}px">
			{tip.find && !found.includes(hover.id) ? '? ? ?' : tip.title}
		</div>
	{/if}

	{#if sky === 'on' && skyLabel}
		<p class="island-skylabel">Your sky: {skyLabel}</p>
	{/if}

	{#if sky === 'asking' || sky === 'error'}
		<aside class="island-card island-sky" aria-live="polite">
			<button type="button" class="island-close" aria-label="Close" onclick={() => (sky = 'off')}>×</button>
			{#if sky === 'asking'}
				<h2>Match my sky</h2>
				<p>
					The island can mirror the real weather and time of day where you are. Your browser will ask for your
					location once. It is never stored on our servers. It stays on your device, and only an approximate,
					rounded position is sent to Open-Meteo, a free weather service, to fetch the forecast.
				</p>
				<div class="island-links">
					<button type="button" class="island-chip" onclick={() => matchSky()}>Allow</button>
					<button type="button" class="island-chip is-soon" onclick={() => (sky = 'off')}>Not now</button>
				</div>
			{:else}
				<h2>Couldn't match your sky</h2>
				<p>We couldn't read your location or the weather, so the island keeps its normal sky. You can try again any time.</p>
			{/if}
		</aside>
	{/if}

	{#if card}
		<aside class="island-card" aria-live="polite">
			<button type="button" class="island-close" aria-label="Close" onclick={() => ctl?.closeCard()}>×</button>
			{#if card.find}<span class="island-tag">Field journal entry</span>{/if}
			<h2>{card.title}</h2>
			<p>{card.blurb}</p>
			{#each blocks(card.links) as b, bi (bi)}
				{#if b.type === 'app'}
					<div class="island-app">
						<div class="island-app-head">
							{#if b.icon}<img class="island-app-icon" src={b.icon} alt="" width="44" height="44" />{/if}
							<span class="island-app-name">{b.project}</span>
							{#if b.site}
								{#if b.site.startsWith('/')}
									<a class="island-app-site" href={b.site} onclick={(e) => { if (b.site === '/') setViewPref('normal'); else if (inPanel(b.site!)) openPanel(e, b.site!, b.project!); }}>Visit site</a>
								{:else}
									<a class="island-app-site" href={b.site} target="_blank" rel="noopener noreferrer">Visit site ↗</a>
								{/if}
							{/if}
						</div>
						{#if b.badges.length}
							<div class="island-app-badges">
								{#each b.badges as l (l.url)}
									<a class="island-badge" href={l.url} target="_blank" rel="noopener noreferrer" aria-label={l.label}>
										{#if l.kind === 'play'}
											<img src="/images/GetItOnGooglePlay_Badge_Web_color_English.png" alt="Get it on Google Play" height="40" />
										{:else}
											<img src="/images/Download_on_the_App_Store_Badge_US-UK_RGB_blk_092917.svg" alt="Download on the App Store" height="40" />
										{/if}
									</a>
								{/each}
							</div>
						{/if}
					</div>
				{:else}
					<div class="island-links">
						{#each b.links as l (l.url)}
							{#if l.url.startsWith('/')}
								<a class="island-chip" href={l.url} onclick={(e) => { if (l.url === '/') setViewPref('normal'); else if (inPanel(l.url)) openPanel(e, l.url, l.label); }}>{l.label}</a>
							{:else}
								<a class="island-chip" href={l.url} target="_blank" rel="noopener noreferrer">{l.label} ↗</a>
							{/if}
						{/each}
					</div>
				{/if}
			{/each}
			{#if card.creditsText}
				<p class="island-credit-note">
					{card.creditsText}
					{#each card.credits ?? [] as c (c.url)}<a href={c.url} target="_blank" rel="noopener noreferrer">{c.label}</a>{' '}{/each}
				</p>
			{/if}
		</aside>
	{/if}

	{#if panel}
		<div class="island-panel" role="dialog" aria-label={panel.title}>
			<div class="island-panel-bar">
				<span class="island-panel-title">{panel.title}</span>
				<a class="island-panel-open" href={panel.url} target="_blank" rel="noopener noreferrer">Open in new tab ↗</a>
				<button type="button" class="island-close" aria-label="Close panel" onclick={() => (panel = null)}>×</button>
			</div>
			<iframe class="island-panel-frame" src={panel.url} title={panel.title}></iframe>
		</div>
	{/if}
</section>
