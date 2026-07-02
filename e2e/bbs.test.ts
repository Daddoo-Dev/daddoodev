import { expect, test } from '@playwright/test';
import {
	TERMINAL_SELECTOR,
	openTerminalFromHome,
	runTerminalCommand,
	skipTerminalBoot
} from './helpers';

test('pressing ~ on homepage opens terminal; not when contact form focused', async ({ page }) => {
	await page.goto('/');
	await page.locator('h1').click();
	await page.keyboard.press('Backquote');
	await expect(page.locator(TERMINAL_SELECTOR)).toBeVisible({ timeout: 10000 });

	await page.keyboard.press('Escape');
	await expect(page.locator(TERMINAL_SELECTOR)).toBeHidden();

	await page.locator('#name').focus();
	await page.keyboard.press('Backquote');
	await expect(page.locator(TERMINAL_SELECTOR)).toBeHidden();
});

test('Escape closes terminal and returns focus', async ({ page }) => {
	await page.goto('/');
	const textMode = page.getByRole('button', { name: 'TEXT MODE' });
	await textMode.focus();
	await textMode.click();
	await expect(page.locator(TERMINAL_SELECTOR)).toBeVisible({ timeout: 10000 });
	await skipTerminalBoot(page);

	await page.keyboard.press('Escape');
	await expect(page.locator(TERMINAL_SELECTOR)).toBeHidden();
	await expect(textMode).toBeFocused();
});

test('visiting /bbs boots the terminal directly', async ({ page }) => {
	await page.goto('/bbs');
	await expect(page.locator(TERMINAL_SELECTOR)).toBeVisible({ timeout: 10000 });
});

test('any keypress during boot skips to the prompt', async ({ page }) => {
	await openTerminalFromHome(page);
	await page.keyboard.press('a');
	await expect(page.getByText('Type HELP for commands.')).toBeVisible();
	await expect(page.locator('.bbs-prompt-row')).toBeVisible();
});

test('help, ls, whoami, clear, exit behave per spec', async ({ page }) => {
	await openTerminalFromHome(page);
	await skipTerminalBoot(page);

	await runTerminalCommand(page, 'help');
	await expect(page.getByText('Available commands:')).toBeVisible();

	await runTerminalCommand(page, 'ls');
	await expect(page.getByText('ridewealth/')).toBeVisible();

	await runTerminalCommand(page, 'whoami');
	await expect(page.getByText('guest — but you can leave a name in the guestbook')).toBeVisible();

	await runTerminalCommand(page, 'clear');
	await expect(page.getByText('ridewealth/')).toBeHidden();

	await runTerminalCommand(page, 'exit');
	await expect(page.locator(TERMINAL_SELECTOR)).toBeHidden();
});

test('open conclavium opens conclavium.app in a new tab', async ({ page, context }) => {
	await openTerminalFromHome(page);
	await skipTerminalBoot(page);

	const popupPromise = context.waitForEvent('page');
	await runTerminalCommand(page, 'open conclavium');
	const popup = await popupPromise;
	await expect(popup).toHaveURL(/conclavium\.app/);
});

test('unknown command prints error line', async ({ page }) => {
	await openTerminalFromHome(page);
	await skipTerminalBoot(page);

	await runTerminalCommand(page, 'notacommand');
	await expect(page.getByText('command not found: notacommand — type HELP')).toBeVisible();
});

test('sudo make me a sandwich prints the sudoers joke', async ({ page }) => {
	await openTerminalFromHome(page);
	await skipTerminalBoot(page);

	await runTerminalCommand(page, 'sudo make me a sandwich');
	await expect(
		page.getByText('guest is not in the sudoers file. This incident will be reported to the SysOp.')
	).toBeVisible();
});

test('reduced motion: instant boot and no scanline overlay', async ({ page }) => {
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.goto('/');
	await page.locator('h1').click();
	await page.keyboard.press('Backquote');
	await expect(page.locator(TERMINAL_SELECTOR)).toBeVisible({ timeout: 10000 });
	await expect(page.getByText('Type HELP for commands.')).toBeVisible({ timeout: 3000 });
	await expect(page.locator('.bbs-scanlines')).toHaveCount(0);
});

test('terminal component lazy-loads on activation', async ({ page }) => {
	const terminalChunks: string[] = [];
	page.on('request', (request) => {
		const url = request.url();
		if (/Terminal\.[A-Za-z0-9_-]+\.js/.test(url)) {
			terminalChunks.push(url);
		}
	});

	await page.goto('/');
	expect(terminalChunks.length).toBe(0);

	await page.locator('h1').click();
	await page.keyboard.press('Backquote');
	await expect(page.locator(TERMINAL_SELECTOR)).toBeVisible({ timeout: 10000 });

	await expect.poll(() => terminalChunks.length, { timeout: 10000 }).toBeGreaterThan(0);
});

test('footer TEXT MODE opens the terminal', async ({ page }) => {
	await page.goto('/');
	await page.getByRole('button', { name: 'TEXT MODE' }).click();
	await expect(page.locator(TERMINAL_SELECTOR)).toBeVisible({ timeout: 10000 });
});

test('clocks command prints time formats', async ({ page }) => {
	await openTerminalFromHome(page);
	await skipTerminalBoot(page);
	await runTerminalCommand(page, 'clocks');

	await expect(page.getByText(/^Standard:/)).toBeVisible();
	await expect(page.getByText(/^Decimal:/)).toBeVisible();
	await expect(page.getByText(/^Hobbit:/)).toBeVisible();
});

test('dir command aliases ls output', async ({ page }) => {
	await openTerminalFromHome(page);
	await skipTerminalBoot(page);
	await runTerminalCommand(page, 'dir');

	await expect(page.getByText('This is a respectable UNIX-flavored board. But fine:')).toBeVisible();
	await expect(page.getByText('ridewealth/')).toBeVisible();
});

test('pray command prints a saint invocation', async ({ page }) => {
	await openTerminalFromHome(page);
	await skipTerminalBoot(page);
	await runTerminalCommand(page, 'pray');

	await expect(page.locator('.bbs-line--bright').filter({ hasText: /^\/\/ St / })).toBeVisible();
});
