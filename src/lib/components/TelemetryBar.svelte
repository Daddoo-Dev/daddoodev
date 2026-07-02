<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { fetchIssPosition, formatIssCoords } from '$lib/clocks/issPosition';
	import { toDecimalTime } from '$lib/clocks/timeUtils';

	const GITHUB_CACHE_KEY = 'telemetry-github-activity';
	const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

	type GitHubActivity = {
		commits: number;
		repos: number;
	};

	let now = new Date();
	let issCoords: string | null = null;
	let mstTime = '';
	let decimalLabel = '';
	let githubActivity: GitHubActivity | null = null;

	let tickInterval: ReturnType<typeof setInterval>;
	let issInterval: ReturnType<typeof setInterval>;

	const mstFormatter = new Intl.DateTimeFormat('en-US', {
		timeZone: 'America/Denver',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
		hour12: false
	});

	function updateClocks() {
		now = new Date();
		mstTime = mstFormatter.format(now);
		const decimal = toDecimalTime(now);
		decimalLabel = `${decimal.hours}.${String(decimal.minutes).padStart(2, '0')}.${String(decimal.seconds).padStart(2, '0')}`;
	}

	async function refreshIss() {
		const position = await fetchIssPosition();
		issCoords = position ? formatIssCoords(position.lat, position.lon) : null;
	}

	async function loadGitHubActivity() {
		if (typeof sessionStorage !== 'undefined') {
			const cached = sessionStorage.getItem(GITHUB_CACHE_KEY);
			if (cached) {
				try {
					const parsed = JSON.parse(cached) as GitHubActivity;
					if (parsed.commits > 0 && parsed.repos > 0) {
						githubActivity = parsed;
						return;
					}
				} catch {
					// ignore invalid cache
				}
			}
		}

		try {
			const since = Date.now() - THIRTY_DAYS_MS;
			const response = await fetch(
				'https://api.github.com/users/shawnmcpeek/events/public?per_page=100'
			);
			if (!response.ok) return;

			const events = (await response.json()) as Array<{
				type?: string;
				created_at?: string;
				repo?: { name?: string };
				payload?: { size?: number; commits?: unknown[] };
			}>;

			const repos = new Set<string>();
			let commits = 0;

			for (const event of events) {
				if (event.type !== 'PushEvent' || !event.created_at) continue;
				if (new Date(event.created_at).getTime() < since) continue;

				const pushSize =
					typeof event.payload?.size === 'number'
						? event.payload.size
						: event.payload?.commits?.length ?? 0;
				commits += pushSize;
				if (event.repo?.name) repos.add(event.repo.name);
			}

			if (commits <= 0 || repos.size <= 0) return;

			githubActivity = { commits, repos: repos.size };
			sessionStorage.setItem(GITHUB_CACHE_KEY, JSON.stringify(githubActivity));
		} catch {
			// hide commits item on failure
		}
	}

	onMount(() => {
		updateClocks();
		refreshIss();
		loadGitHubActivity();

		tickInterval = setInterval(updateClocks, 1000);
		issInterval = setInterval(refreshIss, 8000);
	});

	onDestroy(() => {
		clearInterval(tickInterval);
		clearInterval(issInterval);
	});
</script>

<div class="telemetry-bar" aria-label="Live telemetry">
	<div class="telemetry-bar__inner">
		{#if issCoords}
			<span class="telemetry-item telemetry-item--desktop-only">
				<span class="telemetry-label">ISS</span>
				{issCoords}
			</span>
		{/if}

		<span class="telemetry-item telemetry-item--desktop-only">
			<span class="telemetry-label">DEC</span>
			{decimalLabel}
		</span>

		<span class="telemetry-item">
			<span class="telemetry-label">MST</span>
			{mstTime}
		</span>

		{#if githubActivity}
			<span class="telemetry-item telemetry-item--desktop-only">
				<span class="telemetry-label">COMMITS/30D</span>
				{githubActivity.commits} · {githubActivity.repos} REPOS
			</span>
		{/if}

		<span class="telemetry-item telemetry-item--status">
			<span class="telemetry-dot" aria-hidden="true"></span>
			3 apps in production
		</span>
	</div>
</div>
