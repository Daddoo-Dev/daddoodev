const ISS_WHERE = 'https://api.wheretheiss.at/v1/satellites/25544';
const ISS_OPEN_NOTIFY = 'https://api.open-notify.org/iss-now.json';

export type IssPosition = {
	lat: number;
	lon: number;
};

export async function fetchIssPosition(): Promise<IssPosition | null> {
	try {
		const response = await fetch(ISS_WHERE);
		const data = (await response.json()) as { latitude?: number; longitude?: number };
		if (typeof data?.latitude === 'number' && typeof data?.longitude === 'number') {
			return { lat: data.latitude, lon: data.longitude };
		}
	} catch {
		// fall through to backup API
	}

	try {
		const response = await fetch(ISS_OPEN_NOTIFY);
		const data = (await response.json()) as {
			iss_position?: { latitude?: string; longitude?: string };
		};
		const pos = data?.iss_position;
		if (pos) {
			const lat = parseFloat(pos.latitude ?? '');
			const lon = parseFloat(pos.longitude ?? '');
			if (!Number.isNaN(lat) && !Number.isNaN(lon)) {
				return { lat, lon };
			}
		}
	} catch {
		// both APIs failed
	}

	return null;
}

export function formatIssCoords(lat: number, lon: number): string {
	const latLabel = `${Math.abs(lat).toFixed(1)}°${lat >= 0 ? 'N' : 'S'}`;
	const lonLabel = `${Math.abs(lon).toFixed(1)}°${lon >= 0 ? 'E' : 'W'}`;
	return `${latLabel} ${lonLabel}`;
}
