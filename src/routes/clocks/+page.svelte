<script lang="ts">
  import '$lib/styles/global.css';
  import WorldClocks from '$lib/components/clocks/WorldClocks.svelte';
  import StandardClock from '$lib/components/clocks/StandardClock.svelte';
  import DecimalClock from '$lib/components/clocks/DecimalClock.svelte';
  import HobbitClock from '$lib/components/clocks/HobbitClock.svelte';
  import ISSClock from '$lib/components/clocks/ISSClock.svelte';
</script>

<svelte:head>
  <title>ChronoCluster - Daddoo Dev</title>
  <meta name="description" content="ChronoCluster: world time, standard, decimal, Hobbit, and ISS clocks in one place." />
</svelte:head>

<div class="chrono-cluster-page">
  <div class="container">
    <h1 class="page-title">ChronoCluster</h1>
    <p class="page-description">
      World time and alternate clocks — standard, decimal, Hobbit, and ISS — in one strip.
    </p>
    <div class="chrono-strip-wrap">
      <WorldClocks />
    </div>
    <div class="chrono-strip world-clocks">
      <h2 class="world-clocks-title">Clocks</h2>
      <div class="world-clocks-row chrono-clocks-row">
        <div class="world-clock-cell chrono-clock-cell">
          <div class="world-clock-label">Standard</div>
          <StandardClock />
        </div>
        <div class="world-clock-cell chrono-clock-cell">
          <div class="world-clock-label">Decimal</div>
          <DecimalClock />
        </div>
        <div class="world-clock-cell chrono-clock-cell">
          <div class="world-clock-label">ISS</div>
          <ISSClock />
        </div>
        <div class="world-clock-cell chrono-clock-cell hobbit-cell">
          <div class="world-clock-label">Hobbit</div>
          <HobbitClock />
        </div>
      </div>
    </div>
  </div>
</div>
