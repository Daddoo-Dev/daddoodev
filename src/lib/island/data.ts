/** Content for the floating field-station diorama at /island (hidden, noindex). */

import { featuredProjects, labProjects, toolProjects } from '$lib/data/homeProjects';

/** `kind` renders an official store badge instead of a text chip; `project` captions a group of badges. */
export type IslandLink = { label: string; url: string; kind?: 'appstore' | 'play'; project?: string; icon?: string };

export type IslandEntry = {
	title: string;
	blurb: string;
	/** Hidden "find": shown as a field-journal entry instead of link buttons. */
	find?: boolean;
	links: IslandLink[];
	/** Attribution shown as small print at the bottom of the card. */
	credits?: IslandLink[];
	creditsText?: string;
};

const GITHUB = 'https://github.com/Daddoo-Dev';
const APP_STORE = 'https://apps.apple.com/us/developer/shawn-mcpeek/id1783843453';
const PLAY = 'https://play.google.com/store/apps/developer?id=Daddoo+Dev';

function featured(title: string): IslandLink[] {
	const project = featuredProjects.find((item) => item.title === title);
	if (!project) return [];
	const links: IslandLink[] = [];
	if (project.liveUrl) {
		const site = project.liveUrl.startsWith('https://daddoodev.pro')
			? project.liveUrl.slice('https://daddoodev.pro'.length) || '/'
			: project.liveUrl;
		links.push({ label: `${project.title} site`, url: site, project: project.title, icon: project.image });
	}
	if (project.store?.appStore)
		links.push({ label: `${project.title} on the App Store`, url: project.store.appStore, kind: 'appstore', project: project.title, icon: project.image });
	if (project.store?.googlePlay)
		links.push({ label: `${project.title} on Google Play`, url: project.store.googlePlay, kind: 'play', project: project.title, icon: project.image });
	return links;
}

function lab(title: string): IslandLink | null {
	const item = labProjects.find((entry) => entry.title === title && entry.href);
	return item?.href ? { label: item.title, url: item.href } : null;
}

/** Interactive buildings and gates. Keys match the ids used in createIsland.ts. */
export const BUILDINGS: Record<string, IslandEntry> = {
	workshop: {
		title: 'The Workshop',
		blurb: 'Source code, experiments and open-source bits.',
		links: [
			{ label: 'GitHub', url: GITHUB },
			lab('Inspiration by Simpsons'),
			lab('TopMath')
		].filter((link): link is IslandLink => link !== null)
	},
	chapel: {
		title: 'The Chapel',
		blurb: 'Prayer and formation apps.',
		links: [...featured('Daily Company'), ...featured('My Prayer Cards')]
	},
	showroom: {
		title: 'The Showroom',
		blurb: 'Client-facing work: apps and sites I built for real organizations and businesses.',
		links: [
			...featured('Ridewealth Assistant'),
			...featured('Conclavium'),
			{ label: 'Knights of Columbus Council 15857', url: 'https://kofc15857.com' }
		]
	},
	toolshed: {
		title: 'The Toolshed',
		blurb: 'Practical tools I built because I needed them.',
		links: [
			...toolProjects.map((tool) => ({ label: tool.title, url: tool.href })),
			lab('ChronoCluster'),
			lab('QR Generator')
		].filter((link): link is IslandLink => link !== null)
	},
	arcade: {
		title: 'The Arcade',
		blurb: 'Puzzle, strategy and arcade games.',
		links: [
			...featured('Twisted Fortunes'),
			...featured('Bottled Star'),
			lab('Stock Market Game'),
			{ label: 'GitHub repos', url: `${GITHUB}?tab=repositories` }
		].filter((link): link is IslandLink => link !== null)
	},
	mission: {
		title: 'Mission Control',
		blurb: 'Status: 6 apps in production and 4 extensions published, with more in the lab. Questions, bug reports and ideas are always welcome.',
		links: [
			{ label: 'Email daddoodev@proton.me', url: 'mailto:daddoodev@proton.me' },
			{ label: 'GitHub', url: GITHUB }
		],
		credits: [
			{ label: 'Models via Poly Pizza', url: 'https://poly.pizza' },
			{ label: 'CC-BY 3.0', url: 'https://creativecommons.org/licenses/by/3.0/' }
		],
		creditsText:
			'Church, Giraffe, Killer Whale and Railway Carriage by Poly by Google; Arcade Machine by J-Toastie; House by burunduk (all CC-BY). Yeti and rock by Quaternius, skull candle and grave by Kay Lousberg (CC0). Okapi and Swiss Guard made with Copilot and Meshy.'
	},
	appstore: {
		title: 'App Store',
		blurb: 'Everything I have published for iPhone and iPad.',
		links: [{ label: 'Open the App Store', url: APP_STORE, kind: 'appstore' }]
	},
	play: {
		title: 'Google Play',
		blurb: 'Everything I have published for Android.',
		links: [{ label: 'Open Google Play', url: PLAY, kind: 'play' }]
	},
	repos: {
		title: 'All Repositories',
		blurb: 'Everything I have published on GitHub.',
		links: [{ label: 'View all repos', url: `${GITHUB}?tab=repositories` }]
	}
};

