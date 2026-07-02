import { writable } from 'svelte/store';

export const terminalOpen = writable(false);

export function openTerminal(): void {
	terminalOpen.set(true);
}

export function closeTerminal(): void {
	terminalOpen.set(false);
}
