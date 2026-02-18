<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { getTimeZoneOptions } from '$lib/clocks/timeUtils';

  let now = new Date();
  let tz = 'auto';
  let interval: ReturnType<typeof setInterval>;
  const tzOptions = getTimeZoneOptions();

  function tick() {
    now = new Date();
  }

  onMount(() => {
    interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  });
  onDestroy(() => clearInterval(interval));

  $: timeStr = tz === 'auto'
    ? now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
    : now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true, timeZone: tz });
  $: dateStr = tz === 'auto'
    ? now.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
    : now.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', timeZone: tz });
  $: tzLabel = tz === 'auto' ? 'Local' : tz;
</script>

<div class="standard-clock">
  <select class="clock-select" bind:value={tz} aria-label="Timezone">
    {#each tzOptions as opt}
      <option value={opt.value}>{opt.label}</option>
    {/each}
  </select>
  <div class="clock-time">{timeStr}</div>
  <div class="clock-date">{dateStr}</div>
  <div class="clock-tz">{tzLabel}</div>
</div>
