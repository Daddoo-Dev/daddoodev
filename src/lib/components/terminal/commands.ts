import {
	toDecimalTime,
	getCurrentHobbitMeal,
	type HobbitMeal
} from '$lib/clocks/timeUtils';
import { fetchGuestbookEntries, formatGuestbookDate, signGuestbook } from './bbsFirestore';

export type LineTone = 'default' | 'bright' | 'dim' | 'error';

export type TerminalLine = {
	text: string;
	tone?: LineTone;
};

export type CommandAction =
	| { type: 'clear' }
	| { type: 'close' }
	| { type: 'navigate'; href: string }
	| { type: 'open_external'; url: string };

export type CommandResult = {
	lines: TerminalLine[];
	action?: CommandAction;
};

export type CommandContext = {
	now?: Date;
};

const SAINT_INVOCATIONS = [
	'// St Carlo, pray for us',
	'// St Joseph, patron of workers, pray for us',
	'// St Gregory the Great, pray for us',
	'// St Michael the Archangel, defend us in battle',
	'// St Isidore of Seville, patron of programmers, pray for us',
	'// St Expeditus, patron of urgent causes, pray for us'
];

const LS_LINES: TerminalLine[] = [
	{ text: 'ridewealth/       Financial tracking for rideshare drivers', tone: 'default' },
	{ text: 'conclavium/       Finance for KofC councils and assemblies', tone: 'default' },
	{ text: 'twistedfortunes/  Darkly humorous fortune-cookie game', tone: 'default' },
	{ text: 'extensions/       VS Code tools (Zivora, NotchList, …)', tone: 'default' },
	{ text: 'lab/              Experiments and small tools', tone: 'default' }
];

const OPEN_TARGETS: Record<
	string,
	{ type: 'external'; url: string } | { type: 'internal'; href: string } | { type: 'scroll_tools' }
> = {
	ridewealth: { type: 'external', url: 'https://ridewealthassistant.com/marketing/' },
	conclavium: { type: 'external', url: 'https://conclavium.app' },
	twistedfortunes: { type: 'internal', href: '/twistedfortunes' },
	extensions: { type: 'scroll_tools' },
	lab: { type: 'internal', href: '/clocks' }
};

function line(text: string, tone: LineTone = 'default'): TerminalLine {
	return { text, tone };
}

function helpLines(): TerminalLine[] {
	return [
		line('Available commands:', 'bright'),
		line('  HELP              List commands'),
		line('  LS [projects]     Directory of apps and tools'),
		line('  OPEN <name>       Visit ridewealth, conclavium, twistedfortunes, extensions, lab'),
		line('  ABOUT             About the SysOp'),
		line('  CONTACT           Email and GitHub'),
		line('  CLOCKS            Standard, decimal, and Hobbit time'),
		line('  GUESTBOOK         Recent guestbook entries'),
		line('  SIGN <h> <msg>    Leave a guestbook entry'),
		line('  WHOAMI            Who you are here'),
		line('  CLEAR             Clear the screen'),
		line('  EXIT              Return to the site')
	];
}

function aboutLines(): TerminalLine[] {
	return [
		line('Shawn McPeek — solo developer, Colorado.', 'bright'),
		line('Flutter + SvelteKit + TypeScript. Supabase and Firebase backends.'),
		line('3 apps in production, 4 extensions published.'),
		line('Ships end to end from sketch to store listing.')
	];
}

function contactLines(): TerminalLine[] {
	return [
		line('Email: daddoodev@proton.me', 'bright'),
		line('GitHub: https://github.com/Daddoo-Dev', 'bright'),
		line('Or use the contact form on the main site.', 'dim')
	];
}

function clocksLines(now: Date): TerminalLine[] {
	const standard = now.toLocaleTimeString(undefined, {
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
		hour12: false
	});
	const decimal = toDecimalTime(now);
	const decimalStr = `${String(decimal.hours).padStart(2, '0')}:${String(decimal.minutes).padStart(2, '0')}:${String(decimal.seconds).padStart(2, '0')}`;
	const { current, next } = getCurrentHobbitMeal(now);

	return [
		line(`Standard: ${standard}`, 'bright'),
		line(`Decimal:  ${decimalStr}`, 'bright'),
		line(`Hobbit:   ${current.name} (next: ${next.name})`, 'bright')
	];
}

