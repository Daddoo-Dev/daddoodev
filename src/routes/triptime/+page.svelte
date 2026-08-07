<script lang="ts">
	import { untrack } from 'svelte';
	import { CITIES } from '$lib/triptime/constants';
	import { money } from '$lib/triptime/compare';
	import { postTripAction } from '$lib/triptime/client';
	import { bookingLinksForWindow } from '$lib/triptime/links';
	import { formatWindowLabel, generateWindows } from '$lib/triptime/windows';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let store = $state(untrack(() => data.store));
	let adults = $state(untrack(() => data.store.settings.adults));
	let status = $state<'idle' | 'scanning' | 'saving' | 'error'>('idle');
	let message = $state('');

	const windows = $derived(generateWindows(store.settings));
	const compare = $derived(store.compare);
	const selectedId = $derived(store.selectedWindowId ?? compare?.sharedWindow?.id ?? null);
	const selectedWindow = $derived(windows.find((w) => w.id === selectedId) ?? compare?.sharedWindow ?? null);

	async function saveAdults() {
		status = 'saving';
		message = '';
		try {
			const res = await postTripAction({
				action: 'settings',
				settings: { ...store.settings, adults }
			});
			store = res.store;
			status = 'idle';
			message = 'Party size saved.';
		} catch (e) {
			status = 'error';
			message = e instanceof Error ? e.message : 'Save failed';
		}
	}

	async function runScan() {
		status = 'scanning';
		message = 'Scanning Google Flights for every June window (free SerpAPI) — can take a few minutes…';
		try {
			const res = await postTripAction({ action: 'scan' });
			store = res.store;
			adults = store.settings.adults;
			status = 'idle';
			message = `Scan complete${store.lastScanAt ? ` · ${new Date(store.lastScanAt).toLocaleString()}` : ''}.`;
		} catch (e) {
			status = 'error';
			message = e instanceof Error ? e.message : 'Scan failed';
		}
	}

	async function selectWindow(id: string) {
		status = 'saving';
		try {
			const res = await postTripAction({ action: 'select', selectedWindowId: id });
			store = res.store;
			status = 'idle';
		} catch (e) {
			status = 'error';
			message = e instanceof Error ? e.message : 'Could not select window';
		}
	}

	function linksFor(city: 'paris' | 'rome') {
		if (!selectedWindow) return null;
		return bookingLinksForWindow(city, selectedWindow, store.settings);
	}
</script>

