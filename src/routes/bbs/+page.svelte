<script lang="ts">
	import { onMount } from 'svelte';
	import { openTerminal } from '$lib/components/terminal/terminalStore';

	onMount(() => {
		openTerminal();
	});
</script>

<svelte:head>
	<title>Text mode — Daddoo Dev</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>
