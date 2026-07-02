<script lang="ts">
	import { onMount } from 'svelte';
	import type { Component } from 'svelte';
	import { terminalOpen, openTerminal } from './terminalStore';

	let TerminalComponent: Component | null = null;
	let loading = false;

	function isTypingTarget(target: EventTarget | null): boolean {
		if (!(target instanceof HTMLElement)) return false;
		const tag = target.tagName;
		if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
		if (target.isContentEditable) return true;
		return Boolean(target.closest('[contenteditable="true"]'));
	}

	async function ensureTerminalLoaded(): Promise<void> {
		if (TerminalComponent || loading) return;
		loading = true;
		const mod = await import('./Terminal.svelte');
		TerminalComponent = mod.default;
		loading = false;
	}

	onMount(() => {
		const unsubscribe = terminalOpen.subscribe(async (open) => {
			if (open) {
				await ensureTerminalLoaded();
			}
		});

		const onKeydown = (event: KeyboardEvent) => {
			if (event.key !== '`' && event.key !== '~') return;
			if (isTypingTarget(event.target)) return;
			event.preventDefault();
			openTerminal();
		};

		window.addEventListener('keydown', onKeydown);

		return () => {
			unsubscribe();
			window.removeEventListener('keydown', onKeydown);
		};
	});
</script>

{#if TerminalComponent && $terminalOpen}
	<TerminalComponent />
{/if}
