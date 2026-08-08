<script lang="ts">
	import type { StoryNode } from '$lib/cyoa/types';

	let {
		node,
		onChoose,
		onRestart
	}: {
		node: StoryNode;
		onChoose: (to: string) => void;
		onRestart: () => void;
	} = $props();

	const paragraphs = $derived(
		node.text
			.split(/\n\s*\n/)
			.map((p) => p.replace(/\n/g, ' ').trim())
			.filter(Boolean)
	);

	const ended = $derived(node.choices.length === 0);
</script>

<article class="cyoa-panel cyoa-story">
	<div class="cyoa-prose">
		{#each paragraphs as para (para.slice(0, 48))}
			<p>{para}</p>
		{/each}
	</div>

	{#if ended}
		<p class="cyoa-end muted">The end.</p>
		<div class="cyoa-choices">
			<button type="button" class="primary-button" onclick={onRestart}>Start over</button>
		</div>
	{:else}
		<div class="cyoa-choices">
			{#each node.choices as choice (choice.to + choice.label)}
				<button type="button" class="primary-button" onclick={() => onChoose(choice.to)}>
					{choice.label}
				</button>
			{/each}
		</div>
	{/if}
</article>