<svelte:head>
	<title>TripTime — Paris vs Rome</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<section class="triptime">
	<header class="triptime-header">
		<p class="section-label">Private planner</p>
		<h1 class="triptime-title">TripTime</h1>
		<p class="triptime-sub">
			Romance trip · DEN · {store.settings.nights} nights · June {store.settings.windowStartDay}–{store.settings.windowEndDay}, {store.settings.year}
		</p>
	</header>

	<div class="triptime-toolbar">
		<label class="triptime-field">
			<span class="triptime-label">Adults</span>
			<input class="triptime-input" type="number" min="1" max="8" bind:value={adults} />
		</label>
		<button class="primary-button" type="button" onclick={saveAdults} disabled={status === 'scanning'}>
			Save party
		</button>
		<button class="secondary-button" type="button" onclick={runScan} disabled={status === 'scanning'}>
			{status === 'scanning' ? 'Scanning…' : 'Scan prices'}
		</button>
		{#if selectedWindow}
			<span class="triptime-chip">Window: {formatWindowLabel(selectedWindow)}</span>
		{/if}
	</div>

	{#if status === 'scanning'}
		<div class="triptime-scan" role="status" aria-live="polite">
			<div class="triptime-scan-radar" aria-hidden="true">
				<span class="triptime-scan-ring"></span>
				<span class="triptime-scan-ring"></span>
				<span class="triptime-scan-beam"></span>
				<span class="triptime-scan-dot"></span>
			</div>
			<div class="triptime-scan-copy">
				<p class="triptime-scan-title">Scanning fares</p>
				<p class="triptime-scan-detail">{message}</p>
				<div class="triptime-scan-track" aria-hidden="true">
					<span class="triptime-scan-bar"></span>
				</div>
				<ul class="triptime-scan-ticks" aria-hidden="true">
					<li>DEN → Paris</li>
					<li>DEN → Rome</li>
					<li>June windows</li>
					<li>Hotel band</li>
				</ul>
			</div>
		</div>
	{:else if message}
		<p class="triptime-status" class:triptime-status--error={status === 'error'}>{message}</p>
	{/if}

	{#if !store.flightsConfigured}
		<p class="triptime-banner">
			Needs a free SerpAPI key for Google Flights Scan. Create an account at
			<a href="https://serpapi.com/users/sign_up" target="_blank" rel="noopener noreferrer">serpapi.com</a>
			(free plan), then give me the API key to put in <code>.env</code> as <code>SERPAPI_API_KEY</code>.
		</p>
	{/if}

	{#if compare?.gapFlags?.length}
		<div class="triptime-gap" role="status">
			<p class="triptime-gap-title">Date gap alert (${store.settings.gapThresholdUsd}+)</p>
			<ul class="triptime-gap-list">
				{#each compare.gapFlags as flag (flag.city + flag.bestWindow.id)}
					<li>
						<strong>{CITIES[flag.city].label}</strong> is
						{money(flag.savingsUsd)} cheaper on {formatWindowLabel(flag.bestWindow)}
						({money(flag.bestTotalUsd)}) than on the shared window
						{formatWindowLabel(flag.sharedWindow)} ({money(flag.sharedTotalUsd)}). That could sway the city choice.
					</li>
				{/each}
			</ul>
		</div>
	{/if}

	<div class="triptime-compare">
		<article class="triptime-city-card">
			<h2 class="triptime-city-name">{CITIES.paris.label}</h2>
			<p class="triptime-price">{money(compare?.sharedTotalParis)}</p>
			<p class="triptime-price-note">Shared window total (flights + hotel band)</p>
			{#if compare?.bestParis && compare.bestParis.window.id !== compare.sharedWindow?.id}
				<p class="triptime-best-alt">
					Own best: {money(compare.bestParis.totalUsd)} · {formatWindowLabel(compare.bestParis.window)}
				</p>
			{/if}
			{#if compare?.sharedParis?.flightUpgrade}
				<p class="triptime-upgrade">
					Premium economy nearby: {money(compare.sharedParis.flightUpgrade.priceUsd)}
				</p>
			{/if}
			<div class="triptime-actions">
				<a class="primary-button" href="/triptime/paris">Plan Paris</a>
				{#if linksFor('paris')}
					<a class="secondary-button" href={linksFor('paris')!.flightsGoogle} target="_blank" rel="noopener noreferrer">Google Flights</a>
					<a class="secondary-button" href={linksFor('paris')!.flightsSkyscanner} target="_blank" rel="noopener noreferrer">Skyscanner</a>
					<a class="secondary-button" href={linksFor('paris')!.hotels} target="_blank" rel="noopener noreferrer">Hotels</a>
				{/if}
			</div>
		</article>

		<article class="triptime-city-card">
			<h2 class="triptime-city-name">{CITIES.rome.label}</h2>
			<p class="triptime-price">{money(compare?.sharedTotalRome)}</p>
			<p class="triptime-price-note">Shared window total (flights + hotel band)</p>
			{#if compare?.bestRome && compare.bestRome.window.id !== compare.sharedWindow?.id}
				<p class="triptime-best-alt">
					Own best: {money(compare.bestRome.totalUsd)} · {formatWindowLabel(compare.bestRome.window)}
				</p>
			{/if}
			{#if compare?.sharedRome?.flightUpgrade}
				<p class="triptime-upgrade">
					Premium economy nearby: {money(compare.sharedRome.flightUpgrade.priceUsd)}
				</p>
			{/if}
			<div class="triptime-actions">
				<a class="primary-button" href="/triptime/rome">Plan Rome</a>
				{#if linksFor('rome')}
					<a class="secondary-button" href={linksFor('rome')!.flightsGoogle} target="_blank" rel="noopener noreferrer">Google Flights</a>
					<a class="secondary-button" href={linksFor('rome')!.flightsSkyscanner} target="_blank" rel="noopener noreferrer">Skyscanner</a>
					<a class="secondary-button" href={linksFor('rome')!.hotels} target="_blank" rel="noopener noreferrer">Hotels</a>
				{/if}
			</div>
		</article>
	</div>

	<section class="triptime-windows">
		<h2 class="triptime-section-title">7-day windows</h2>
		<p class="triptime-sub">Same calendar window for both cities. Select one to lock the shared plan.</p>
		<div class="triptime-table-wrap">
			<table class="triptime-table">
				<thead>
					<tr>
						<th>Dates</th>
						<th>Paris</th>
						<th>Rome</th>
						<th></th>
					</tr>
				</thead>
				<tbody>
					{#each windows as w (w.id)}
						{@const paris = store.quotes.find((q) => q.city === 'paris' && q.window.id === w.id)}
						{@const rome = store.quotes.find((q) => q.city === 'rome' && q.window.id === w.id)}
						<tr class:triptime-row-selected={w.id === selectedId}>
							<td>{formatWindowLabel(w)}</td>
							<td>{money(paris?.totalUsd)}</td>
							<td>{money(rome?.totalUsd)}</td>
							<td>
								<button
									class="secondary-button triptime-select-btn"
									type="button"
									onclick={() => selectWindow(w.id)}
									disabled={w.id === selectedId}
								>
									{w.id === selectedId ? 'Selected' : 'Use'}
								</button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		{#if store.quotes.length === 0}
			<p class="triptime-empty">No scan yet — click Scan prices once the SerpAPI key is set.</p>
		{/if}
	</section>
</section>
