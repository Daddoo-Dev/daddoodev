<script lang="ts">
  import type { PortfolioRow } from '$lib/marketminder/types';
  import { compositeCss, entrySlug, momCss } from '$lib/marketminder/ui';

  export let item: PortfolioRow;
  export let onRemove: (symbol: string) => void;
  export let onAddShares: (symbol: string, quantity: number, price: number) => void;
  export let onSell: (symbol: string, sellPrice: number) => void;

  let showAddShares = false;
  let showSell = false;
  let addQty = '';
  let addPrice = '';
  let sellPrice = '';

  function submitAddShares(e: Event) {
    e.preventDefault();
    const q = parseFloat(addQty);
    const p = parseFloat(addPrice);
    if (!item.symbol || q <= 0 || p <= 0) return;
    onAddShares(item.symbol, q, p);
    addQty = '';
    addPrice = '';
    showAddShares = false;
  }

  function submitSell(e: Event) {
    e.preventDefault();
    const p = parseFloat(sellPrice);
    if (!item.symbol || p <= 0) return;
    onSell(item.symbol, p);
    sellPrice = '';
    showSell = false;
  }

  $: c = item.trend?.composite ?? '';
  $: css = compositeCss(c);
</script>

<div class="card">
  <div class="card-header">
    <div class="ticker">{item.symbol}</div>
    <div class="card-actions">
      {#if item.holding}
        <button
          type="button"
          class="action-button primary compact"
          on:click={() => (showAddShares = !showAddShares)}>Buy More</button>
        <button type="button" class="action-button danger compact" on:click={() => (showSell = !showSell)}>Sell</button>
      {/if}
      <button type="button" class="action-button secondary compact" on:click={() => onRemove(item.symbol)}>Remove</button>
    </div>
  </div>

  {#if item.holding}
    <form class="add-shares-form" class:open={showAddShares} on:submit={submitAddShares}>
      <input type="number" bind:value={addQty} placeholder="Shares bought" step="any" min="0.01" required />
      <input type="number" bind:value={addPrice} placeholder="Price/share" step="any" min="0.01" required />
      <button type="submit" class="action-button primary compact">Confirm Buy</button>
    </form>
    <form class="sell-form" class:open={showSell} on:submit={submitSell}>
      <input type="number" bind:value={sellPrice} placeholder="Sell price/share" step="any" min="0.01" required />
      <button type="submit" class="action-button danger compact">Confirm Sell</button>
    </form>
  {/if}

  {#if item.error}
    <p class="error">{item.error}</p>
  {:else if item.trend}
    <div class="signal signal-{css}">{c}</div>

    {#if item.analysis?.entry}
      {@const ent = item.analysis.entry}
      <div class="entry-signal entry-{entrySlug(ent.signal)}">
        <div class="entry-title">{ent.signal}</div>
        <div class="tag-row">
          {#each ent.reasons as r}<span class="tag">{r}</span>{/each}
        </div>
        {#if item.holding}
          <div class="guidance">
            Consider adding to your {Math.round(item.holding.quantity)}-share position. Current price: ${item.trend.medium?.price?.toFixed(2)}, your avg
            cost: ${item.holding.cost_per_share.toFixed(2)}/share.
          </div>
        {:else}
          <div class="guidance">Conditions favor buying. Trend is up, not overextended.</div>
        {/if}
      </div>
    {/if}

    {#if item.holding && c === 'EXIT'}
      <div class="signal-context signal-context-exit">
        You hold {Math.round(item.holding.quantity)} shares worth ${item.holding.market_value.toFixed(2)}
        ({item.holding.total_gain >= 0 ? 'gain' : 'loss'}: ${Math.abs(item.holding.total_gain).toFixed(2)}, {item.holding.unrealized_gain_pct.toFixed(1)}%).
        {#if item.analysis?.volume && (item.analysis.volume.level === 'HEAVY' || item.analysis.volume.level === 'ELEVATED')}
          Volume is {item.analysis.volume.volume_ratio}x above average — high-conviction sell signal.
        {/if}
        The trend has broken down — this is an exit signal.
        {#if item.holding.total_gain >= 0}
          Consider selling to protect ${item.holding.total_gain.toFixed(2)} in gains.
        {:else}
          Consider selling to limit further loss; you are already down ${Math.abs(item.holding.total_gain).toFixed(2)}.
        {/if}
        Re-enter when price recovers above the 10-month MA (${item.trend.medium?.ma?.toFixed(2)}).
      </div>
    {:else if item.holding && c === 'WEAKENING'}
      <div class="signal-context signal-context-warn">
        You hold {Math.round(item.holding.quantity)} shares at ${item.holding.cost_per_share.toFixed(2)}/share.
        {#if item.analysis?.volume && (item.analysis.volume.level === 'HEAVY' || item.analysis.volume.level === 'ELEVATED')}
          Volume is elevated ({item.analysis.volume.volume_ratio}x avg) — the selling pressure is real.
        {/if}
        Medium-term trend is weakening — not a full exit call yet; a rally could still narrow a loss or add to a gain. Set a mental stop. If price drops below the 10-month MA (${item.trend.medium?.ma?.toFixed(2)}),
        {#if item.holding.total_gain >= 0}
          consider trimming to protect your ${item.holding.total_gain.toFixed(2)} gain.
        {:else}
          consider trimming to limit further loss, as you are already down ${Math.abs(item.holding.total_gain).toFixed(2)}.
        {/if}
      </div>
    {/if}

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

    <div class="timeframes">
      {#if item.trend.short}
        <div class="timeframe">
          <div class="timeframe-label">Short (5-wk MA)</div>
          <div class="signal-small signal-{item.trend.short.signal.toLowerCase()}">{item.trend.short.signal}</div>
          <div class="stats">
            <div class="stat"><div class="stat-label">Price</div><div class="stat-value">${item.trend.short.price.toFixed(2)}</div></div>
            <div class="stat"><div class="stat-label">MA</div><div class="stat-value">${item.trend.short.ma.toFixed(2)}</div></div>
            <div class="stat"><div class="stat-label">% above MA</div><div class="stat-value">{item.trend.short.pct_above_ma.toFixed(2)}%</div></div>
          </div>
        </div>
      {/if}
      {#if item.trend.medium}
        <div class="timeframe">
          <div class="timeframe-label">Medium (10-mo MA)</div>
          <div class="signal-small signal-{item.trend.medium.signal.toLowerCase()}">{item.trend.medium.signal}</div>
          <div class="stats">
            <div class="stat"><div class="stat-label">Price</div><div class="stat-value">${item.trend.medium.price.toFixed(2)}</div></div>
            <div class="stat"><div class="stat-label">MA</div><div class="stat-value">${item.trend.medium.ma.toFixed(2)}</div></div>
            <div class="stat"><div class="stat-label">% above MA</div><div class="stat-value">{item.trend.medium.pct_above_ma.toFixed(2)}%</div></div>
          </div>
        </div>
      {/if}
      {#if item.trend.long}
        <div class="timeframe">
          <div class="timeframe-label">Long (24-mo MA)</div>
          <div class="signal-small signal-{item.trend.long.signal.toLowerCase()}">{item.trend.long.signal}</div>
          <div class="stats">
            <div class="stat"><div class="stat-label">Price</div><div class="stat-value">${item.trend.long.price.toFixed(2)}</div></div>
            <div class="stat"><div class="stat-label">MA</div><div class="stat-value">${item.trend.long.ma.toFixed(2)}</div></div>
            <div class="stat"><div class="stat-label">% above MA</div><div class="stat-value">{item.trend.long.pct_above_ma.toFixed(2)}%</div></div>
          </div>
        </div>
      {/if}
    </div>

    {#if item.trend.medium}
      <div class="info-row">
        <span class="stat-label">Drawdown from all-time high:</span>
        <span class="stat-value">{item.trend.medium.drawdown_pct.toFixed(2)}%</span>
      </div>
    {/if}

    {#if item.trend.overbought && item.trend.overbought.status !== 'NORMAL'}
      {@const ob = item.trend.overbought}
      <div class="overbought-warning overbought-{ob.status.toLowerCase()}">
        <div class="overbought-title">{ob.status}</div>
        <div class="overbought-details">
          <span>Z-score: {ob.z_score}</span>
          <span>Upper band: ${ob.upper_band.toFixed(2)}</span>
          <span>Price: ${item.trend.medium?.price?.toFixed(2)}</span>
        </div>
        <div class="overbought-guidance">
          {#if ob.status === 'OVERBOUGHT'}
            {#if item.holding && item.holding.total_gain < 0}
              Price is {ob.z_score} standard deviations above the 10-month trend. Consider trimming 20-30% if you want less exposure while price is stretched — you are already down ${Math.abs(item.holding.total_gain).toFixed(2)}. Not an exit — the trend is still up.
            {:else}
              Price is {ob.z_score} standard deviations above the 10-month trend. Consider trimming 20-30% to lock in gains. Not an exit — the trend is still up.
            {/if}
            {#if item.holding}
              <div class="overbought-action">
                {#if item.holding.total_gain >= 0}
                  You own {Math.round(item.holding.quantity)} shares with ${item.holding.total_gain.toFixed(2)} in gains ({item.holding.unrealized_gain_pct.toFixed(1)}%).
                  {#if item.holding.quantity >= 4}
                    Trimming ~25% = selling {Math.round(item.holding.quantity * 0.25)} shares would lock in ~${Math.round(item.holding.total_gain * 0.25)} in profit while keeping {Math.round(item.holding.quantity * 0.75)} shares riding the trend.
                  {:else if item.holding.quantity >= 2}
                    Position is small — consider selling 1 share to lock in ~${Math.round(item.holding.total_gain / item.holding.quantity)} and keep {Math.round(item.holding.quantity - 1)} riding the trend.
                  {:else}
                    Position is only 1 share — not practical to trim. Just be aware the price is stretched and may pull back.
                  {/if}
                {:else}
                  You own {Math.round(item.holding.quantity)} shares; you are down ${Math.abs(item.holding.total_gain).toFixed(2)} ({item.holding.unrealized_gain_pct.toFixed(1)}%).
                  {#if item.holding.quantity >= 4}
                    Trimming ~25% = selling {Math.round(item.holding.quantity * 0.25)} shares reduces how much you have at risk if price mean-reverts from here.
                  {:else if item.holding.quantity >= 2}
                    Position is small — selling 1 share lowers exposure while you wait out the stretch.
                  {:else}
                    Position is only 1 share — not practical to trim. Just be aware the price is stretched and may pull back.
                  {/if}
                {/if}
              </div>
            {/if}
          {:else}
            Price is running ahead of trend. If you were planning to add more, wait for a pullback closer to the MA (${item.trend.medium?.ma?.toFixed(2)}).
            {#if item.holding}
              <div class="overbought-action">
                Your {Math.round(item.holding.quantity)} shares are worth ${item.holding.market_value.toFixed(2)} (cost: ${item.holding.cost_per_share.toFixed(2)}/share). Hold and watch.
              </div>
            {/if}
          {/if}
        </div>
      </div>
    {/if}

    {#if item.holding}
      <div class="stats stats-position">
        <div class="stat"><div class="stat-label">Shares</div><div class="stat-value">{item.holding.quantity.toFixed(2)}</div></div>
        <div class="stat"><div class="stat-label">Cost/share</div><div class="stat-value">${item.holding.cost_per_share.toFixed(2)}</div></div>
        <div class="stat"><div class="stat-label">Cost basis</div><div class="stat-value">${item.holding.cost_basis.toFixed(2)}</div></div>
        <div class="stat"><div class="stat-label">Market value</div><div class="stat-value">${item.holding.market_value.toFixed(2)}</div></div>
        <div class="stat"><div class="stat-label">Unrealized P&amp;L</div><div class="stat-value">${item.holding.total_gain.toFixed(2)}</div></div>
        <div class="stat"><div class="stat-label">Return %</div><div class="stat-value">{item.holding.unrealized_gain_pct.toFixed(2)}%</div></div>
      </div>
    {/if}
  {/if}
</div>
