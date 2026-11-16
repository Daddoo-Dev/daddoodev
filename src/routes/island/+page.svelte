<script lang="ts">
	import { goto } from '$app/navigation';
	import '$lib/styles/island.css';
	import SEO from '$lib/components/SEO.svelte';
	import IslandScene from '$lib/components/IslandScene.svelte';
	import { BUILDINGS } from '$lib/island/data';
	import { setViewPref } from '$lib/island/preference';

	const listed = Object.values(BUILDINGS);

	function leaveIsland() {
		setViewPref('normal');
		goto('/');
	}
</script>

<SEO
	title="Field Station | Daddoo Dev"
	description="A tiny floating field station. Work in progress."
	url="https://daddoodev.pro/island"
	noindex={true}
/>

<main class="island-page">
	<h1 class="island-sr">Daddoo Dev Field Station</h1>
	<IslandScene onBack={leaveIsland} />
	<nav class="island-list" aria-label="Projects">
		<h2>Projects</h2>
		<ul>
			{#each listed as b (b.title)}
				<li>
					<strong>{b.title}</strong>
					{#each b.links as l (l.url)}
						<a href={l.url} rel="noopener noreferrer">{l.label}</a>
					{/each}
				</li>
			{/each}
			<li>
				<a href="/" onclick={() => setViewPref('normal')}>Back to normal site</a>
			</li>
		</ul>
	</nav>
	<p class="island-credits">
		Models via <a href="https://poly.pizza" rel="noopener noreferrer">Poly Pizza</a>: Church, Giraffe, Killer Whale and Railway Carriage by Poly by
		Google (<a href="https://creativecommons.org/licenses/by/3.0/" rel="noopener noreferrer">CC-BY</a>); Arcade Machine by J-Toastie (CC-BY); House by burunduk (CC-BY); Yeti by Quaternius (CC0).
	</p>
</main>
