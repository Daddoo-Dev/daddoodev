import { test, expect } from '@playwright/test';

test.describe('Island (hidden)', () => {
	test('renders heading, journal counter and project links', async ({ page }) => {
		await page.goto('/island');
		await expect(page.locator('h1')).toHaveText('Daddoo Dev Field Station');
		await expect(page.getByText(/Field journal 0\/\d+|WebGL is not available/)).toBeVisible();
		await expect(page.getByRole('navigation', { name: 'Projects' })).toBeVisible();
	});
});
