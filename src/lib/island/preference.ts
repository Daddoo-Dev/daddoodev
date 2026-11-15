const KEY = 'dd-view';

export type ViewPref = 'island' | 'normal';

export function getViewPref(): ViewPref | null {
	try {
		const value = localStorage.getItem(KEY);
		return value === 'island' || value === 'normal' ? value : null;
	} catch {
		return null;
	}
}

export function setViewPref(v: ViewPref): void {
	try {
		localStorage.setItem(KEY, v);
	} catch {
		/* storage unavailable */
	}
}

export function clearViewPref(): void {
	try {
		localStorage.removeItem(KEY);
	} catch {
		/* storage unavailable */
	}
}
