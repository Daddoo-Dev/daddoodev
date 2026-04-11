export function compositeCss(composite: string): string {
	const m: Record<string, string> = {
		'STRONG HOLD': 'stronghold',
		HOLD: 'hold',
		EXIT: 'exit',
		'EARLY RECOVERY': 'recovery',
		WEAKENING: 'weakening',
		CAUTION: 'caution',
		'INSUFFICIENT DATA': 'caution'
	};
	return m[composite] ?? 'caution';
}

export function watchlistVerdictCss(v: string): string {
	if (v === 'BUY') return 'buy';
	if (v === 'CONSIDER') return 'consider';
	if (v === 'AVOID') return 'avoid';
	return 'wait';
}

export function entrySlug(signal: string): string {
	return signal.toLowerCase().replace(/\s+/g, '-');
}

export function momCss(status: string): string {
	return status.toLowerCase().replace(/\s+/g, '-');
}
