<script lang="ts">
	import { onDestroy, onMount, tick } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { closeTerminal } from './terminalStore';
	import { getBootLines, pickLastCaller, type BootLine } from './bootSequence';
	import { incrementCallerCount } from './bbsFirestore';
	import { executeCommand, type TerminalLine } from './commands';

	const PROMPT = 'guest@daddoodev:~$ ';

	let lines: TerminalLine[] = [];
	let inputValue = '';
	let bootComplete = false;
	let booting = false;
	let skipBoot = false;
	let reducedMotion = false;

	let outputEl: HTMLDivElement;
	let inputEl: HTMLInputElement;
	let overlayEl: HTMLDivElement;
	let previousFocus: HTMLElement | null = null;
	let bodyOverflow = '';

	let callerPromise: Promise<number | null> | null = null;

	function toneClass(tone: TerminalLine['tone'] = 'default'): string {
		if (tone === 'bright') return 'bbs-line--bright';
		if (tone === 'dim') return 'bbs-line--dim';
		if (tone === 'error') return 'bbs-line--error';
		return '';
	}

	function sleep(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	async function scrollOutput(): Promise<void> {
		await tick();
		if (outputEl) {
			outputEl.scrollTop = outputEl.scrollHeight;
		}
	}

	function bootLineToTerminal(line: BootLine): TerminalLine {
		return { text: line.text, tone: line.tone ?? 'default' };
	}

	async function finishBoot(allBootLines: BootLine[]): Promise<void> {
		lines = allBootLines.map(bootLineToTerminal);
		await scrollOutput();
		bootComplete = true;
		booting = false;
	}

	async function runBoot(): Promise<void> {
		booting = true;
		bootComplete = false;
		skipBoot = false;
		lines = [];

		const lastCaller = pickLastCaller();
		callerPromise = incrementCallerCount();
		const callerNumber = await callerPromise;
		const bootLines = getBootLines(lastCaller, callerNumber);

		if (reducedMotion) {
			await finishBoot(bootLines);
			return;
		}

		for (const bootLine of bootLines) {
			if (skipBoot) break;
			if (bootLine.delayMs > 0) {
				await sleep(bootLine.delayMs);
			}
			if (skipBoot) break;
			lines = [...lines, bootLineToTerminal(bootLine)];
			await scrollOutput();
		}

		if (skipBoot) {
			await finishBoot(bootLines);
			return;
		}

		bootComplete = true;
		booting = false;
	}

	function handleGlobalKeydown(event: KeyboardEvent): void {
		if (event.key === 'Escape') {
			event.preventDefault();
			handleClose();
		}
	}

	function handleBootKeydown(event: KeyboardEvent): void {
		if (bootComplete || !booting) return;
		if (event.key === 'Escape') return;
		skipBoot = true;
	}

	async function handleAction(
		action: NonNullable<Awaited<ReturnType<typeof executeCommand>>['action']>
	): Promise<void> {
		if (action.type === 'clear') {
			lines = [];
			return;
		}

		if (action.type === 'open_external') {
			window.open(action.url, '_blank', 'noopener,noreferrer');
			return;
		}

		if (action.type === 'close') {
			handleClose();
			return;
		}

		if (action.type === 'navigate') {
			handleClose();
			await goto(action.href);
		}
	}

	async function submitCommand(): Promise<void> {
		if (!bootComplete) return;

		const command = inputValue.trim();
		inputValue = '';

		if (!command) return;

		lines = [...lines, { text: `${PROMPT}${command}`, tone: 'dim' }];

		const result = await executeCommand(command);
		if (result.action?.type === 'clear') {
			lines = [];
		} else if (result.lines.length > 0) {
			lines = [...lines, ...result.lines];
		}

		await scrollOutput();

		if (result.action && result.action.type !== 'clear') {
			await handleAction(result.action);
		}
	}

	function handleInputKeydown(event: KeyboardEvent): void {
		if (event.key === 'Escape') {
			event.preventDefault();
			handleClose();
			return;
		}

		if (event.key === 'Enter') {
			event.preventDefault();
			void submitCommand();
		}
	}

	function handleClose(): void {
		const onBbsRoute = $page.url.pathname === '/bbs';
		closeTerminal();
		if (onBbsRoute) {
			void goto('/');
		}
	}

	function focusInput(): void {
		inputEl?.focus();
	}

	onMount(() => {
		previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
		bodyOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';

		reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		window.addEventListener('keydown', handleBootKeydown);
		window.addEventListener('keydown', handleGlobalKeydown);
		void runBoot().then(() => focusInput());

		return () => {
			window.removeEventListener('keydown', handleBootKeydown);
			window.removeEventListener('keydown', handleGlobalKeydown);
			document.body.style.overflow = bodyOverflow;
			previousFocus?.focus();
		};
	});

	onDestroy(() => {
		document.body.style.overflow = bodyOverflow;
	});
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div
	class="bbs-overlay"
	class:bbs-overlay--reduced={reducedMotion}
	bind:this={overlayEl}
	role="dialog"
	aria-modal="true"
	aria-label="Daddoo Dev BBS terminal"
	on:click={focusInput}
	on:keydown={() => {}}
>
	{#if !reducedMotion}
		<div class="bbs-scanlines" aria-hidden="true"></div>
	{/if}

	<div class="bbs-screen">
		<div class="bbs-output" bind:this={outputEl} aria-live="polite" aria-relevant="additions">
			{#each lines as line, index (index)}
				<div class="bbs-line {toneClass(line.tone)}">{line.text || '\u00a0'}</div>
			{/each}
		</div>

		<div class="bbs-prompt-row">
			<span class="bbs-prompt">{PROMPT}</span>
			<span class="bbs-typed">{inputValue}</span>
			<span class="bbs-cursor" aria-hidden="true"></span>
		</div>

		<input
			bind:this={inputEl}
			class="bbs-hidden-input"
			type="text"
			autocomplete="off"
			autocorrect="off"
			autocapitalize="off"
			spellcheck="false"
			aria-label="BBS command input"
			bind:value={inputValue}
			on:keydown={handleInputKeydown}
		/>
	</div>
</div>

<style>
	.bbs-overlay {
		--bbs-bg: #14100a;
		--bbs-amber: #ef9f27;
		--bbs-bright: #fac775;
		--bbs-dim: #ba7517;
		--bbs-error: #e24b4a;

		position: fixed;
		inset: 0;
		z-index: 10000;
		background: var(--bbs-bg);
		color: var(--bbs-amber);
		font-family: 'JetBrains Mono', 'Courier New', monospace;
		font-size: 15px;
		line-height: 1.6;
		text-shadow: 0 0 4px rgba(239, 159, 39, 0.35);
	}

	.bbs-overlay--reduced {
		text-shadow: none;
	}

	.bbs-scanlines {
		pointer-events: none;
		position: absolute;
		inset: 0;
		background: repeating-linear-gradient(
			to bottom,
			rgba(0, 0, 0, 0.04) 0,
			rgba(0, 0, 0, 0.04) 1px,
			transparent 1px,
			transparent 3px
		);
		z-index: 1;
	}

	@media (prefers-reduced-motion: reduce) {
		.bbs-scanlines {
			display: none;
		}

		.bbs-overlay {
			text-shadow: none;
		}

		.bbs-cursor {
			animation: none;
			opacity: 1;
		}
	}

	.bbs-screen {
		position: relative;
		z-index: 2;
		display: flex;
		flex-direction: column;
		height: 100%;
		max-width: 80ch;
		margin: 0 auto;
		padding: 24px;
		box-sizing: border-box;
	}

	.bbs-output {
		flex: 1;
		overflow-y: auto;
		min-height: 0;
		white-space: pre-wrap;
		word-break: break-word;
	}

	.bbs-line--bright {
		color: var(--bbs-bright);
	}

	.bbs-line--dim {
		color: var(--bbs-dim);
	}

	.bbs-line--error {
		color: var(--bbs-error);
	}

	.bbs-prompt-row {
		flex-shrink: 0;
		display: flex;
		align-items: baseline;
		flex-wrap: wrap;
		margin-top: 0.5rem;
	}

	.bbs-prompt {
		color: var(--bbs-amber);
	}

	.bbs-typed {
		color: var(--bbs-bright);
		white-space: pre-wrap;
		word-break: break-all;
	}

	.bbs-cursor {
		display: inline-block;
		width: 0.62em;
		height: 1.1em;
		margin-left: 1px;
		background: var(--bbs-amber);
		vertical-align: text-bottom;
		animation: bbs-blink 1.06s steps(1, end) infinite;
	}

	@keyframes bbs-blink {
		0%,
		49% {
			opacity: 1;
		}
		50%,
		100% {
			opacity: 0;
		}
	}

	.bbs-hidden-input {
		position: absolute;
		left: -9999px;
		width: 1px;
		height: 1px;
		opacity: 0;
	}

	@media (max-width: 640px) {
		.bbs-overlay {
			font-size: 14px;
		}

		.bbs-screen {
			padding: 16px;
		}
	}
</style>
