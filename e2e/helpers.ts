import { expect, type Page } from '@playwright/test';

export const TERMINAL_SELECTOR = '[aria-label="Daddoo Dev BBS terminal"]';

export const HIDDEN_ROUTE_PATTERNS = ['/marketminder', '/honorguard', '/analytics/', '/triptime'];

export type RouteSpec = {
	path: string;
	title: RegExp;
	heading: RegExp | string;
	shell?: boolean;
	useH2?: boolean;
};

export const PUBLIC_ROUTES: RouteSpec[] = [
	{
		path: '/',
		title: /Daddoo Dev/i,
		heading: /I ship cross-platform apps that are live on both stores/i
	},
	{
		path: '/clocks',
		title: /ChronoCluster/i,
		heading: /ChronoCluster/i
	},
	{
		path: '/qr-generator',
		title: /QR Code Generator|Daddoo Dev/i,
		heading: /QR Code Generator/i
	},
	{
		path: '/twistedfortunes',
		title: /Twisted Fortunes/i,
		heading: /Twisted Fortunes/i
	},
	{
		path: '/twistedfortunes/privacy',
		title: /Twisted Fortunes Privacy Policy|Privacy Policy/i,
		heading: /Privacy Policy/i
	},
	{
		path: '/privacy',
		title: /Privacy Policy/i,
		heading: /Privacy Policy/i
	},
	{
		path: '/terms',
		title: /Terms of Service/i,
		heading: /Terms of Service/i
	}
];

export const HIDDEN_ROUTES: RouteSpec[] = [
	{
		path: '/marketminder/login',
		title: /MarketMinder/i,
		heading: 'MarketMinder',
		useH2: true
	},
	{
		path: '/honorguard',
		title: /Honor Guard sign-in/i,
		heading: /Honor Guard Sign In/i
	},
	{
		path: '/honorguard/preview',
		title: /Sign-in sheet/i,
		heading: /.+/ // sheet HTML preview has no h1
	},
	{
		path: '/analytics/conclavium',
		title: /Conclavium/i,
		heading: /Conclavium — usage/i
	},
	{
		path: '/bbs',
		title: /Text mode/i,
		heading: /.+/ // terminal overlay, no page heading
	},
	{
		path: '/triptime',
		title: /TripTime/i,
		heading: /TripTime/i
	}
];

export async function expectSiteShell(page: Page): Promise<void> {
	await expect(page.locator('header.header')).toBeVisible();
	await expect(page.locator('.telemetry-bar')).toBeVisible();
	await expect(page.getByText('3 apps in production')).toBeVisible();
}

export async function expectRobots(page: Page, content: RegExp): Promise<void> {
	await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', content);
}

export async function expectNotNoIndexed(page: Page): Promise<void> {
	const robots = page.locator('meta[name="robots"]');
	if ((await robots.count()) === 0) return;
	await expect(robots).not.toHaveAttribute('content', /noindex/i);
}

export async function expectNoHiddenLinks(page: Page): Promise<void> {
	const hrefs = await page.locator('a[href]').evaluateAll((anchors) =>
		anchors.map((anchor) => anchor.getAttribute('href') ?? '')
	);

	for (const href of hrefs) {
		for (const pattern of HIDDEN_ROUTE_PATTERNS) {
			expect(href.includes(pattern)).toBe(false);
		}
	}
}

export async function openTerminalFromHome(page: Page): Promise<void> {
	await page.goto('/');
	await page.locator('h1').click();
	await page.keyboard.press('Backquote');
	await expect(page.locator(TERMINAL_SELECTOR)).toBeVisible({ timeout: 10000 });
}

export async function skipTerminalBoot(page: Page): Promise<void> {
	await page.keyboard.press('a');
	await expect(page.getByText('Type HELP for commands.')).toBeVisible({ timeout: 5000 });
}

export async function runTerminalCommand(page: Page, command: string): Promise<void> {
	await page.locator(TERMINAL_SELECTOR).click();
	await page.locator('.bbs-hidden-input').focus();
	await page.keyboard.type(command);
	await page.keyboard.press('Enter');
}

export async function visitRoute(page: Page, spec: RouteSpec): Promise<void> {
	await page.goto(spec.path);
	await expect(page).toHaveTitle(spec.title);
	if (spec.shell !== false) {
		await expectSiteShell(page);
	}
}
