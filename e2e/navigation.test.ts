import { expect, test } from '@playwright/test';

test.describe('Header navigation', () => {
	test('logo returns to homepage', async ({ page }) => {
		await page.goto('/clocks');
		await page.locator('a.logo-wordmark').click();
		await expect(page).toHaveURL(/\/(#home)?$/);
		await expect(page.locator('h1.hero-title')).toBeVisible();
	});

	test('Lab link opens ChronoCluster', async ({ page }) => {
		await page.goto('/');
		await page.getByRole('link', { name: 'Lab', exact: true }).click();
		await expect(page).toHaveURL(/\/clocks$/);
		await expect(page.locator('h1.page-title')).toHaveText('ChronoCluster');
	});

	test('Work link from subroute lands on homepage projects section', async ({ page }) => {
		await page.goto('/clocks');
		await page.getByRole('link', { name: 'Work', exact: true }).click();
		await expect(page).toHaveURL(/\/(#projects)?$/);
		await expect(page.locator('#projects')).toBeVisible();
	});

	test('Tools link from subroute lands on homepage tools section', async ({ page }) => {
		await page.goto('/clocks');
		await page.getByRole('link', { name: 'Tools', exact: true }).click();
		await expect(page).toHaveURL(/\/(#tools)?$/);
		await expect(page.locator('#tools')).toBeVisible();
	});

	test('About link from subroute lands on homepage about section', async ({ page }) => {
		await page.goto('/clocks');
		await page.getByRole('link', { name: 'About', exact: true }).click();
		await expect(page).toHaveURL(/\/(#about)?$/);
		await expect(page.locator('#about')).toBeVisible();
	});

	test('Contact link from subroute lands on homepage contact section', async ({ page }) => {
		await page.goto('/clocks');
		await page.getByRole('link', { name: 'Contact', exact: true }).click();
		await expect(page).toHaveURL(/\/(#contact)?$/);
		await expect(page.locator('#contact')).toBeVisible();
	});
});

test.describe('Footer navigation', () => {
	test('footer project links reach public routes', async ({ page }) => {
		await page.goto('/');

		await page.locator('footer a[href="/twistedfortunes"]').click();
		await expect(page).toHaveURL(/\/twistedfortunes$/);

		await page.goto('/');
		await page.locator('footer a[href="/clocks"]').click();
		await expect(page).toHaveURL(/\/clocks$/);

		await page.goto('/');
		await page.locator('footer a[href="/qr-generator"]').click();
		await expect(page).toHaveURL(/\/qr-generator$/);
	});

	test('footer Work anchor opens homepage projects', async ({ page }) => {
		await page.goto('/');
		await page.locator('footer a[href="/#projects"]').click();
		await expect(page).toHaveURL(/\/(#projects)?$/);
		await expect(page.locator('#projects')).toBeVisible();
	});
});