/** Hidden finds: tiny field-journal entries scattered around the island. */
const FIND_DATA: Record<string, { title: string; blurb: string }> = {
	yeti: { title: 'Yeti', blurb: 'Shy and rarely photographed. Last seen at the edge of the pines.' },
	dragon: { title: 'Dragon', blurb: 'Asleep on a warm rock. Please do not wake it.' },
	okapi: {
		title: 'Okapi',
		blurb:
			'Looks like a zebra and a giraffe had a conversation. Considered a cryptid until science described it in 1901.'
	},
	giraffe: { title: 'Giraffe', blurb: 'Wandered over to check out the tree line.' },
	swiss: {
		title: 'Swiss Guard',
		blurb: 'On duty since 1506. This one guards a very small chapel.'
	},
	cross: { title: 'Celtic Cross', blurb: 'A little piece of Ireland and Scotland, carved in stone.' },
	whale: {
		title: 'Sky Whale',
		blurb: "The marine biologist I wanted to be when I was young. I still don't know what I want to be when I grow up."
	},
	diver: {
		title: 'Dive Bell',
		blurb: 'San Diego kid, scuba diver. Some of the best things are found by looking down.'
	},
	geode: {
		title: 'Hidden Geode',
		blurb: 'A cave tucked under the rock, glowing quietly. Not everything worth finding is on top.'
	},
	kraken: {
		title: 'Pond Kraken',
		blurb: 'Small, shy, and very into gardening. It surfaces now and then to borrow a tulip. Please do not tell the sailboat.'
	},
	monorail: {
		title: 'Monorail',
		blurb: 'It loops over the rooftops, drops past the rim and hangs right around the underside. It has never been late, because it has never stopped.'
	},
	skull: {
		title: 'Memento Mori',
		blurb: 'Remember that you will die. A reminder to spend the time well.'
	},
	sword: { title: 'Sword in the Stone', blurb: 'It is not stuck. It just has opinions.' },
	katana: { title: 'Katana', blurb: 'The sharpest tool in the workshop.' },
	rocket: {
		title: 'The Bradbury',
		blurb: 'A golden age rocket. Pure 1950s optimism. Destination: Mars, naturally.'
	},
	planet: {
		title: 'Ringed World',
		blurb: 'A distant ringed planet. Population unknown. Excellent views.'
	}
};

export const FIND_IDS = Object.keys(FIND_DATA);

export const ENTRIES: Record<string, IslandEntry> = {
	...BUILDINGS,
	back: {
		title: 'Back to normal',
		blurb: 'Return to the regular site.',
		links: [{ label: 'Back to normal site', url: '/' }]
	},
	...Object.fromEntries(
		Object.entries(FIND_DATA).map(([id, v]) => [id, { ...v, find: true, links: [] }])
	)
};

export const FOUND_STORAGE_KEY = 'dd-island-found';
