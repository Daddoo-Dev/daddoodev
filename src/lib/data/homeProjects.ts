export type FeaturedProject = {
	title: string;
	description: string;
	image: string;
	technologies: string[];
	liveUrl?: string;
	store?: { googlePlay?: string; appStore?: string };
};

export type ToolProject = {
	title: string;
	description: string;
	image: string;
	href: string;
	linkLabel: string;
};

export type LabProject = {
	title: string;
	href?: string;
};

export const featuredProjects: FeaturedProject[] = [
	{
		title: 'Ridewealth Assistant',
		description:
			'Financial tracking for rideshare drivers — earnings, expenses, and mileage in one Flutter app.',
		image: '/images/rwa.png',
		technologies: ['Flutter', 'Firebase', 'iOS', 'Android'],
		liveUrl: 'https://ridewealthassistant.com/marketing/',
		store: {
			googlePlay: 'https://play.google.com/store/apps/details?id=com.ridewealthassistant.app&hl=en_US',
			appStore: 'https://apps.apple.com/us/app/ridewealth-assistant/id6670771727'
		}
	},
	{
		title: 'Conclavium',
		description:
			'Finance and administration for KofC councils and assemblies — programs, reimbursements, and audit-ready reports.',
		image: '/images/conclavium.png',
		technologies: ['Flutter', 'Supabase', 'iOS', 'Android'],
		liveUrl: 'https://conclavium.app',
		store: {
			googlePlay: 'https://play.google.com/store/apps/details?id=com.conclavium.app&hl=en_US',
			appStore: 'https://apps.apple.com/us/app/conclavium/id6763437133'
		}
	},
	{
		title: 'Twisted Fortunes',
		description: 'Darkly humorous fortune-cookie game with optional ads for extra fortunes.',
		image: '/images/twistedfortune.png',
		technologies: ['Flame', 'Android', 'iOS'],
		store: {
			googlePlay: 'https://play.google.com/store/apps/details?id=com.daddoodev.twistedfortunes',
			appStore: 'https://apps.apple.com/us/app/twisted-fortunes/id6756530267'
		}
	}
];

export const toolProjects: ToolProject[] = [
	{
		title: 'Zivora',
		description: 'Sentry integration with AI-powered debugging inside VS Code.',
		image: '/images/zivora.png',
		href: 'https://marketplace.visualstudio.com/items?itemName=DaddooDev.zivora',
		linkLabel: 'VS Code Marketplace'
	},
	{
		title: 'NotchList',
		description: 'Local-first Explorer task list with MCP and Add to Chat.',
		image: '/images/notchlist.png',
		href: 'https://marketplace.visualstudio.com/items?itemName=DaddooDev.notchlist',
		linkLabel: 'VS Code Marketplace'
	},
	{
		title: 'AddASaint',
		description: 'Saint invocations in project files with correct comment syntax.',
		image: '/images/adddasaint.png',
		href: 'https://marketplace.visualstudio.com/items?itemName=DaddooDev.addasaint',
		linkLabel: 'VS Code Marketplace'
	},
	{
		title: 'SecretKeeper',
		description: 'Secure local storage for API keys and credentials.',
		image: '/images/secretkeeper.png',
		href: 'https://open-vsx.org/extension/DaddooDev/secretkeeper',
		linkLabel: 'Open VSX'
	}
];

export const labProjects: LabProject[] = [
	{ title: 'ChronoCluster', href: '/clocks' },
	{ title: 'QR Generator', href: '/qr-generator' },
	{ title: 'Stock Market Game', href: 'https://marketgame-3e924.firebaseapp.com/' },
	{ title: 'Inspiration by Simpsons', href: 'https://shawnmcpeek.github.io/simpsonsquotes/' },
	{ title: 'TopMath', href: 'https://topmath.netlify.app/' },
	{ title: 'New Horizons Landscaping', href: 'https://newhorizonsnativelandscaping.netlify.app/' },
	{ title: '303-Vinyl' },
	{ title: 'Otto & Furiends' }
];
