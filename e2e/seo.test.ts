import { test } from '@playwright/test';
import { expectNotNoIndexed, expectRobots } from './helpers';

const PUBLIC_INDEXABLE = ['/', '/twistedfortunes', '/twistedfortunes/privacy'];

const PUBLIC_NO_EXPLICIT_ROBOTS = ['/clocks', '/qr-generator', '/privacy', '/terms'];

const HIDDEN_NOINDEX = [
	'/marketminder/login',
	'/honorguard',
	'/honorguard/preview',
	'/analytics/conclavium',
	'/analytics/knights-management',
	'/bbs'
];

test.describe('SEO — public routes', () => {
	for (const path of PUBLIC_INDEXABLE) {
		test(`${path} is indexable`, async ({ page }) => {
			await page.goto(path);
			await expectRobots(page, /index, follow/i);
			await expectNotNoIndexed(page);
		});
	}

	for (const path of PUBLIC_NO_EXPLICIT_ROBOTS) {
		test(`${path} is not noindex`, async ({ page }) => {
			await page.goto(path);
			await expectNotNoIndexed(page);
		});
	}
});

test.describe('SEO — hidden routes', () => {
	for (const path of HIDDEN_NOINDEX) {
		test(`${path} has noindex,nofollow`, async ({ page }) => {
			await page.goto(path);
			await expectRobots(page, /noindex, nofollow/i);
		});
	}
});
