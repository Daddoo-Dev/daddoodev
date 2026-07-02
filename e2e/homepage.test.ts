import { expect, test } from '@playwright/test';
import {
	expectNoHiddenLinks,
	expectNotNoIndexed,
	expectRobots,
	expectSiteShell,
	visitRoute
} from './helpers';

test.describe('Homepage — Mission Control', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
	});

	test('loads hero, shell, and indexable SEO', async ({ page }) => {
		await expect(page.locator('h1')).toHaveText(/I ship cross-platform apps that are live on both stores/i);
		await expectSiteShell(page);
		await expectRobots(page, /index, follow/i);
		await expectNotNoIndexed(page);
	});

	test('does not link to hidden routes', async ({ page }) => {
		await expectNoHiddenLinks(page);
	});

	test('shows three featured work cards', async ({ page }) => {
		await expect(page.locator('#projects .featured-card')).toHaveCount(3);
		await expect(page.getByRole('heading', { name: 'Ridewealth Assistant' })).toBeVisible();
		await expect(page.getByRole('heading', { name: 'Conclavium' })).toBeVisible();
		await expect(page.getByRole('heading', { name: 'Twisted Fortunes' })).toBeVisible();
	});

	test('shows four developer tool cards', async ({ page }) => {
		await expect(page.locator('#tools .tool-card')).toHaveCount(4);
		await expect(page.locator('#tools .tool-card').filter({ hasText: 'Zivora' })).toBeVisible();
		await expect(page.locator('#tools .tool-card').filter({ hasText: 'NotchList' })).toBeVisible();
		await expect(page.locator('#tools .tool-card').filter({ hasText: 'AddASaint' })).toBeVisible();
		await expect(page.locator('#tools .tool-card').filter({ hasText: 'SecretKeeper' })).toBeVisible();
	});

	test('shows lab strip with ChronoCluster and QR Generator', async ({ page }) => {
		await expect(page.locator('#lab .lab-item')).toHaveCount(9);
		await expect(page.locator('#lab a[href="/clocks"]')).toBeVisible();
		await expect(page.locator('#lab a[href="/qr-generator"]')).toBeVisible();
	});

	test('about section has skill chips', async ({ page }) => {
		await expect(page.locator('#about')).toBeVisible();
		await expect(page.locator('#about .skill-chip')).toHaveCount(6);
	});

	test('contact form is present', async ({ page }) => {
		await expect(page.locator('#contact')).toBeVisible();
		await expect(page.locator('#name')).toBeVisible();
		await expect(page.locator('#email')).toBeVisible();
		await expect(page.locator('#message')).toBeVisible();
		await expect(page.getByRole('button', { name: 'Send message' })).toBeVisible();
	});

	test('footer has TEXT MODE and company links', async ({ page }) => {
		await expect(page.getByRole('button', { name: 'TEXT MODE' })).toBeVisible();
		await expect(page.locator('footer a[href="/privacy"]')).toBeVisible();
		await expect(page.locator('footer a[href="/terms"]')).toBeVisible();
	});
});

test('homepage route spec', async ({ page }) => {
	await visitRoute(page, {
		path: '/',
		title: /Daddoo Dev/i,
		heading: /I ship cross-platform apps/i
	});
});
