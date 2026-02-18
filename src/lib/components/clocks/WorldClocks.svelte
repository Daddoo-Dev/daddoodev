<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { WORLD_CLOCKS } from '$lib/clocks/timeUtils';

  let now = new Date();
  let interval: ReturnType<typeof setInterval>;

  function tick() {
    now = new Date();
  }

  onMount(() => {
    interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  });
  onDestroy(() => clearInterval(interval));

  function timeInZone(zoneId: string): string {
    if (zoneId === 'auto') {
      return now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    }
    return now.toLocaleTimeString(undefined, { timeZone: zoneId, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  }

  function dateInZone(zoneId: string): string {
    if (zoneId === 'auto') {
      return now.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
    }
    return now.toLocaleDateString(undefined, { timeZone: zoneId, weekday: 'short', day: 'numeric', month: 'short' });
  }
</script>

<div class="world-clocks">
  <h2 class="world-clocks-title">World time</h2>
  <div class="world-clocks-row">
    {#each WORLD_CLOCKS as { id, label }}
      <div class="world-clock-cell">
        <div class="world-clock-label">{label}</div>
        <div class="world-clock-time">{timeInZone(id)}</div>
        <div class="world-clock-date">{dateInZone(id)}</div>
      </div>
    {/each}
  </div>
</div>
