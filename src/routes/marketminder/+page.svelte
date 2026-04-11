<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { onAuthStateChanged, signOut } from 'firebase/auth';
  import { getFirebaseAuth, isFirebaseConfigured } from '$lib/firebase/client';
  import PortfolioCard from '$lib/components/marketminder/PortfolioCard.svelte';
  import WatchlistCard from '$lib/components/marketminder/WatchlistCard.svelte';
  import DiscoveryPanel from '$lib/components/marketminder/DiscoveryPanel.svelte';
  import { runSp500Discovery } from '$lib/marketminder/discovery';
  import { loadMonthlySeries, loadWeeklyPack, setMarketminderChartAuth } from '$lib/marketminder/prices';
  import {
    attachWatchlistVerdict,
    analyzeSymbolSync,
    refreshHolding
  } from '$lib/marketminder/symbolAnalysis';
  import {
    clearStorageUser,
    flushMarketminderPersist,
    initStorageForUser,
    loadDiscovery,
    loadHoldings,
    loadTickers,
    loadWatchlist,
    saveDiscovery,
    saveHoldings,
    saveTickers,
    saveWatchlist
  } from '$lib/marketminder/storage';
  import type {
    AnalyzedSymbol,
    DiscoveryResults,
    Holding,
    PortfolioRow,
    WatchlistItem
  } from '$lib/marketminder/types';

  let theme = 'dark';
  let lastEvaluated = '';
  let loading = false;
  let loadError = '';
  let portfolioRows: PortfolioRow[] = [];
  let watchlistRows: { meta: WatchlistItem; analysis: AnalyzedSymbol }[] = [];
  let staleSymbols: string[] = [];
  let discovery: DiscoveryResults | null = null;
  let scanBusy = false;
  let scanSkippedBusy = false;
  let scanProgress = '';
  let misconfigured = false;
  /** Waiting for Firebase Auth + Firestore hydrate */
  let bootAuth = true;

  let addSymbol = '';
  let addQty = '';
  let addPrice = '';
  let wlSymbol = '';
  let fileInput: HTMLInputElement | null = null;

  function formatNow(): string {
    const n = new Date();
    const p = (x: number) => String(x).padStart(2, '0');
    return `${n.getFullYear()}-${p(n.getMonth() + 1)}-${p(n.getDate())} ${p(n.getHours())}:${p(n.getMinutes())}`;
  }

  function discoveryExcluded(): Set<string> {
    const ex = new Set<string>();
    for (const t of loadTickers()) ex.add(t.toUpperCase());
    for (const k of Object.keys(loadHoldings())) ex.add(k.toUpperCase());
    for (const w of loadWatchlist()) ex.add(w.symbol.toUpperCase());
    return ex;
  }

  async function refreshAll() {
    loadError = '';
    loading = true;
    staleSymbols = [];
    try {
      const spy = await loadMonthlySeries('SPY');
      const tickers = loadTickers();
      const holdings = loadHoldings();
      const symbols = [...new Set(tickers.map((t) => t.toUpperCase()))].sort();
      const out: PortfolioRow[] = [];
      for (const sym of symbols) {
        try {
          const [monthly, weekly] = await Promise.all([
            loadMonthlySeries(sym),
            loadWeeklyPack(sym)
          ]);
          let r = analyzeSymbolSync(sym, spy, monthly, weekly);
          const h = holdings[sym] ?? null;
          let holdingOut: Holding | null = h;
          if (h && r.trend?.medium) {
            holdingOut = refreshHolding(h, r.trend.medium.price);
          }
          out.push({ ...r, holding: holdingOut });
        } catch {
          staleSymbols.push(sym);
          const h = holdings[sym] ?? null;
          out.push({
            symbol: sym,
            error: 'Failed to load price data',
            trend: null,
            analysis: null,
            holding: h
          });
        }
      }
      portfolioRows = out;

      const wl = loadWatchlist();
      const wout: { meta: WatchlistItem; analysis: AnalyzedSymbol }[] = [];
      for (const item of wl) {
        const sym = item.symbol.toUpperCase();
        try {
          const [monthly, weekly] = await Promise.all([
            loadMonthlySeries(sym),
            loadWeeklyPack(sym)
          ]);
          const base = analyzeSymbolSync(sym, spy, monthly, weekly);
          wout.push({ meta: item, analysis: attachWatchlistVerdict(base) });
        } catch {
          wout.push({
            meta: item,
            analysis: {
              symbol: sym,
              error: 'Failed to load price data',
              trend: null,
              analysis: null,
              verdict: { verdict: 'N/A', reasons: ['insufficient data'] }
            }
          });
        }
      }
      watchlistRows = wout;
      lastEvaluated = formatNow();
    } catch (e) {
      loadError = e instanceof Error ? e.message : String(e);
    } finally {
      loading = false;
    }
  }

  function addTickerSubmit(e: Event) {
    e.preventDefault();
    const raw = addSymbol.trim();
    const symbols = raw
      .split(',')
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean);
    if (!symbols.length) return;
    const tickers = loadTickers();
    for (const sym of symbols) {
      if (sym && !tickers.includes(sym)) tickers.push(sym);
    }
    saveTickers(tickers);

    const q = parseFloat(addQty) || 0;
    const p = parseFloat(addPrice) || 0;
    if (q > 0 && p > 0 && symbols.length === 1) {
      const sym = symbols[0];
      const holdings = loadHoldings();
      const existing = holdings[sym] ?? { quantity: 0, cost_basis: 0 };
      const oldQty = existing.quantity ?? 0;
      const oldCost = existing.cost_basis ?? 0;
      const totalQty = oldQty + q;
      const totalCost = oldCost + q * p;
      const avg = totalQty > 0 ? totalCost / totalQty : 0;
      holdings[sym] = {
        symbol: sym,
        quantity: Math.round(totalQty * 10000) / 10000,
        cost_per_share: Math.round(avg * 10000) / 10000,
        cost_basis: Math.round(totalCost * 100) / 100,
        market_value: 0,
        total_gain: 0,
        unrealized_gain_pct: 0
      };
      saveHoldings(holdings);
    }
    addSymbol = '';
    addQty = '';
    addPrice = '';
    void refreshAll();
  }

  function removeTicker(sym: string) {
    const u = sym.toUpperCase();
    saveTickers(loadTickers().filter((t) => t !== u));
    const h = loadHoldings();
    delete h[u];
    saveHoldings(h);
    void refreshAll();
  }

  function addShares(sym: string, quantity: number, price: number) {
    const u = sym.toUpperCase();
    const holdings = loadHoldings();
    const existing = holdings[u];
    if (!existing) return;
    const oldQty = existing.quantity;
    const oldCost = existing.cost_basis;
    const totalQty = oldQty + quantity;
    const totalCost = oldCost + quantity * price;
    const avg = totalQty > 0 ? totalCost / totalQty : 0;
    holdings[u] = {
      symbol: u,
      quantity: Math.round(totalQty * 10000) / 10000,
      cost_per_share: Math.round(avg * 10000) / 10000,
      cost_basis: Math.round(totalCost * 100) / 100,
      market_value: existing.market_value,
      total_gain: existing.total_gain,
      unrealized_gain_pct: existing.unrealized_gain_pct
    };
    saveHoldings(holdings);
    void refreshAll();
  }

  function sellStock(sym: string, sellPrice: number) {
    const u = sym.toUpperCase();
    saveTickers(loadTickers().filter((t) => t !== u));
    const holdings = loadHoldings();
    delete holdings[u];
    saveHoldings(holdings);
    const wl = loadWatchlist();
    const syms = wl.map((w) => w.symbol.toUpperCase());
    if (!syms.includes(u)) {
      const entry: WatchlistItem = {
        symbol: u,
        sold_date: new Date().toISOString().slice(0, 10)
      };
      if (sellPrice > 0) entry.sold_price = Math.round(sellPrice * 100) / 100;
      wl.push(entry);
      wl.sort((a, b) => a.symbol.localeCompare(b.symbol));
      saveWatchlist(wl);
    }
    void refreshAll();
  }

  function addWatchlistSubmit(e: Event) {
    e.preventDefault();
    const raw = wlSymbol.trim();
    const symbols = raw
      .split(',')
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean);
    if (!symbols.length) return;
    const wl = loadWatchlist();
    const existing = new Set(wl.map((w) => w.symbol.toUpperCase()));
    for (const sym of symbols) {
      if (sym && !existing.has(sym)) {
        wl.push({ symbol: sym });
        existing.add(sym);
      }
    }
    wl.sort((a, b) => a.symbol.localeCompare(b.symbol));
    saveWatchlist(wl);
    wlSymbol = '';
    void refreshAll();
  }

  function removeWatchlist(sym: string) {
    const u = sym.toUpperCase();
    saveWatchlist(loadWatchlist().filter((w) => w.symbol.toUpperCase() !== u));
    void refreshAll();
  }

  async function watchlistBought(sym: string, quantity: number, price: number) {
    const u = sym.toUpperCase();
    const tickers = loadTickers();
    if (!tickers.includes(u)) {
      tickers.push(u);
      saveTickers(tickers);
    }
    let currentPrice = price;
    try {
      const monthly = await loadMonthlySeries(u);
      if (monthly.length) currentPrice = monthly[monthly.length - 1];
    } catch {
      /* keep price */
    }
    const costBasis = quantity * price;
    const marketValue = quantity * currentPrice;
    const totalGain = marketValue - costBasis;
    const gainPct = costBasis > 0 ? (totalGain / costBasis) * 100 : 0;
    const holdings = loadHoldings();
    holdings[u] = {
      symbol: u,
      quantity,
      cost_per_share: price,
      cost_basis: Math.round(costBasis * 100) / 100,
      market_value: Math.round(marketValue * 100) / 100,
      total_gain: Math.round(totalGain * 100) / 100,
      unrealized_gain_pct: Math.round(gainPct * 100) / 100
    };
    saveHoldings(holdings);
    saveWatchlist(loadWatchlist().filter((w) => w.symbol.toUpperCase() !== u));
    void refreshAll();
  }

  async function discoveryBought(sym: string, quantity: number, price: number) {
    await watchlistBought(sym, quantity, price);
  }

  function addWatchFromDiscovery(sym: string) {
    const u = sym.toUpperCase();
    const wl = loadWatchlist();
    if (wl.some((w) => w.symbol.toUpperCase() === u)) return;
    wl.push({ symbol: u });
    wl.sort((a, b) => a.symbol.localeCompare(b.symbol));
    saveWatchlist(wl);
    void refreshAll();
  }

  async function runScan(limit: number, maxPrice: number | null) {
    if (scanBusy) {
      scanSkippedBusy = true;
      setTimeout(() => {
        scanSkippedBusy = false;
      }, 4000);
      return;
    }
    scanBusy = true;
    scanProgress = '';
    try {
      const excluded = discoveryExcluded();
      const res = await runSp500Discovery(excluded, limit, maxPrice, (done, total) => {
        scanProgress = `Scanning ${done} / ${total}…`;
      });
      discovery = res;
      saveDiscovery(res);
      scanProgress = '';
    } catch (e) {
      loadError = e instanceof Error ? e.message : String(e);
    } finally {
      scanBusy = false;
    }
  }

  function parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') inQuotes = !inQuotes;
      else if (c === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else current += c;
    }
    result.push(current.trim());
    return result;
  }

  function parseEtradeCsv(text: string): { symbols: string[]; holdings: Record<string, Holding> } {
    const lines = text.split(/\r?\n/).filter((ln) => ln.length > 0);
    let headerIdx: number | null = null;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('Symbol,') && lines[i].includes('Qty')) {
        headerIdx = i;
        break;
      }
    }
    if (headerIdx == null) return { symbols: [], holdings: {} };
    const header = parseCSVLine(lines[headerIdx]);
    const col = (name: string) => header.indexOf(name);
    const symCol = col('Symbol');
    const qtyCol = col('Qty #');
    const priceCol = col('Price Paid $');
    const valCol = col('Value $');
    const gainCol = col('Total Gain $');
    const gainPctCol = col('Total Gain %');
    if (symCol < 0) return { symbols: [], holdings: {} };

    const holdings: Record<string, Holding> = {};
    const symbols: string[] = [];
    const re = /^[A-Z]{1,5}(\.[A-Z])?$/;
    for (let r = headerIdx + 1; r < lines.length; r++) {
      const cols = parseCSVLine(lines[r]);
      const pick = (c: number) => {
        if (c < 0) return 0;
        const v = (cols[c] ?? '').replace(/,/g, '');
        const n = parseFloat(v);
        return Number.isNaN(n) ? 0 : n;
      };
      const sym = (cols[symCol] ?? '').trim().toUpperCase();
      if (!sym || sym === 'CASH' || sym === 'TOTAL') continue;
      if (!re.test(sym)) continue;
      const qty = pick(qtyCol);
      const pps = pick(priceCol);
      symbols.push(sym);
      holdings[sym] = {
        symbol: sym,
        quantity: qty,
        cost_per_share: pps,
        cost_basis: qty * pps,
        market_value: pick(valCol),
        total_gain: pick(gainCol),
        unrealized_gain_pct: pick(gainPctCol)
      };
    }
    return { symbols: [...new Set(symbols)].sort(), holdings };
  }

  function onCsvChange(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? '');
      const { symbols, holdings } = parseEtradeCsv(text);
      if (symbols.length) {
        saveTickers(symbols);
        saveHoldings(holdings);
        void refreshAll();
      }
    };
    reader.readAsText(file, 'UTF-8');
  }

  function toggleTheme() {
    theme = theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('mm-theme', theme);
  }

  async function signOutMm() {
    await flushMarketminderPersist();
    await signOut(getFirebaseAuth());
    clearStorageUser();
    setMarketminderChartAuth(null);
    goto('/marketminder/login');
  }

  onMount(() => {
    const saved = localStorage.getItem('mm-theme');
    if (saved === 'light' || saved === 'dark') theme = saved;

    if (!isFirebaseConfigured()) {
      misconfigured = true;
      bootAuth = false;
      return;
    }

    const auth = getFirebaseAuth();
    setMarketminderChartAuth(async () => {
      const u = auth.currentUser;
      return u ? u.getIdToken() : null;
    });

    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        clearStorageUser();
        setMarketminderChartAuth(null);
        goto('/marketminder/login');
        return;
      }
      try {
        await initStorageForUser(user.uid);
        discovery = loadDiscovery();
        bootAuth = false;
        await refreshAll();
      } catch (e) {
        loadError = e instanceof Error ? e.message : String(e);
        bootAuth = false;
      }
    });

    return () => {
      unsub();
      clearStorageUser();
      setMarketminderChartAuth(null);
    };
  });
