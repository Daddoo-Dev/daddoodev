<script lang="ts">
	import '$lib/styles/global.css';
	import '$lib/styles/mission-control.css';
	import Header from '$lib/components/Header.svelte';
	import TelemetryBar from '$lib/components/TelemetryBar.svelte';
	import TerminalLauncher from '$lib/components/terminal/TerminalLauncher.svelte';
</script>

<Header />
<TelemetryBar />
<TerminalLauncher />

<slot />
