<script lang="ts">
  import type { AnalyzedSymbol, WatchlistItem } from '$lib/marketminder/types';
  import { compositeCss, entrySlug, momCss, watchlistVerdictCss } from '$lib/marketminder/ui';

  export let item: AnalyzedSymbol;
  export let meta: WatchlistItem;
  export let onRemove: (symbol: string) => void;
  export let onBought: (symbol: string, quantity: number, price: number) => void;

  let showBuy = false;
  let buyQty = '';
  let buyPrice = '';

  function submitBought(e: Event) {
    e.preventDefault();
    const q = parseFloat(buyQty);
    const p = parseFloat(buyPrice);
    if (!item.symbol || q <= 0 || p <= 0) return;
    onBought(item.symbol, q, p);
    buyQty = '';
    buyPrice = '';
    showBuy = false;
  }

  $: v = item.verdict?.verdict ?? 'N/A';
  $: vcss = watchlistVerdictCss(v);
  $: c = item.trend?.composite ?? '';
  $: cc = compositeCss(c);
</script>

<div class="card watchlist-card verdict-border-{vcss}">
  <div class="card-header">
    <div class="ticker">{item.symbol}</div>
    <div class="card-actions">
      <button type="button" class="action-button primary compact" on:click={() => (showBuy = !showBuy)}>I bought it</button>
      <button type="button" class="action-button secondary compact" on:click={() => onRemove(item.symbol)}>Remove</button>
    </div>
  </div>

  <form class="buy-form" class:open={showBuy} on:submit={submitBought}>
    <input type="number" bind:value={buyQty} placeholder="Shares" step="any" min="0.01" required />
    <input type="number" bind:value={buyPrice} placeholder="Price/share" step="any" min="0.01" required />
    <button type="submit" class="action-button primary compact">Add to Portfolio</button>
  </form>

  {#if meta.sold_price}
    <div class="sold-context">
      Previously owned — sold at ${meta.sold_price.toFixed(2)} on {meta.sold_date ?? ''}
      {#if item.trend?.medium}
        {@const diff = item.trend.medium.price - meta.sold_price}
        {#if diff < 0}
          (now ${item.trend.medium.price.toFixed(2)}, {((diff / meta.sold_price) * 100).toFixed(1)}% below your sell)
        {:else}
          (now ${item.trend.medium.price.toFixed(2)}, +{((diff / meta.sold_price) * 100).toFixed(1)}% above your sell)
        {/if}
      {/if}
    </div>
  {:else if meta.sold_date}
    <div class="sold-context">Previously owned — sold on {meta.sold_date}</div>
  {/if}

  {#if item.error}
    <p class="error">{item.error}</p>
  {:else if item.trend && item.verdict}
    <div class="verdict verdict-{vcss}">{v}</div>
    <div class="tag-row">
      {#each item.verdict.reasons as r}<span class="tag">{r}</span>{/each}
    </div>

    {#if item.analysis}
      <div class="analysis-row">
        {#if item.analysis.relative_strength}
          {@const rs = item.analysis.relative_strength}
          <div class="analysis-item">
            <div class="analysis-label">vs S&amp;P 500</div>
            <div class="analysis-status analysis-rs-{rs.status.toLowerCase()}">{rs.status}</div>
            <div class="analysis-detail">
              3mo: {rs.rs_3m >= 0 ? '+' : ''}{rs.rs_3m.toFixed(1)}% &nbsp; 6mo: {rs.rs_6m >= 0 ? '+' : ''}{rs.rs_6m.toFixed(1)}%
            </div>
          </div>
        {/if}
        {#if item.analysis.momentum}
          {@const mom = item.analysis.momentum}
          <div class="analysis-item">
            <div class="analysis-label">Momentum</div>
            <div class="analysis-status analysis-mom-{momCss(mom.status)}">{mom.status}</div>
            <div class="analysis-detail">
              1mo: {mom.roc_1m >= 0 ? '+' : ''}{mom.roc_1m.toFixed(1)}% &nbsp; 3mo: {mom.roc_3m >= 0 ? '+' : ''}{mom.roc_3m.toFixed(1)}%
            </div>
          </div>
        {/if}
        {#if item.analysis.volume}
          {@const vol = item.analysis.volume}
          <div class="analysis-item">
            <div class="analysis-label">Volume</div>
            <div class="analysis-status analysis-vol-{vol.level.toLowerCase()}">{vol.level} ({vol.volume_ratio}x avg)</div>
          </div>
        {/if}
      </div>
    {/if}

    <div class="watchlist-trend">
      <span class="stat-label">Trend:</span>
      <span class="signal-small signal-{cc}">{c}</span>
      {#if item.trend.medium}
        <span class="stat-label">&nbsp; Price:</span>
        <span class="stat-value">${item.trend.medium.price.toFixed(2)}</span>
        <span class="stat-label">&nbsp; 10-mo MA:</span>
        <span class="stat-value">${item.trend.medium.ma.toFixed(2)}</span>
        <span class="stat-label">&nbsp; Drawdown:</span>
        <span class="stat-value">{item.trend.medium.drawdown_pct.toFixed(1)}%</span>
      {/if}
    </div>

    {#if item.trend.overbought && item.trend.overbought.status !== 'NORMAL'}
      {@const ob = item.trend.overbought}
      <div class="overbought-warning overbought-{ob.status.toLowerCase()}">
        <div class="overbought-title">{ob.status}</div>
        <div class="overbought-details">
          <span>Z-score: {ob.z_score}</span>
          <span>Upper band: ${ob.upper_band.toFixed(2)}</span>
        </div>
      </div>
    {/if}
  {/if}
</div>
