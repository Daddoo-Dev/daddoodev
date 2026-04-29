<script lang="ts">
	import '$lib/styles/global.css';
	import { browser } from '$app/environment';
	import { invalidateAll } from '$app/navigation';
	import type { KmWeeklySnapshot } from '$lib/km-analytics/types';

	let { data } = $props<{ data: { snapshots: KmWeeklySnapshot[] } }>();

	type ChartInstance = { destroy: () => void };
	type ChartJsCtor = new (ctx: CanvasRenderingContext2D, config: unknown) => ChartInstance;
	type ChartJsModule = {
		defaults: { color?: string; font: { family?: string } };
	};

	let chartJsLoading: Promise<void> | null = null;

	let selectedIndex = $state(0);

	const weeksDesc = $derived(
		[...data.snapshots].sort((a, b) => b.week.localeCompare(a.week))
	);

	const weeksAsc = $derived([...data.snapshots].sort((a, b) => a.week.localeCompare(b.week)));

	const effectiveIndex = $derived(
		weeksDesc.length === 0 ? 0 : Math.min(selectedIndex, weeksDesc.length - 1)
	);

	const current = $derived(weeksDesc[effectiveIndex] ?? null);

	const previous = $derived.by(() => {
		if (!current) return null;
		const i = weeksAsc.findIndex((s) => s.week === current.week);
		return i > 0 ? weeksAsc[i - 1]! : null;
	});

	let uiCanvas = $state<HTMLCanvasElement | undefined>(undefined);
	let platformCanvas = $state<HTMLCanvasElement | undefined>(undefined);
	let featuresCanvas = $state<HTMLCanvasElement | undefined>(undefined);
	let stackedCanvas = $state<HTMLCanvasElement | undefined>(undefined);
	let trendCanvas = $state<HTMLCanvasElement | undefined>(undefined);
	let analyticsRoot = $state<HTMLElement | undefined>(undefined);

	let chartInstances: ChartInstance[] = [];

	function cssVar(el: HTMLElement, name: string, fallback: string): string {
		const v = getComputedStyle(el).getPropertyValue(name).trim();
		return v || fallback;
	}

	function readKmChartTheme(el: HTMLElement) {
		return {
			classic: cssVar(el, '--km-chart-classic', '#3b82f6'),
			overview: cssVar(el, '--km-chart-overview', '#22c55e'),
			neutral: cssVar(el, '--km-chart-neutral', '#94a3b8'),
			android: cssVar(el, '--km-chart-android', '#818cf8'),
			ios: cssVar(el, '--km-chart-ios', '#f472b6'),
			tick: cssVar(el, '--km-chart-tick', 'rgba(224, 224, 224, 0.75)'),
			grid: cssVar(el, '--km-chart-grid', 'rgba(255, 255, 255, 0.08)')
		};
	}

	let pasteText = $state('');
	let submitStatus = $state<'idle' | 'loading' | 'success' | 'error'>('idle');
	let submitMessage = $state('');

	function destroyCharts() {
		for (const c of chartInstances) {
			try {
				c.destroy();
			} catch {
				/* ignore */
			}
		}
		chartInstances = [];
	}

	function loadChartJs(): Promise<void> {
		if (!browser) return Promise.resolve();
		const w = window as unknown as { Chart?: ChartJsCtor };
		if (w.Chart) return Promise.resolve();
		if (!chartJsLoading) {
			chartJsLoading = new Promise((resolve, reject) => {
				const s = document.createElement('script');
				s.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js';
				s.async = true;
				s.onload = () => resolve();
				s.onerror = () => reject(new Error('Failed to load Chart.js'));
				document.head.appendChild(s);
			});
		}
		return chartJsLoading;
	}

	function numDelta(cur: number, prev: number | undefined) {
		if (prev === undefined) return null;
		return cur - prev;
	}

	function formatDelta(cur: number, prev: number | undefined): string | null {
		const d = numDelta(cur, prev);
		if (d === null) return null;
		if (d === 0) return '0';
		const sign = d > 0 ? '+' : '';
		return `${sign}${d}`;
	}

	async function submitWeek() {
		submitStatus = 'loading';
		submitMessage = '';
		try {
			const res = await fetch('/api/km-analytics', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ report: pasteText })
			});
			const body = await res.json().catch(() => ({}));
			if (!res.ok) {
				submitStatus = 'error';
				submitMessage =
					typeof body?.error === 'string' ? body.error : `Request failed (${res.status})`;
				return;
			}
			pasteText = '';
			submitStatus = 'success';
			submitMessage = 'Week saved.';
			selectedIndex = 0;
			await invalidateAll();
		} catch (e) {
			submitStatus = 'error';
			submitMessage = e instanceof Error ? e.message : 'Network error';
		}
	}

	function buildTopFeatures(snap: KmWeeklySnapshot) {
		const rows = Object.entries(snap.byFeature).map(([id, total]) => {
			const fm = snap.featureByMode[id];
			const classic = fm?.classic ?? 0;
			const overview = fm?.overview ?? 0;
			return { id, total, classic, overview };
		});
		rows.sort((a, b) => b.total - a.total);
		return rows.slice(0, 16);
	}

	const bothModeFeatures = $derived.by(() => {
		if (!current) return [] as { id: string; classic: number; overview: number }[];
		const out: { id: string; classic: number; overview: number }[] = [];
		for (const id of Object.keys(current.featureByMode)) {
			const fm = current.featureByMode[id];
			if (fm && fm.classic > 0 && fm.overview > 0) {
				out.push({ id, classic: fm.classic, overview: fm.overview });
			}
		}
		out.sort((a, b) => b.classic + b.overview - (a.classic + a.overview));
		return out;
	});

	$effect(() => {
		if (!browser) return;
		void weeksDesc.length;
		if (selectedIndex >= weeksDesc.length && weeksDesc.length > 0) {
			selectedIndex = weeksDesc.length - 1;
		}
	});

	$effect(() => {
		if (!browser) return;
		const snap = current;
		const asc = weeksAsc;
		const u = uiCanvas;
		const p = platformCanvas;
		const f = featuresCanvas;
		const s = stackedCanvas;
		const t = trendCanvas;
		const root = analyticsRoot;

		if (!snap || !u || !p || !f || !root) return;

		let cancelled = false;

		(async () => {
			try {
				await loadChartJs();
			} catch {
				return;
			}
			if (cancelled) return;

			const ChartMod = (window as unknown as { Chart: ChartJsCtor & ChartJsModule }).Chart;
			if (!ChartMod) return;

			destroyCharts();

			const theme = readKmChartTheme(root);
			const tickColor = theme.tick;
			const gridColor = theme.grid;

			/* Chart.js defaults to dark text; set global + per-chart so legend, titles, and ticks read on dark UI */
			ChartMod.defaults.color = tickColor;
			ChartMod.defaults.font.family =
				getComputedStyle(root).fontFamily || "var(--font-body), 'Inter Tight', sans-serif";

			const commonOpts = {
				color: tickColor,
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: {
						labels: {
							color: tickColor,
							font: { size: 12 }
						}
					}
				}
			};

			const tf = buildTopFeatures(snap);
			const bm = (() => {
				const out: { id: string; classic: number; overview: number }[] = [];
				for (const id of Object.keys(snap.featureByMode)) {
					const fm = snap.featureByMode[id];
					if (fm && fm.classic > 0 && fm.overview > 0) {
						out.push({ id, classic: fm.classic, overview: fm.overview });
					}
				}
				out.sort((a, b) => b.classic + b.overview - (a.classic + a.overview));
				return out;
			})();

			const uiTot = (snap.byUiMode.classic ?? 0) + (snap.byUiMode.overview ?? 0);
			const uiC1 = uiTot > 0 ? snap.byUiMode.classic ?? 0 : 0;
			const uiC2 = uiTot > 0 ? snap.byUiMode.overview ?? 0 : 0;

			chartInstances.push(
				new ChartMod(u.getContext('2d')!, {
					type: 'doughnut',
					data: {
						labels: ['Classic', 'Overview'],
						datasets: [
							{
								data: [uiC1, uiC2],
								backgroundColor: [theme.classic, theme.overview],
								borderWidth: 0
							}
						]
					},
					options: {
						...commonOpts,
						plugins: {
							legend: { position: 'bottom', labels: { color: tickColor } },
							title: {
								display: true,
								text: 'UI mode (feature opens)',
								color: tickColor,
								font: { size: 13 }
							}
						}
					}
				})
			);

			const platTot = (snap.byPlatform.android ?? 0) + (snap.byPlatform.ios ?? 0);
			const a = platTot > 0 ? snap.byPlatform.android ?? 0 : 0;
			const i = platTot > 0 ? snap.byPlatform.ios ?? 0 : 0;

			chartInstances.push(
				new ChartMod(p.getContext('2d')!, {
					type: 'doughnut',
					data: {
						labels: ['Android', 'iOS'],
						datasets: [
							{
								data: [a, i],
								backgroundColor: [theme.android, theme.ios],
								borderWidth: 0
							}
						]
					},
					options: {
						...commonOpts,
						plugins: {
							legend: { position: 'bottom', labels: { color: tickColor } },
							title: {
								display: true,
								text: 'Platform (all events)',
								color: tickColor,
								font: { size: 13 }
							}
						}
					}
				})
			);

			const barColors = tf.map((row) => {
				if (row.classic > row.overview) return theme.classic;
				if (row.overview > row.classic) return theme.overview;
				return theme.neutral;
			});

			chartInstances.push(
				new ChartMod(f.getContext('2d')!, {
					type: 'bar',
					data: {
						labels: tf.map((r) => r.id),
						datasets: [
							{
								label: 'Opens',
								data: tf.map((r) => r.total),
								backgroundColor: barColors,
								borderWidth: 0
							}
						]
					},
					options: {
						...commonOpts,
						indexAxis: 'y',
						scales: {
							x: {
								beginAtZero: true,
								grid: { color: gridColor },
								ticks: { color: tickColor }
							},
							y: {
								grid: { display: false },
								ticks: { color: tickColor }
							}
						},
						plugins: {
							legend: { display: false },
							title: {
								display: true,
								text: 'Top features (by opens)',
								color: tickColor,
								font: { size: 13 }
							}
						}
					}
				})
			);

			if (bm.length > 0 && s) {
				chartInstances.push(
					new ChartMod(s.getContext('2d')!, {
						type: 'bar',
						data: {
							labels: bm.map((r) => r.id),
							datasets: [
								{
									label: 'Classic',
									data: bm.map((r) => r.classic),
									backgroundColor: theme.classic,
									stack: 'm'
								},
								{
									label: 'Overview',
									data: bm.map((r) => r.overview),
									backgroundColor: theme.overview,
									stack: 'm'
								}
							]
						},
						options: {
							...commonOpts,
							indexAxis: 'y',
							scales: {
								x: {
									stacked: true,
									beginAtZero: true,
									grid: { color: gridColor },
									ticks: { color: tickColor }
								},
								y: {
									stacked: true,
									grid: { display: false },
									ticks: { color: tickColor }
								}
							},
							plugins: {
								legend: { position: 'bottom', labels: { color: tickColor } },
								title: {
									display: true,
									text: 'Classic vs overview (features used in both)',
									color: tickColor,
									font: { size: 13 }
								}
							}
						}
					})
				);
			}

			if (asc.length >= 2 && t) {
				chartInstances.push(
					new ChartMod(t.getContext('2d')!, {
						type: 'line',
						data: {
							labels: asc.map((w) => w.week),
							datasets: [
								{
									label: 'Classic',
									data: asc.map((w) => w.byUiMode.classic ?? 0),
									borderColor: theme.classic,
									backgroundColor: 'transparent',
									tension: 0.25,
									fill: false
								},
								{
									label: 'Overview',
									data: asc.map((w) => w.byUiMode.overview ?? 0),
									borderColor: theme.overview,
									backgroundColor: 'transparent',
									tension: 0.25,
									fill: false
								}
							]
						},
						options: {
							...commonOpts,
							scales: {
								x: {
									grid: { color: gridColor },
									ticks: { color: tickColor }
								},
								y: {
									beginAtZero: true,
									grid: { color: gridColor },
									ticks: { color: tickColor }
								}
							},
							plugins: {
								legend: { position: 'bottom', labels: { color: tickColor } },
								title: {
									display: true,
									text: 'UI mode by week (feature opens)',
									color: tickColor,
									font: { size: 13 }
								}
							}
						}
					})
				);
			}

		})();

		return () => {
			cancelled = true;
			destroyCharts();
		};
	});
