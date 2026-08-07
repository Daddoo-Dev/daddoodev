<script lang="ts">
	import { untrack } from 'svelte';
	import { CITIES } from '$lib/triptime/constants';
	import { money } from '$lib/triptime/compare';
	import { postTripAction } from '$lib/triptime/client';
	import { buildItinerary } from '$lib/triptime/itinerary';
	import { bookingLinksForWindow } from '$lib/triptime/links';
	import { formatWindowLabel, generateWindows } from '$lib/triptime/windows';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let store = $state(untrack(() => data.store));
	let notes = $state(untrack(() => data.store.notes[data.city] ?? ''));
	let status = $state('');

	const city = $derived(data.city);
	const meta = $derived(CITIES[city]);
	const windows = $derived(generateWindows(store.settings));
	const selectedWindow = $derived.by(() => {
		const id = store.selectedWindowId ?? store.compare?.sharedWindow?.id;
		return windows.find((w) => w.id === id) ?? store.compare?.sharedWindow ?? windows[0] ?? null;
	});
	const quote = $derived.by(() => {
		if (!selectedWindow) return null;
		return store.quotes.find((q) => q.city === city && q.window.id === selectedWindow.id) ?? null;
	});
	const days = $derived(selectedWindow ? buildItinerary(city, selectedWindow) : []);
	const links = $derived(
		selectedWindow ? bookingLinksForWindow(city, selectedWindow, store.settings) : null
	);

	async function saveNotes() {
		status = 'Saving…';
		try {
			const res = await postTripAction({
				action: 'notes',
				notes: { ...store.notes, [city]: notes }
			});
			store = res.store;
			status = 'Notes saved.';
		} catch (e) {
			status = e instanceof Error ? e.message : 'Save failed';
		}
	}
</script>

<svelte:head>
	<title>TripTime — {meta.label}</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<section class="triptime">
	<p class="triptime-back"><a href="/triptime">← TripTime hub</a></p>

	<header class="triptime-header">
		<p class="section-label">{meta.country}</p>
		<h1 class="triptime-title">{meta.label}</h1>
		<p class="triptime-sub">
			{#if selectedWindow}
				Plan for {formatWindowLabel(selectedWindow)} · {money(quote?.totalUsd)} estimated total
			{:else}
				Pick a window on the hub after scanning
			{/if}
		</p>
	</header>

	{#if links}
		<div class="triptime-actions triptime-actions--row">
			<a class="primary-button" href={links.flightsGoogle} target="_blank" rel="noopener noreferrer">Google Flights</a>
			<a class="secondary-button" href={links.flightsSkyscanner} target="_blank" rel="noopener noreferrer">Skyscanner</a>
			<a class="secondary-button" href={links.hotels} target="_blank" rel="noopener noreferrer">Hotels</a>
		</div>
	{/if}

	{#if quote?.flight}
		<p class="triptime-fare">
			Flight: {money(quote.flight.priceUsd)} · {quote.flight.airline} ·
			{quote.flight.stops === 0 ? 'nonstop' : quote.flight.stops > 0 ? `${quote.flight.stops} stop(s)` : 'see link'}
			· {quote.flight.durationOutbound} out / {quote.flight.durationReturn} back
		</p>
		{#if quote.flightUpgrade}
			<p class="triptime-upgrade">
				Premium economy within range: {money(quote.flightUpgrade.priceUsd)}
				<a href={quote.flightUpgrade.bookingLink} target="_blank" rel="noopener noreferrer">Open</a>
			</p>
		{/if}
	{/if}
	{#if quote?.hotel}
		<p class="triptime-fare">
			Hotel: {money(quote.hotel.priceTotalUsd)} total
			({money(quote.hotel.pricePerNightUsd)}/night)
			{quote.hotel.estimated ? '· mid-band estimate' : `· ${quote.hotel.name}`}
		</p>
	{/if}

	<section class="triptime-must">
		<h2 class="triptime-section-title">Must-sees & rules</h2>
		<ul class="triptime-list">
			{#each meta.mustSees as item}
				<li>{item}</li>
			{/each}
		</ul>
		<ul class="triptime-list triptime-list--rules">
			{#each meta.constraints as item}
				<li>{item}</li>
			{/each}
		</ul>
	</section>

	<section class="triptime-itinerary">
		<h2 class="triptime-section-title">Day plan</h2>
		<p class="triptime-sub">Built around Mass day and city constraints. Adjust after you lock flights.</p>
		{#each days as day (day.date)}
			<article class="triptime-day" class:triptime-day--mass={day.isMassDay}>
				<p class="triptime-day-meta">
					Day {day.dayIndex + 1} · {day.weekday} · {day.date}
					{#if day.isMassDay}<span class="triptime-chip">Mass</span>{/if}
					{#if day.isLourdesOvernight}<span class="triptime-chip">Lourdes</span>{/if}
				</p>
				<h3 class="triptime-day-title">{day.title}</h3>
				<ul class="triptime-list">
					{#each day.notes as note}
						<li>{note}</li>
					{/each}
				</ul>
			</article>
		{/each}
	</section>

	<section class="triptime-notes">
		<h2 class="triptime-section-title">Notes</h2>
		<textarea class="triptime-textarea" rows="5" bind:value={notes} placeholder="Hotel favorites, Mass times, restaurant ideas…"></textarea>
		<button class="primary-button" type="button" onclick={saveNotes}>Save notes</button>
		{#if status}
			<p class="triptime-status">{status}</p>
		{/if}
	</section>
</section>
