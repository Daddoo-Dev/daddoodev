/** Content for the floating field-station diorama at /island (hidden, noindex). */

export type IslandLink = { label: string; url: string };

export type IslandEntry = {
	title: string;
	blurb: string;
	/** Hidden "find": shown as a field-journal entry instead of link buttons. */
	find?: boolean;
	links: IslandLink[];
};

const GITHUB = 'https://github.com/Daddoo-Dev';
// An empty url renders as a "soon" chip until the store listing is wired in.
const STORES: IslandLink[] = [
	{ label: 'App Store', url: '' },
	{ label: 'Google Play', url: '' }
];

/** Interactive buildings and gates. Keys match the ids used in createIsland.ts. */
export const BUILDINGS: Record<string, IslandEntry> = {
	workshop: {
		title: 'The Workshop',
		blurb: 'Source code, experiments and open-source bits.',
		links: [{ label: 'GitHub', url: GITHUB }]
	},
	chapel: { title: 'The Chapel', blurb: 'Prayer and formation apps.', links: STORES },
	toolshed: {
		title: 'The Toolshed',
		blurb: 'Practical tools I built because I needed them.',
		links: STORES
	},
	arcade: {
		title: 'The Arcade',
		blurb: 'Puzzle, strategy and arcade games.',
		links: [...STORES, { label: 'GitHub repos', url: `${GITHUB}?tab=repositories` }]
	},
	appstore: {
		title: 'App Store',
		blurb: 'Everything I have published for iPhone and iPad.',
		links: [{ label: 'Open the App Store', url: '' }]
	},
	play: {
		title: 'Google Play',
		blurb: 'Everything I have published for Android.',
		links: [{ label: 'Open Google Play', url: '' }]
	},
	ginny: {
		title: 'Godspeed Ginny',
		blurb: 'Open source on GitHub.',
		links: [{ label: 'View the repo', url: 'https://github.com/shawnmcpeek/godspeed_ginny' }]
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
		blurb: 'The marine biologist I almost became. It swims the open air beneath the island.'
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
	skull: {
		title: 'Memento Mori',
		blurb: 'Remember that you will die. A reminder to spend the time well.'
	},
	sword: { title: 'Sword in the Stone', blurb: 'It is not stuck. It just has opinions.' },
	katana: { title: 'Katana', blurb: 'The sharpest tool in the workshop.' },
	rocket: { title: 'Golden Age Rocket', blurb: 'Pure 1950s optimism. Destination: Mars, naturally.' },
	planet: {
		title: 'Ringed World',
		blurb: 'A distant ringed planet. Population unknown. Excellent views.'
	}
};

export const FIND_IDS = Object.keys(FIND_DATA);

export const ENTRIES: Record<string, IslandEntry> = {
	...BUILDINGS,
	...Object.fromEntries(
		Object.entries(FIND_DATA).map(([id, v]) => [id, { ...v, find: true, links: [] }])
	)
};

export const FOUND_STORAGE_KEY = 'dd-island-found';
