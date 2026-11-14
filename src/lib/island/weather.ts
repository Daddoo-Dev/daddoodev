import type { TimeMode } from './createIsland';

export type WeatherKind = 'clear' | 'cloudy' | 'fog' | 'rain' | 'snow' | 'storm';

/** Everything the scene needs to dress the sky. All intensities are 0..1. */
export interface WeatherState {
	kind: WeatherKind;
	cloud: number;
	rain: number;
	snow: number;
	fog: number;
	storm: number;
	wind: number;
	mode: TimeMode;
	label: string;
}

export const SKY_FLAG = 'dd-island-sky';

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/** WMO weather code -> human label and effect intensities. */
function decode(code: number): Pick<WeatherState, 'kind' | 'rain' | 'snow' | 'fog' | 'storm' | 'label'> & { minCloud: number } {
	const none = { rain: 0, snow: 0, fog: 0, storm: 0 };
	if (code === 0) return { kind: 'clear', ...none, label: 'Clear skies', minCloud: 0 };
	if (code === 1) return { kind: 'clear', ...none, label: 'Mostly clear', minCloud: 0.1 };
	if (code === 2) return { kind: 'cloudy', ...none, label: 'Partly cloudy', minCloud: 0.4 };
	if (code === 3) return { kind: 'cloudy', ...none, label: 'Overcast', minCloud: 0.85 };
	if (code === 45 || code === 48) return { kind: 'fog', ...none, fog: 0.9, label: 'Foggy', minCloud: 0.6 };
	if (code >= 51 && code <= 57) return { kind: 'rain', ...none, rain: 0.3, label: 'Drizzle', minCloud: 0.7 };
	if (code === 61 || code === 80) return { kind: 'rain', ...none, rain: 0.5, label: 'Light rain', minCloud: 0.75 };
	if (code === 63 || code === 81 || code === 66) return { kind: 'rain', ...none, rain: 0.75, label: 'Rain', minCloud: 0.85 };
	if (code === 65 || code === 82 || code === 67) return { kind: 'rain', ...none, rain: 1, label: 'Heavy rain', minCloud: 0.9 };
	if (code === 71 || code === 85) return { kind: 'snow', ...none, snow: 0.4, label: 'Light snow', minCloud: 0.75 };
	if (code === 73 || code === 77) return { kind: 'snow', ...none, snow: 0.65, label: 'Snow', minCloud: 0.8 };
	if (code === 75 || code === 86) return { kind: 'snow', ...none, snow: 1, label: 'Heavy snow', minCloud: 0.9 };
	if (code === 95) return { kind: 'storm', ...none, rain: 0.8, storm: 1, label: 'Thunderstorm', minCloud: 0.95 };
	if (code === 96 || code === 99) return { kind: 'storm', ...none, rain: 1, storm: 1, label: 'Severe thunderstorm', minCloud: 1 };
	return { kind: 'clear', ...none, label: 'Clear skies', minCloud: 0 };
}

/** Day, golden hour or night, from real sunrise/sunset at the visitor's place. */
export function timeModeFor(now: number, sunrise: number, sunset: number, isDay: boolean): TimeMode {
	if (!Number.isFinite(sunrise) || !Number.isFinite(sunset)) return isDay ? 'day' : 'night';
	const m = 60_000;
	if (now < sunrise - 30 * m || now > sunset + 30 * m) return 'night';
	if (now < sunrise + 60 * m || now > sunset - 60 * m) return 'dusk';
	return 'day';
}

interface OpenMeteoResponse {
	current: {
		time: string;
		weather_code: number;
		cloud_cover: number;
		wind_speed_10m: number;
		temperature_2m: number;
		is_day: number;
	};
	daily: { sunrise: string[]; sunset: string[] };
}

/**
 * Fetches current conditions straight from the browser. Only coordinates rounded to
 * about 10 km are sent; nothing goes through our own servers and nothing is stored.
 */
export async function fetchWeather(lat: number, lon: number, signal?: AbortSignal): Promise<WeatherState> {
	const r = (n: number) => (Math.round(n * 10) / 10).toFixed(1);
	const url =
		`https://api.open-meteo.com/v1/forecast?latitude=${r(lat)}&longitude=${r(lon)}` +
		'&current=weather_code,cloud_cover,wind_speed_10m,temperature_2m,is_day' +
		'&daily=sunrise,sunset&forecast_days=1&timezone=auto';
	const res = await fetch(url, { signal });
	if (!res.ok) throw new Error(`weather ${res.status}`);
	const data = (await res.json()) as OpenMeteoResponse;
	const c = data.current;
	const d = decode(c.weather_code);
	const now = new Date(c.time).getTime();
	const mode = timeModeFor(now, new Date(data.daily.sunrise[0]).getTime(), new Date(data.daily.sunset[0]).getTime(), c.is_day === 1);
	const temp = Math.round(c.temperature_2m);
	return {
		kind: d.kind,
		cloud: clamp01(Math.max(c.cloud_cover / 100, d.minCloud)),
		rain: d.rain,
		snow: d.snow,
		fog: d.fog,
		storm: d.storm,
		wind: clamp01(c.wind_speed_10m / 45),
		mode,
		label: `${d.label}, ${temp}°C / ${Math.round((temp * 9) / 5 + 32)}°F`
	};
}
