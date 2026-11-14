import { expect, test } from '@playwright/test';
import { expectRobots } from './helpers';

test.describe('Island (hidden)', () => {
	test('renders heading, journal counter and project links', async ({ page }) => {
		await page.goto('/island');
		await expect(page.locator('h1')).toHaveText('Daddoo Dev Field Station');
		await expect(page.getByText(/Field journal 0\/\d+|WebGL is not available/)).toBeVisible();
		await expect(page.getByRole('navigation', { name: 'Projects' })).toBeVisible();
		await expect(page.getByRole('link', { name: 'Back to normal site' })).toBeVisible();
	});

	test('saved preference sends / to /island', async ({ page }) => {
		await page.addInitScript(() => localStorage.setItem('dd-view', 'island'));
		await page.goto('/');
		await expect(page).toHaveURL(/\/island$/);
	});

	test('no preference keeps the standard home page without JavaScript', async ({ browser, baseURL }) => {
		const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
		const page = await context.newPage();
		await page.goto('/');
		await expect(page).toHaveURL(/\/$/);
		await expect(page.getByRole('heading', { name: /I ship apps and games that are live on both stores/i })).toBeVisible();
		await context.close();
	});

	test('back to normal clears the preference', async ({ page }) => {
		await page.goto('/island');
		await page.evaluate(() => localStorage.setItem('dd-view', 'island'));
		await page.getByRole('link', { name: 'Back to normal site' }).click();
		await expect(page).toHaveURL(/\/$/);
		await expect(page.evaluate(() => localStorage.getItem('dd-view'))).resolves.toBe('normal');
		await page.goto('/');
		await expect(page).toHaveURL(/\/$/);
		await expect(page.getByRole('heading', { name: /I ship apps and games that are live on both stores/i })).toBeVisible();
	});

	test('has noindex,nofollow', async ({ page }) => {
		await page.goto('/island');
		await expectRobots(page, /noindex, nofollow/i);
	});
});
