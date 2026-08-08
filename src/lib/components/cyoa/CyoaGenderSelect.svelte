<script lang="ts">
	import type { StoryGender } from '$lib/cyoa/types';

	let { onSelect }: { onSelect: (gender: StoryGender) => void } = $props();
</script>

<div class="cyoa-panel">
	<h1 class="cyoa-title">Choose your path</h1>
	<p class="muted">Are you male or are you female?</p>
	<div class="cyoa-choices">
		<button type="button" class="primary-button" onclick={() => onSelect('male')}>Male</button>
		<button type="button" class="primary-button" onclick={() => onSelect('female')}>Female</button>
	</div>
</div>
