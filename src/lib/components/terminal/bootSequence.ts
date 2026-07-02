export type BootTone = 'default' | 'bright' | 'dim' | 'error';

export type BootLine = {
	text: string;
	tone?: BootTone;
	delayMs: number;
};

export const LAST_CALLERS = [
	'ModemKid93',
	'ANSI_Artist',
	'SysOpFan',
	'CallerID_42',
	'RetroCoder',
	'PhosphorGlow',
	'DialUpDreamer'
];

export function pickLastCaller(): string {
	return LAST_CALLERS[Math.floor(Math.random() * LAST_CALLERS.length)];
}

export function getBootLines(lastCaller: string, callerNumber: number | null): BootLine[] {
	const lines: BootLine[] = [
		{ text: 'CONNECTING 2400 BAUD ........ CONNECT', tone: 'dim', delayMs: 0 },
		{ text: '(simulated — mercifully)', tone: 'dim', delayMs: 160 },
		{ text: '', tone: 'default', delayMs: 120 },
		{ text: ' ██████  ██████  ██████', tone: 'bright', delayMs: 200 },
		{ text: ' DADDOO DEV BBS · node 1 of 1 · est. 2024', tone: 'bright', delayMs: 240 },
		{ text: ' SysOp: Shawn McPeek · Colorado', tone: 'dim', delayMs: 200 },
		{ text: '', tone: 'default', delayMs: 120 },
		{ text: 'login: guest', tone: 'default', delayMs: 280 },
		{ text: 'password: ********', tone: 'dim', delayMs: 320 },
		{ text: `Last caller: ${lastCaller}`, tone: 'dim', delayMs: 240 }
	];

	if (callerNumber !== null && callerNumber > 0) {
		lines.push({
			text: `You are caller #${callerNumber}`,
			tone: 'bright',
			delayMs: 240
		});
	}

	lines.push(
		{ text: '', tone: 'default', delayMs: 120 },
		{ text: 'Type HELP for commands.', tone: 'dim', delayMs: 200 }
	);

	return lines;
}
