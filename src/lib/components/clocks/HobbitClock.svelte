<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import {
    getCurrentHobbitMeal,
    getMinutesUntilNextMeal,
    HOBBIT_MEAL_POSITIONS
  } from '$lib/clocks/timeUtils';

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

  $: meal = getCurrentHobbitMeal(now);
  $: minsUntil = getMinutesUntilNextMeal(now, meal.next);
  $: countdownHours = Math.floor(minsUntil / 60);
  $: countdownMins = minsUntil % 60;
  $: countdownStr =
    countdownHours > 0
      ? `${countdownHours}h ${countdownMins}m`
      : `${countdownMins}m`;

  $: hourRotation =
    (now.getHours() % 12 + now.getMinutes() / 60 + now.getSeconds() / 3600) * 30 - 90;
  $: minuteRotation = (now.getMinutes() + now.getSeconds() / 60) * 6 - 90;
  $: secondRotation = now.getSeconds() * 6 - 90;
</script>

<div class="hobbit-clock">
  <div
    class="hobbit-face clock-face"
    role="img"
    aria-label="Hobbit meal clock showing {meal.current.name}"
    style="--rotation-hour: {hourRotation}deg; --rotation-minute: {minuteRotation}deg; --rotation-second: {secondRotation}deg"
  >
    {#each Array(12) as _, i}
      <div class="hobbit-tick" style="--tick-rotation: {i * 30}deg"></div>
    {/each}
    {#each HOBBIT_MEAL_POSITIONS as { name, rotationDeg }}
      <div class="hobbit-meal-label" style="--meal-rotation: {rotationDeg}deg; --meal-rotation-counter: {-rotationDeg}deg">
        <span>{name}</span>
      </div>
    {/each}
    <div class="clock-hand clock-hand-hour"></div>
    <div class="clock-hand clock-hand-minute"></div>
    <div class="clock-hand clock-hand-second"></div>
  </div>
  <div class="hobbit-now">Now: <strong>{meal.current.name}</strong></div>
  <div class="hobbit-countdown">
    Next: <strong>{meal.next.name}</strong> in {countdownStr}
  </div>
</div>
