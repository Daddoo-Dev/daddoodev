<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { fetchIssPosition } from '$lib/clocks/issPosition';

  let now = new Date();
  let lat: number | null = null;
  let lon: number | null = null;
  let loading = true;
  let error = false;
  let tickInterval: ReturnType<typeof setInterval>;
  let fetchInterval: ReturnType<typeof setInterval>;

  function setPosition(latitude: number, longitude: number) {
    lat = latitude;
    lon = longitude;
    error = false;
    loading = false;
  }

  async function fetchPosition() {
    const position = await fetchIssPosition();
    if (position) {
      setPosition(position.lat, position.lon);
      return;
    }
    error = true;
    loading = false;
  }

  function tick() {
    now = new Date();
  }

  onMount(() => {
    fetchPosition();
    tickInterval = setInterval(tick, 1000);
    fetchInterval = setInterval(fetchPosition, 8000);
    return () => {
      clearInterval(tickInterval);
      clearInterval(fetchInterval);
    };
  });
  onDestroy(() => {
    clearInterval(tickInterval);
    clearInterval(fetchInterval);
  });

  $: solarTime =
    lon !== null
      ? (() => {
          const offsetHours = lon / 15;
          const solar = new Date(now.getTime() + offsetHours * 3600 * 1000);
          return solar.toLocaleTimeString(undefined, {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
          });
        })()
      : '—';
  $: solarDate =
    lon !== null
      ? (() => {
          const offsetHours = lon / 15;
          const solar = new Date(now.getTime() + offsetHours * 3600 * 1000);
          return solar.toLocaleDateString(undefined, {
            weekday: 'short',
            day: 'numeric',
            month: 'short'
          });
        })()
      : '—';
  $: coordsStr =
    lat !== null && lon !== null ? `${lat.toFixed(1)}°, ${lon.toFixed(1)}°` : '—';
</script>

<div class="iss-clock">
  {#if error}
    <div class="iss-error">Position unavailable</div>
  {:else if loading && lon === null}
    <div class="iss-loading">Loading…</div>
  {:else}
    <div class="world-clock-time">{solarTime}</div>
    <div class="world-clock-date">{solarDate}</div>
    <div class="iss-caption">Solar time below ISS</div>
    <div class="iss-coords">{coordsStr}</div>
  {/if}
</div>