function openResult(target: string): CommandResult {
	const key = target.toLowerCase();
	const entry = OPEN_TARGETS[key];

	if (!entry) {
		return {
			lines: [
				line(`Unknown project: ${target}`, 'error'),
				line('Try: ridewealth, conclavium, twistedfortunes, extensions, lab', 'dim')
			]
		};
	}

	if (entry.type === 'external') {
		return {
			lines: [line(`Opening ${key}…`, 'dim')],
			action: { type: 'open_external', url: entry.url }
		};
	}

	if (entry.type === 'scroll_tools') {
		return {
			lines: [line('Returning to site — scrolling to developer tools…', 'dim')],
			action: { type: 'navigate', href: '/#tools' }
		};
	}

	return {
		lines: [line(`Opening ${key}…`, 'dim')],
		action: { type: 'navigate', href: entry.href }
	};
}

async function guestbookLines(): Promise<TerminalLine[]> {
	const entries = await fetchGuestbookEntries();

	if (entries.length === 0) {
		return [line('No entries yet. Be the first: SIGN <handle> <message>', 'dim')];
	}

	return entries.map((entry) =>
		line(`[${formatGuestbookDate(entry.createdAt)}] ${entry.handle}: ${entry.message}`)
	);
}

async function signLines(args: string[]): Promise<CommandResult> {
	if (args.length < 2) {
		return {
			lines: [line('Usage: SIGN <handle> <message>', 'error')]
		};
	}

	const handle = args[0];
	const message = args.slice(1).join(' ');
	const result = await signGuestbook(handle, message);

	if (result.ok) {
		return { lines: [line('Entry saved. Thanks for calling!', 'bright')] };
	}

	return { lines: [line(result.error, result.error.includes('slow down') ? 'dim' : 'error')] };
}

export async function executeCommand(input: string, ctx: CommandContext = {}): Promise<CommandResult> {
	const trimmed = input.trim();
	if (!trimmed) return { lines: [] };

	const [commandRaw, ...rest] = trimmed.split(/\s+/);
	const command = commandRaw.toLowerCase();
	const now = ctx.now ?? new Date();

	if (command === 'help') {
		return { lines: helpLines() };
	}

	if (command === 'ls' || (command === 'ls' && rest[0]?.toLowerCase() === 'projects')) {
		return { lines: [...LS_LINES] };
	}

	if (command === 'dir') {
		return {
			lines: [line('This is a respectable UNIX-flavored board. But fine:', 'dim'), ...LS_LINES]
		};
	}

	if (command === 'open') {
		if (!rest[0]) {
			return { lines: [line('Usage: OPEN <name>', 'error')] };
		}
		return openResult(rest[0]);
	}

	if (command === 'about') {
		return { lines: aboutLines() };
	}

	if (command === 'contact') {
		return { lines: contactLines() };
	}

	if (command === 'clocks') {
		return { lines: clocksLines(now) };
	}

	if (command === 'guestbook') {
		return { lines: await guestbookLines() };
	}

	if (command === 'sign') {
		return signLines(rest);
	}

	if (command === 'whoami') {
		return { lines: [line('guest — but you can leave a name in the guestbook', 'bright')] };
	}

	if (command === 'clear') {
		return { lines: [], action: { type: 'clear' } };
	}

	if (command === 'exit') {
		return { lines: [line('Connection closed. Thanks for calling.', 'dim')], action: { type: 'close' } };
	}

	if (command === 'sudo') {
		return {
			lines: [
				line('guest is not in the sudoers file. This incident will be reported to the SysOp.', 'error')
			]
		};
	}

	if (command === 'pray') {
		const invocation = SAINT_INVOCATIONS[Math.floor(Math.random() * SAINT_INVOCATIONS.length)];
		return { lines: [line(invocation, 'bright')] };
	}

	return {
		lines: [line(`command not found: ${commandRaw} — type HELP`, 'error')]
	};
}
