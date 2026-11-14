<script lang="ts">
	import { page } from '$app/state';
	import '$lib/styles/global.css';
	import '$lib/styles/mission-control.css';
	import Header from '$lib/components/Header.svelte';
	import TelemetryBar from '$lib/components/TelemetryBar.svelte';
	import TerminalLauncher from '$lib/components/terminal/TerminalLauncher.svelte';

	let { children } = $props();

	const islandScreen = $derived(page.url.pathname === '/island');
</script>

<div class={['site-chrome', { 'is-hidden': islandScreen }]}>
	<Header />
	<TelemetryBar />
</div>
<TerminalLauncher />

{@render children()}
