<script lang="ts">
	import '$lib/styles/global.css';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	onMount(() => {
		goto('/analytics/conclavium', { replaceState: true });
	});
</script>

<svelte:head>
	<title>Redirecting…</title>
</svelte:head>

<div class="container km-analytics">
	<p class="km-analytics-empty">Redirecting to Conclavium analytics…</p>
</div>
