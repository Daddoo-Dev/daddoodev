<script lang="ts">
	import { onMount } from 'svelte';
	import CyoaLogin from '$lib/components/cyoa/CyoaLogin.svelte';
	import CyoaGenderSelect from '$lib/components/cyoa/CyoaGenderSelect.svelte';
	import CyoaReader from '$lib/components/cyoa/CyoaReader.svelte';
	import { isCyoaAuthed, cyoaLogout } from '$lib/cyoa/auth';
	import { maleStory } from '$lib/cyoa/male';
	import { femaleStory } from '$lib/cyoa/female';
	import type { StoryGender, StoryNode } from '$lib/cyoa/types';

	type Screen = 'loading' | 'login' | 'gender' | 'story';

	let screen = $state<Screen>('loading');
	let gender = $state<StoryGender | null>(null);
	let nodeId = $state('1');

	const story = $derived(gender === 'female' ? femaleStory : maleStory);
	const node = $derived.by((): StoryNode | null => {
		if (!gender) return null;
		return story[nodeId] ?? null;
	});

	onMount(() => {
		screen = isCyoaAuthed() ? 'gender' : 'login';
	});

	function onAuthed() {
		screen = 'gender';
	}

	function onGender(g: StoryGender) {
		gender = g;
		nodeId = '1';
		screen = 'story';
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	function onChoose(to: string) {
		nodeId = to;
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	function onRestart() {
		gender = null;
		nodeId = '1';
		screen = 'gender';
	}

	function logout() {
		cyoaLogout();
		gender = null;
		nodeId = '1';
		screen = 'login';
	}
</script>

<svelte:head>
	<title>Private — Daddoo Dev</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="cyoa-page">
	<div class="container cyoa-container">
		{#if screen !== 'loading' && screen !== 'login'}
			<div class="cyoa-toolbar">
				{#if screen === 'story'}
					<button type="button" class="secondary-button" onclick={onRestart}>Change path</button>
				{/if}
				<button type="button" class="secondary-button" onclick={logout}>Sign out</button>
			</div>
		{/if}

		{#if screen === 'login'}
			<CyoaLogin onSuccess={onAuthed} />
		{:else if screen === 'gender'}
			<CyoaGenderSelect onSelect={onGender} />
		{:else if screen === 'story' && node}
			<CyoaReader {node} {onChoose} {onRestart} />
		{:else if screen === 'story'}
			<div class="cyoa-panel">
				<p class="error">Story page not found.</p>
				<button type="button" class="primary-button" onclick={onRestart}>Start over</button>
			</div>
		{/if}
	</div>
</div>