</script>

<svelte:head>
  <title>MarketMinder | Daddoo Dev</title>
  <meta name="robots" content="noindex, nofollow" />
  <meta
    name="description"
    content="Personal portfolio trend dashboard — not linked from site navigation." />
</svelte:head>

<div class="mm-root-wrap mm-scope" data-theme={theme}>
  {#if misconfigured}
    <div class="section">
      <p class="error">
        Firebase is not configured. Set PUBLIC_FIREBASE_API_KEY, PUBLIC_FIREBASE_AUTH_DOMAIN, PUBLIC_FIREBASE_PROJECT_ID, and PUBLIC_FIREBASE_APP_ID, then rebuild.
      </p>
    </div>
  {:else if bootAuth}
    <p class="muted section">Signing you in…</p>
  {:else}
  <header class="mm-app-header">
    <div class="header-left">
      <h1 class="mm-app-title">MarketMinder</h1>
      <p class="muted">Last evaluated: {lastEvaluated || '—'}</p>
    </div>
    <div class="header-right">
      <button type="button" class="action-button secondary compact" on:click={signOutMm}>Sign out</button>
      <button
        type="button"
        class="icon-btn"
        title="Toggle light/dark mode"
        aria-label="Toggle light or dark theme"
        on:click={toggleTheme}>
        <svg class="icon icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          ><path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" /></svg>
        <svg class="icon icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          ><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line
            x1="4.22"
            y1="4.22"
            x2="5.64"
            y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line
            x1="21"
            y1="12"
            x2="23"
            y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
      </button>
    </div>
  </header>

  {#if loadError}
    <div class="stale-banner">{loadError}</div>
  {/if}

  {#if staleSymbols.length}
    <div class="stale-banner">
      Data incomplete for {staleSymbols.join(', ')} — signals may be missing until quotes load.
    </div>
  {/if}

  {#if loading}
    <p class="muted">Loading market data…</p>
  {/if}

  <section class="section">
    <div class="section-header">
      <h2>Portfolio</h2>
    </div>

    <div class="card card-form">
      <form class="add-form" on:submit={addTickerSubmit}>
        <input type="text" bind:value={addSymbol} placeholder="Ticker (e.g. AAPL)" autocomplete="off" />
        <input type="number" bind:value={addQty} placeholder="Shares (optional)" step="any" min="0" />
        <input type="number" bind:value={addPrice} placeholder="Cost/share (optional)" step="any" min="0" />
        <button type="submit" class="action-button primary">Add</button>
      </form>
      <div class="add-form">
        <input
          bind:this={fileInput}
          type="file"
          accept=".csv"
          class="mm-file-input"
          on:change={onCsvChange} />
        <button type="button" class="action-button secondary" on:click={() => fileInput?.click()}>Import CSV</button>
      </div>
    </div>

    {#each portfolioRows as item (item.symbol)}
      <PortfolioCard {item} onRemove={removeTicker} onAddShares={addShares} onSell={sellStock} />
    {/each}
  </section>

  <DiscoveryPanel
    {discovery}
    {scanBusy}
    {scanProgress}
    {scanSkippedBusy}
    onScan={runScan}
    onWatch={addWatchFromDiscovery}
    onBoughtFromDiscovery={discoveryBought} />

  <section id="watchlist" class="section watchlist-section">
    <div class="section-header">
      <h2>Watchlist</h2>
      <p class="muted">Stocks you're considering — analyzed for buy timing</p>
    </div>

    <div class="card card-form">
      <form class="add-form" on:submit={addWatchlistSubmit}>
        <input
          type="text"
          bind:value={wlSymbol}
          placeholder="Add to watchlist (e.g. SNOW, UBER, TSLA)"
          autocomplete="off" />
        <button type="submit" class="action-button primary">Watch</button>
      </form>
    </div>

    {#if watchlistRows.length === 0}
      <p class="section-hint muted">No watchlist stocks yet. Add tickers above to get buy/wait/avoid recommendations.</p>
    {:else}
      {#each watchlistRows as row (row.meta.symbol)}
        <WatchlistCard
          item={row.analysis}
          meta={row.meta}
          onRemove={removeWatchlist}
          onBought={watchlistBought} />
      {/each}
    {/if}
  </section>
  {/if}
</div>
