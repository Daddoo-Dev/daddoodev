import { expect, test } from '@playwright/test';
import { expectSiteShell, runTerminalCommand, skipTerminalBoot } from './helpers';

test.describe('QR Generator', () => {
	test('generates a QR code from a URL', async ({ page }) => {
		await page.goto('/qr-generator');
		await expectSiteShell(page);

		await page.locator('#url-input').fill('https://daddoodev.pro');
		await page.getByRole('button', { name: 'Generate QR Code' }).click();

		await expect(page.locator('.qr-result')).toBeVisible({ timeout: 10000 });
		await expect(page.locator('.qr-code-container svg')).toBeVisible();
		await expect(page.getByRole('heading', { name: 'Your QR Code' })).toBeVisible();
		await expect(page.getByRole('button', { name: 'Save SVG' })).toBeVisible();
		await expect(page.getByRole('button', { name: 'Save PNG' })).toBeVisible();
	});
});

test.describe('Telemetry bar', () => {
	test('renders on public subroutes', async ({ page }) => {
		for (const path of ['/', '/clocks', '/qr-generator', '/privacy']) {
			await page.goto(path);
			await expect(page.locator('.telemetry-bar')).toBeVisible();
			await expect(page.getByText('3 apps in production')).toBeVisible();
		}
	});

	test('renders on hidden marketminder login', async ({ page }) => {
		await page.goto('/marketminder/login');
		await expect(page.locator('.telemetry-bar')).toBeVisible();
	});
});

test.describe('BBS guestbook command', () => {
	test('guestbook command responds without throwing', async ({ page }) => {
		await page.goto('/');
		await page.getByRole('button', { name: 'TEXT MODE' }).click();
		await skipTerminalBoot(page);
		await runTerminalCommand(page, 'guestbook');

		await expect(
			page.locator('.bbs-line').filter({ hasText: /No entries yet|\[\d{2}\/\d{2}\]/ })
		).toBeVisible({ timeout: 10000 });
	});

	test('sign command validates handle length', async ({ page }) => {
		await page.goto('/');
		await page.getByRole('button', { name: 'TEXT MODE' }).click();
		await skipTerminalBoot(page);
		await runTerminalCommand(page, 'sign x hi');

		await expect(page.getByText('Handle must be 2–24 characters.')).toBeVisible();
	});
});
