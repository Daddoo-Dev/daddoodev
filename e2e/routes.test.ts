import { expect, test } from '@playwright/test';
import {
	HIDDEN_ROUTES,
	PUBLIC_ROUTES,
	TERMINAL_SELECTOR,
	expectSiteShell,
	visitRoute
} from './helpers';

test.describe('Public routes', () => {
	for (const route of PUBLIC_ROUTES) {
		test(`${route.path} loads with expected title and shell`, async ({ page }) => {
			await visitRoute(page, route);
			if (typeof route.heading === 'string') {
				await expect(page.locator('h1')).toContainText(route.heading);
			} else {
				await expect(page.locator('h1').first()).toHaveText(route.heading);
			}
		});
	}

	test('/clocks renders all clock types', async ({ page }) => {
		await page.goto('/clocks');
		await expect(page.getByText('Standard', { exact: true })).toBeVisible();
		await expect(page.getByText('Decimal', { exact: true })).toBeVisible();
		await expect(page.getByText('ISS', { exact: true })).toBeVisible();
		await expect(page.getByText('Hobbit', { exact: true })).toBeVisible();
	});

	test('legal pages have back to home control', async ({ page }) => {
		for (const path of ['/privacy', '/terms']) {
			await page.goto(path);
			await expect(page.getByRole('button', { name: 'Back to Home' })).toBeVisible();
		}
	});

	test('twisted fortunes page has store badges and privacy link', async ({ page }) => {
		await page.goto('/twistedfortunes');
		await expect(page.locator('.app-content')).toBeVisible();
		await expect(page.locator('a[href="/twistedfortunes/privacy"]')).toBeVisible();
	});

	test('my prayer cards page has review samples and privacy link', async ({ page }) => {
		await page.goto('/myprayercards');
		await expect(page.locator('.app-content')).toBeVisible();
		await expect(page.locator('#review')).toBeVisible();
		await expect(page.locator('a[href="/privacy"]')).toBeVisible();
		await expect(page.locator('a[href="/images/myprayercards/review-front.jpg"]')).toBeVisible();
		await expect(page.locator('a[href="/images/myprayercards/review-back.png"]')).toBeVisible();
	});
});

test.describe('Hidden routes', () => {
	for (const route of HIDDEN_ROUTES) {
		test(`${route.path} loads`, async ({ page }) => {
			await page.goto(route.path);

			if (route.path === '/bbs') {
				await expect(page.locator(TERMINAL_SELECTOR)).toBeVisible({ timeout: 10000 });
				return;
			}

			if (route.path.includes('godspeed-ginny')) {
				await expect(page).toHaveTitle(route.title);
				await expect(page.locator('h1')).toContainText(route.heading);
				await expect(page.locator('header.header')).toHaveCount(0);
				return;
			}

			if (route.path === '/honorguard/preview') {
				await expect(page.locator('.sheet-root')).toBeVisible();
				await expectSiteShell(page);
				return;
			}

			await expect(page).toHaveTitle(route.title);
			await expectSiteShell(page);

			if (route.useH2) {
				await expect(page.locator('h2').first()).toHaveText(route.heading);
			} else if (route.heading instanceof RegExp) {
				await expect(page.locator('h1').first()).toHaveText(route.heading);
			}
		});
	}

	test('/marketminder redirects unauthenticated users to login', async ({ page }) => {
		await page.goto('/marketminder');
		await expect(page).toHaveURL(/\/marketminder\/login$/);
		await expect(page.locator('#mm-email')).toBeVisible();
		await expect(page.locator('#mm-password')).toBeVisible();
		await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
	});

	test('/analytics/knights-management redirects to conclavium', async ({ page }) => {
		await page.goto('/analytics/knights-management');
		await expect(page).toHaveURL(/\/analytics\/conclavium$/);
		await expect(page.locator('h1.km-analytics-title')).toHaveText('Conclavium — usage');
	});

	test('/honorguard sign-in form renders', async ({ page }) => {
		await page.goto('/honorguard');
		await expect(page.locator('#honorguard-contact')).toBeVisible();
		await expect(page.locator('#honorguard-position')).toBeVisible();
		await expect(page.getByRole('link', { name: 'View full-page sheet' })).toBeVisible();
	});
});
