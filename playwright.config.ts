import { defineConfig } from '@playwright/test';

export default defineConfig({
	testDir: 'e2e',
	fullyParallel: true,
	workers: process.env.CI ? 2 : undefined,
	timeout: 30_000,
	expect: { timeout: 10_000 },
	retries: process.env.CI ? 1 : 0,
	reporter: [['list']],
	webServer: {
		command: 'npm run build && npm run preview',
		port: 4173,
		reuseExistingServer: !process.env.CI
	}
});
