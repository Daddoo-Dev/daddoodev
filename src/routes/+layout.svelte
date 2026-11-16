<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import '$lib/styles/global.css';
	import '$lib/styles/mission-control.css';
	import Header from '$lib/components/Header.svelte';
	import TelemetryBar from '$lib/components/TelemetryBar.svelte';
	import TerminalLauncher from '$lib/components/terminal/TerminalLauncher.svelte';

	let { children } = $props();

	// pages shown inside the island's panel (an iframe) drop the site header and launcher
	let embedded = $state(false);
	onMount(() => {
		embedded = window.self !== window.top;
	});
	const islandScreen = $derived(page.url.pathname === '/island' || embedded);
</script>

<div class={['site-chrome', { 'is-hidden': islandScreen }]}>
	<Header />
	<TelemetryBar />
</div>
{#if !embedded}
	<TerminalLauncher />
{/if}

{@render children()}
