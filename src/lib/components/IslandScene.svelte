<script lang="ts">
	import { onMount } from 'svelte';
	import { ENTRIES, FIND_IDS, FOUND_STORAGE_KEY } from '$lib/island/data';
	import { setViewPref } from '$lib/island/preference';
	import { isLocalNight } from '$lib/island/time';
	import type { IslandController, IslandHud, TimeMode } from '$lib/island/createIsland';

	let { onBack }: { onBack: () => void } = $props();

	let host = $state<HTMLDivElement | null>(null);
	let ctl: IslandController | null = null;
	let ready = $state(false);
	let failed = $state(false);
	let mode = $state<TimeMode>('dusk');
	let touring = $state(false);
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
			} catch {
				failed = true;
				setViewPref('normal');
			}
		})();
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') ctl?.closeCard();
		};
		window.addEventListener('keydown', onKey);
		return () => {
			cancelled = true;
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

	{#if card}
		<aside class="island-card" aria-live="polite">
			<button type="button" class="island-close" aria-label="Close" onclick={() => ctl?.closeCard()}>×</button>
			{#if card.find}<span class="island-tag">Field journal entry</span>{/if}
			<h2>{card.title}</h2>
			<p>{card.blurb}</p>
			{#if card.links.length}
				<div class="island-links">
					{#each card.links as l (l.url)}
						{#if l.url.startsWith('/')}
							<a class="island-chip" href={l.url} onclick={() => { if (l.url === '/') setViewPref('normal'); }}>{l.label}</a>
						{:else}
							<a class="island-chip" href={l.url} target="_blank" rel="noopener noreferrer">{l.label} ↗</a>
						{/if}
					{/each}
				</div>
			{/if}
		</aside>
	{/if}
</section>