</script>

<svelte:head>
	<title>Conclavium — analytics</title>
</svelte:head>

<div class="km-analytics container" bind:this={analyticsRoot}>
	<header class="km-analytics-header">
		<h1 class="km-analytics-title">Conclavium — usage</h1>
		<p class="km-analytics-sub">Internal weekly analytics (JSON-backed).</p>
	</header>

	{#if weeksDesc.length === 0}
		<p class="km-analytics-empty">No weeks yet. Paste a report below and submit.</p>
	{:else}
		<div class="km-analytics-toolbar">
			<label class="km-analytics-label" for="km-week-select">Week</label>
			<select id="km-week-select" class="km-analytics-select" bind:value={selectedIndex}>
				{#each weeksDesc as w, i}
					<option value={i}>{w.week} → {w.to}</option>
				{/each}
			</select>
		</div>

		{#if current}
			<section class="km-analytics-metrics" aria-label="Summary metrics">
				<div class="km-analytics-card">
					<div class="km-analytics-card-label">Total events</div>
					<div class="km-analytics-card-value">{current.totalEvents}</div>
					{#if previous}
						<div
							class="km-analytics-delta"
							class:km-analytics-delta--up={numDelta(current.totalEvents, previous.totalEvents)! > 0}
							class:km-analytics-delta--down={numDelta(current.totalEvents, previous.totalEvents)! < 0}
						>
							{#if formatDelta(current.totalEvents, previous.totalEvents)}
								<span class="km-analytics-delta-arrow" aria-hidden="true">
									{numDelta(current.totalEvents, previous.totalEvents)! > 0 ? '▲' : ''}
									{numDelta(current.totalEvents, previous.totalEvents)! < 0 ? '▼' : ''}
								</span>
								{formatDelta(current.totalEvents, previous.totalEvents)} vs prior week
							{/if}
						</div>
					{/if}
				</div>
				<div class="km-analytics-card">
					<div class="km-analytics-card-label">Feature opens</div>
					<div class="km-analytics-card-value">{current.featureOpens}</div>
					{#if previous}
						<div
							class="km-analytics-delta"
							class:km-analytics-delta--up={numDelta(current.featureOpens, previous.featureOpens)! > 0}
							class:km-analytics-delta--down={numDelta(current.featureOpens, previous.featureOpens)! < 0}
						>
							{#if formatDelta(current.featureOpens, previous.featureOpens)}
								<span class="km-analytics-delta-arrow" aria-hidden="true">
									{numDelta(current.featureOpens, previous.featureOpens)! > 0 ? '▲' : ''}
									{numDelta(current.featureOpens, previous.featureOpens)! < 0 ? '▼' : ''}
								</span>
								{formatDelta(current.featureOpens, previous.featureOpens)} vs prior week
							{/if}
						</div>
					{/if}
				</div>
				<div class="km-analytics-card">
					<div class="km-analytics-card-label">UI mode changes</div>
					<div class="km-analytics-card-value">{current.uiModeChanges}</div>
					{#if previous}
						<div
							class="km-analytics-delta"
							class:km-analytics-delta--up={numDelta(current.uiModeChanges, previous.uiModeChanges)! > 0}
							class:km-analytics-delta--down={numDelta(current.uiModeChanges, previous.uiModeChanges)! < 0}
						>
							{#if formatDelta(current.uiModeChanges, previous.uiModeChanges)}
								<span class="km-analytics-delta-arrow" aria-hidden="true">
									{numDelta(current.uiModeChanges, previous.uiModeChanges)! > 0 ? '▲' : ''}
									{numDelta(current.uiModeChanges, previous.uiModeChanges)! < 0 ? '▼' : ''}
								</span>
								{formatDelta(current.uiModeChanges, previous.uiModeChanges)} vs prior week
							{/if}
						</div>
					{/if}
				</div>
				<div class="km-analytics-card">
					<div class="km-analytics-card-label">Android / iOS</div>
					<div class="km-analytics-card-value">
						{current.byPlatform.android ?? 0} / {current.byPlatform.ios ?? 0}
					</div>
					{#if previous}
						<div class="km-analytics-delta">
							{#if formatDelta(current.byPlatform.android ?? 0, previous.byPlatform.android ?? 0)}
								Android {formatDelta(current.byPlatform.android ?? 0, previous.byPlatform.android ?? 0)}
							{/if}
							<span class="km-analytics-delta-sep">·</span>
							{#if formatDelta(current.byPlatform.ios ?? 0, previous.byPlatform.ios ?? 0)}
								iOS {formatDelta(current.byPlatform.ios ?? 0, previous.byPlatform.ios ?? 0)}
							{/if}
						</div>
					{/if}
				</div>
				<div class="km-analytics-card">
					<div class="km-analytics-card-label">Classic / Overview</div>
					<div class="km-analytics-card-value">
						{current.byUiMode.classic ?? 0} / {current.byUiMode.overview ?? 0}
					</div>
					{#if previous}
						<div class="km-analytics-delta">
							{#if formatDelta(current.byUiMode.classic ?? 0, previous.byUiMode.classic ?? 0)}
								Classic {formatDelta(current.byUiMode.classic ?? 0, previous.byUiMode.classic ?? 0)}
							{/if}
							<span class="km-analytics-delta-sep">·</span>
							{#if formatDelta(current.byUiMode.overview ?? 0, previous.byUiMode.overview ?? 0)}
								Overview {formatDelta(current.byUiMode.overview ?? 0, previous.byUiMode.overview ?? 0)}
							{/if}
						</div>
					{/if}
				</div>
			</section>

			<div class="km-analytics-grid">
				<div class="km-analytics-chart-wrap km-analytics-chart-wrap--donut">
					<canvas bind:this={uiCanvas} aria-label="UI mode chart"></canvas>
				</div>
				<div class="km-analytics-chart-wrap km-analytics-chart-wrap--donut">
					<canvas bind:this={platformCanvas} aria-label="Platform chart"></canvas>
				</div>
				<div class="km-analytics-chart-wrap km-analytics-chart-wrap--bars">
					<canvas bind:this={featuresCanvas} aria-label="Top features chart"></canvas>
				</div>
				{#if bothModeFeatures.length > 0}
					<div class="km-analytics-chart-wrap km-analytics-chart-wrap--stacked">
						<canvas bind:this={stackedCanvas} aria-label="Classic vs overview stacked chart"></canvas>
					</div>
				{:else}
					<div class="km-analytics-chart-placeholder">
						No features with opens in both classic and overview for this week.
					</div>
				{/if}
				{#if weeksAsc.length >= 2}
					<div class="km-analytics-chart-wrap km-analytics-chart-wrap--trend">
						<canvas bind:this={trendCanvas} aria-label="UI mode week-over-week trend"></canvas>
					</div>
				{:else}
					<div class="km-analytics-chart-placeholder">
						UI mode trend appears when at least two weeks are stored.
					</div>
				{/if}
			</div>
		{/if}
	{/if}

	<details class="km-analytics-details">
		<summary class="km-analytics-summary">Add week from raw report</summary>
		<div class="km-analytics-form">
			<label class="km-analytics-label" for="km-paste">Paste report</label>
			<textarea
				id="km-paste"
				class="km-analytics-textarea"
				rows="14"
				bind:value={pasteText}
				placeholder="Conclavium — app usage report&#10;..."
			></textarea>
			<div class="km-analytics-form-actions">
				<button
					type="button"
					class="primary-button"
					disabled={submitStatus === 'loading' || pasteText.trim().length === 0}
					onclick={submitWeek}
				>
					{submitStatus === 'loading' ? 'Submitting…' : 'Submit week'}
				</button>
			</div>
			{#if submitStatus === 'success'}
				<p class="success-message km-analytics-msg">{submitMessage}</p>
			{:else if submitStatus === 'error'}
				<p class="error-message km-analytics-msg">{submitMessage}</p>
			{/if}
		</div>
	</details>
</div>
