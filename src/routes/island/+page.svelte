<script lang="ts">
	import '$lib/styles/island.css';
	import SEO from '$lib/components/SEO.svelte';
	import IslandScene from '$lib/components/IslandScene.svelte';
	import { BUILDINGS } from '$lib/island/data';

	const listed = Object.values(BUILDINGS);
</script>

<SEO
	title="Field Station | Daddoo Dev"
	description="A tiny floating field station. Work in progress."
	url="https://daddoodev.pro/island"
	noindex={true}
/>

<main class="island-page">
	<h1 class="island-sr">Daddoo Dev Field Station</h1>
	<IslandScene />
	<nav class="island-list" aria-label="Projects">
		<h2>Projects</h2>
		<ul>
			{#each listed as b (b.title)}
				<li>
					<strong>{b.title}</strong>
					{#each b.links.filter((l) => l.url) as l (l.url)}
						<a href={l.url} rel="noopener noreferrer">{l.label}</a>
					{/each}
				</li>
			{/each}
		</ul>
	</nav>
</main>
