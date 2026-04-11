<script lang="ts">
  import type { DiscoveryRow, DiscoveryResults } from '$lib/marketminder/types';
  import { compositeCss, entrySlug } from '$lib/marketminder/ui';

  export let discovery: DiscoveryResults | null;
  export let scanBusy = false;
  export let scanProgress = '';
  export let scanSkippedBusy = false;
  export let onScan: (limit: number, maxPrice: number | null) => void;
  export let onWatch: (symbol: string) => void;
  export let onBoughtFromDiscovery: (symbol: string, quantity: number, price: number) => void;

  let discLimit = 80;
  let discMaxPrice = '';
  let filterMax = '';
  let openBuy: Record<string, boolean> = {};

  function submitScan(e: Event) {
    e.preventDefault();
    const lim = Math.max(10, Math.min(503, discLimit));
    const raw = discMaxPrice.trim();
    let maxP: number | null = null;
    if (raw) {
      const n = parseFloat(raw);
      if (!Number.isNaN(n) && n > 0) maxP = n;
    }
    onScan(lim, maxP);
  }

  function toggleBuy(sym: string) {
    openBuy = { ...openBuy, [sym]: !openBuy[sym] };
  }

  function submitDiscoveryBuy(e: Event, row: DiscoveryRow) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const q = parseFloat((form.elements.namedItem('quantity') as HTMLInputElement).value);
    const p = parseFloat((form.elements.namedItem('price') as HTMLInputElement).value);
    if (q <= 0 || p <= 0) return;
    onBoughtFromDiscovery(row.symbol, q, p);
    openBuy = { ...openBuy, [row.symbol]: false };
  }

  $: maxFilter = filterMax.trim() === '' ? null : parseFloat(filterMax);
  $: filterValid = maxFilter != null && !Number.isNaN(maxFilter);

  function rowVisible(row: DiscoveryRow): boolean {
    if (!filterValid || maxFilter == null) return true;
    if (row.price == null) return false;
    return row.price <= maxFilter;
  }

  $: visibleCount =
    discovery?.results.filter(rowVisible).length ?? 0;
</script>

<section id="discovery" class="section discovery-section">
  <div class="section-header">
    <h2>Discovery</h2>
    <p class="muted">
      S&amp;P 500 scan for new capital — only BUY and CONSIDER (same model as the watchlist). WAIT/AVOID never appear here.
    </p>
  </div>

  {#if scanSkippedBusy}
    <div class="scan-skipped-banner">
      A scan was already running; that extra click was ignored. Wait for the current run to finish before starting another.
    </div>
  {/if}

  <div class="card card-form">
    <form class="add-form discovery-scan-form" on:submit={submitScan}>
      <label class="sr-only" for="discLimit">Symbols to scan after skipping your holdings and watchlist</label>
      <input type="number" id="discLimit" min="10" max="503" bind:value={discLimit} title="How many tickers to evaluate" />
      <label class="sr-only" for="discMaxPrice">Max price per share for scan</label>
      <input
        type="number"
        id="discMaxPrice"
        min="0"
        step="0.01"
        bind:value={discMaxPrice}
        placeholder="Max $/share (scan)"
        title="Optional. Only keeps rows priced at or below this (whole shares)." />
      <button type="submit" class="action-button primary" disabled={scanBusy}>
        {scanBusy ? 'Scanning…' : 'Run scan'}
      </button>
    </form>
    {#if scanProgress}
      <p class="muted discovery-note">{scanProgress}</p>
    {/if}
    <p class="discovery-note muted">
      Data from Yahoo. Large scans can take several minutes. Scan max $/share uses the same price shown on each card (monthly trend quote). Fractional-share buys are not modeled.
    </p>
  </div>

  {#if discovery?.results?.length}
    <p class="discovery-meta muted">
      Last run: {discovery.generated_at} · evaluated {discovery.scanned} tickers · {discovery.shortlist} BUY/CONSIDER
      {#if discovery.max_share_price != null}
        · scan cap ≤ ${discovery.max_share_price.toFixed(2)}/share
      {/if}
    </p>
    <div class="discovery-filter-row">
      <label for="discoveryPriceFilter">Show only if price/share ≤</label>
      <input
        type="number"
        id="discoveryPriceFilter"
        min="0"
        step="0.01"
        bind:value={filterMax}
        placeholder="e.g. 4.03 or 341"
        title="Filter this list without rescanning. Whole-share budget." />
      <span class="discovery-filter-count muted">
        {#if filterValid}
          Showing {visibleCount} of {discovery.results.length}
        {/if}
      </span>
    </div>
    <div class="discovery-grid" id="discoveryGrid">
      {#each discovery.results as row}
        {@const dvcss = row.verdict === 'BUY' ? 'buy' : 'consider'}
        {@const vis = rowVisible(row)}
        {#if vis}
          <div class="card discovery-card verdict-border-{dvcss}" data-share-price={row.price ?? ''}>
            <div class="card-header">
              <div class="ticker">{row.symbol}</div>
              <div class="card-actions">
                <button type="button" class="action-button primary compact" on:click={() => toggleBuy(row.symbol)}>Buy</button>
                <button type="button" class="action-button secondary compact" on:click={() => onWatch(row.symbol)}>Watch</button>
              </div>
            </div>
            <form
              class="buy-form"
              class:open={openBuy[row.symbol]}
              on:submit={(e) => submitDiscoveryBuy(e, row)}>
              <input type="hidden" name="symbol" value={row.symbol} />
              <input type="number" name="quantity" placeholder="Shares" step="any" min="0.01" required />
              <input
                type="number"
                name="price"
                placeholder="Price/share"
                step="any"
                min="0.01"
                required
                value={row.price != null ? row.price.toFixed(2) : ''} />
              <button type="submit" class="action-button primary compact">Add to Portfolio</button>
            </form>
            <div class="verdict verdict-{dvcss}">{row.verdict}</div>
            <div class="tag-row">
              {#each row.reasons as r}<span class="tag">{r}</span>{/each}
            </div>
            <div class="discovery-trend-line">
              <span class="stat-label">Trend</span>
              <span class="signal-small signal-{compositeCss(row.composite)}">{row.composite}</span>
              {#if row.price != null && row.ma_10mo != null}
                <span class="discovery-price muted">
                  Price ${row.price.toFixed(2)} · 10-mo MA ${row.ma_10mo.toFixed(2)}
                </span>
              {/if}
            </div>
            {#if row.entry}
              <div class="entry-signal entry-{entrySlug(row.entry.signal)} discovery-entry">
                <span class="entry-title">{row.entry.signal}</span>
                <span class="muted">(score {row.entry.score})</span>
              </div>
            {/if}
          </div>
        {/if}
      {/each}
    </div>
  {:else if discovery}
    <p class="discovery-meta muted">
      Last run: {discovery.generated_at} · evaluated {discovery.scanned} tickers — no BUY or CONSIDER in that sample.
    </p>
    <p class="section-hint muted">Raise the scan limit or run again (daily order rotates). WAIT/AVOID names are never listed here.</p>
  {:else}
    <p class="section-hint muted">No scan yet. Run a scan to find BUY/CONSIDER ideas outside your portfolio.</p>
  {/if}
</section>
