import { test, expect } from '@playwright/test';

test.describe('Island (hidden)', () => {
	test('renders heading, journal counter and project links', async ({ page }) => {
		await page.goto('/island');
		await expect(page.locator('h1')).toHaveText('Daddoo Dev Field Station');
		await expect(page.getByText(/Field journal 0\/\d+|WebGL is not available/)).toBeVisible();
		await expect(page.getByRole('navigation', { name: 'Projects' })).toBeVisible();
	});
});

test.describe('Island: Match my sky (opt-in)', () => {
	test.use({ permissions: ['geolocation'], geolocation: { latitude: 39.7392, longitude: -104.9903 } });

	const weatherBody = JSON.stringify({
		current: { time: '2026-11-14T12:00', weather_code: 61, cloud_cover: 90, wind_speed_10m: 12, temperature_2m: 6, is_day: 1 },
		daily: { sunrise: ['2026-11-14T06:50'], sunset: ['2026-11-14T16:40'] }
	});

	test('makes no weather request until the visitor opts in', async ({ page }) => {
		const calls: string[] = [];
		await page.route('**/api.open-meteo.com/**', (r) => {
			calls.push(r.request().url());
			void r.fulfill({ contentType: 'application/json', body: weatherBody });
		});
		await page.goto('/island');
		await expect(page.getByRole('button', { name: 'Match my sky' })).toBeVisible();
		await page.waitForTimeout(500);
		expect(calls).toHaveLength(0);
	});

	test('shows the privacy note, then fetches weather with rounded coordinates', async ({ page }) => {
		let url = '';
		await page.route('**/api.open-meteo.com/**', (r) => {
			url = r.request().url();
			void r.fulfill({ contentType: 'application/json', body: weatherBody });
		});
		await page.goto('/island');
		await page.getByRole('button', { name: 'Match my sky' }).click();
		await expect(page.getByText(/never stored on our servers/i)).toBeVisible();
		await page.getByRole('button', { name: 'Allow' }).click();
		await expect(page.getByText(/Your sky: Light rain/)).toBeVisible();
		expect(url).toContain('latitude=39.7&longitude=-105.0');
		await page.getByRole('button', { name: 'Reset sky' }).click();
		await expect(page.getByRole('button', { name: 'Match my sky' })).toBeVisible();
	});
});

