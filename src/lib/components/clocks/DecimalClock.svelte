<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { toDecimalTime } from '$lib/clocks/timeUtils';

  let now = new Date();
  let interval: ReturnType<typeof setInterval>;

  function tick() {
    now = new Date();
  }

  onMount(() => {
    interval = setInterval(tick, 100);
    return () => clearInterval(interval);
  });
  onDestroy(() => clearInterval(interval));

  $: decimal = toDecimalTime(now);
  $: timeStr = `${String(decimal.hours).padStart(2, '0')}:${String(decimal.minutes).padStart(2, '0')}:${String(decimal.seconds).padStart(2, '0')}`;
  $: hourRotation = (decimal.hours + decimal.minutes / 100 + decimal.seconds / 10000) * 36 - 90;
  $: minuteRotation = (decimal.minutes + decimal.seconds / 100) * 3.6 - 90;
  $: secondRotation = decimal.seconds * 3.6 - 90;
</script>

<div class="decimal-clock">
  <div class="clock-time decimal-time">{timeStr}</div>
  <div class="clock-face" role="img" aria-label="Decimal time {timeStr}" style="--rotation-hour: {hourRotation}deg; --rotation-minute: {minuteRotation}deg; --rotation-second: {secondRotation}deg">
    <div class="clock-hand clock-hand-hour"></div>
    <div class="clock-hand clock-hand-minute"></div>
    <div class="clock-hand clock-hand-second"></div>
  </div>
  <p class="clock-caption">10 hours × 100 min × 100 sec per day</p>
</div>
