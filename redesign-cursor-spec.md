# Build Spec: daddoodev.pro Redesign — "Mission Control"

Companion to `bbs-terminal-cursor-spec.md`. **Build this spec first**; the terminal's amber phosphor is designed to match this theme. Feed Cursor one phase per session, in order. Each phase leaves the site deployable.

---

## Context (read first)

Existing SvelteKit + TypeScript site, plain global CSS (`src/lib/styles/global.css`, ~2,500 lines), Firebase Hosting, Playwright e2e. Components in `src/lib/components/`. No Tailwind on the main site — keep it that way.

**Design direction:** replace the current Tron aesthetic (TR2N font, neon glows, random accent color, NASA photo background) with a restrained "mission control" identity: deep ink background, one fixed warm amber accent, mono type for labels/metadata, generous spacing, 1px borders instead of glows. Dark theme only — no light mode.

**Scope includes every route**, public and hidden. Hidden routes get the same visual glow-up but must remain unlisted (see Phase 5 visibility rules).

Route inventory:
- **Public:** `/` (Hero, About, Projects, Contact), `/clocks`, `/qr-generator`, `/twistedfortunes`, `/privacy`, `/terms`
- **Hidden (restyle, do NOT surface):** `/marketminder` + `/marketminder/login`, `/honorguard` + `/honorguard/preview`, `/analytics/conclavium`, `/analytics/knights-management`
- **Not pages:** `/api/*`, `/bbs` (separate spec)

---

## Phase 0 — Housekeeping fixes (15 minutes, do first)

1. `src/lib/components/SEO.svelte`: default `url` and `image` props contain a typo — `dadddodev.pro` (three d's). Fix to `daddoodev.pro`. Grep the whole repo for `dadddodev` and fix all instances (including the SEO call in `src/routes/+page.svelte`).
2. Add a `noindex: boolean = false` prop to `SEO.svelte`. When true, render `<meta name="robots" content="noindex, nofollow" />` instead of the current hardcoded `index, follow`. This is the mechanism Phase 5 uses for hidden pages.
3. Remove `<meta name="revisit-after" ...>` (dead standard, no engine reads it).

---

## Phase 1 — Theme foundation

All changes in this phase are in `src/app.html`, `src/lib/styles/global.css`, and `/static/fonts/`.

### 1a. Kill the random theme picker

Delete the inline `<script>` in `src/app.html` that picks a random theme and sets `--primary-color` / `--primary-light` / `--primary-lighter` on every visit. The accent is now fixed (below).

Optional (only if trivially easy): keep the theme array in a small module and wire it to a dice icon in the Footer that re-rolls the accent as an easter egg, defaulting to amber on every load. If it takes more than 30 minutes, skip it.

### 1b. New design tokens

Replace the `:root` block (~line 636 of global.css) with:

```css
:root {
  /* Surfaces */
  --bg-0: #0B0E14;        /* page background */
  --bg-1: #11151E;        /* raised cards */
  --bg-2: #171C27;        /* hover / inner wells */

  /* Text */
  --text-1: #E8EAF0;      /* primary */
  --text-2: #9AA3B5;      /* secondary */
  --text-3: #5C6577;      /* muted / labels */

  /* Accent — fixed. Do not reintroduce theme switching. */
  --accent: #EF9F27;       /* primary amber */
  --accent-bright: #FAC775;/* hover / highlights */
  --accent-dim: #BA7517;   /* borders, subdued accent text */

  /* Lines */
  --border: rgba(232, 234, 240, 0.08);
  --border-strong: rgba(232, 234, 240, 0.16);

  /* Type */
  --font-display: 'Space Grotesk', 'Inter', sans-serif;
  --font-body: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', 'Courier New', monospace;

  /* Shape & rhythm */
  --radius: 10px;
  --radius-lg: 14px;
  --space-section: clamp(4rem, 10vh, 7rem);
}
```

Because `--font-display` is already referenced throughout global.css, changing the variable value cascades to most headings for free. Then grep for any hardcoded `'TR2N'`, `Orbitron`, hex colors from the old themes, and `rgba(0, 0, 0, 0.87)` overlay values and migrate them to tokens.

### 1c. Fonts

- Self-host **Space Grotesk** (500, 700) and **JetBrains Mono** (400) as woff2 in `/static/fonts/`, with `@font-face` + `font-display: swap`. Keep Inter from its current source.
- Delete `/static/fonts/Tr2n.ttf` and its `@font-face` block.

### 1d. Background & glow removal

- `body`: solid `var(--bg-0)`. Delete the `background-image` (linear-gradient + `artemis-bg.jpg`), `background-attachment: fixed`, and both mobile/reduced-motion overrides that existed only to patch it. Delete the image from `/static/images/` if nothing else references it.
- Optional texture, max 20 lines: a single CSS `radial-gradient` glow (amber at ~3% opacity, top center) OR a sparse static starfield via two `background-image: radial-gradient()` dot layers. Static only — no animation. If it looks busy, ship solid.
- Grep for every multi-layer `box-shadow` that produces the neon glow (the `0 0 5px / 0 0 25px` patterns) and replace with either `border: 1px solid var(--border-strong)` or a single soft shadow `0 2px 8px rgba(0,0,0,0.4)`.
- Buttons: `.primary-button` = amber fill (`var(--accent)`, text `#14100A`, darkens to `--accent-dim` on hover). `.secondary-button` = transparent, 1px `var(--border-strong)`, text `var(--text-1)`, border brightens on hover. No gradients, no glow.

### Phase 1 acceptance

- [ ] No visit-to-visit color change; accent is amber everywhere.
- [ ] `grep -ri "tr2n\|artemis" src static` returns nothing.
- [ ] Every page still renders legibly (hidden ones included) — this phase intentionally restyles them all via the cascade.

---

## Phase 2 — Header, Hero, About, Footer, Contact

### Header
- Logo: `DADDOO_DEV` in `--font-mono`, letter-spaced, with the underscore in `var(--accent)`.
- Nav items: Work, Tools, Lab, About, Contact (anchors to the restructured homepage sections; "Lab" links to `/clocks` until a Lab section exists). Remove "QR Generator" from the nav — it moves under Lab.
- Keep the existing mobile menu logic; restyle only.

### Hero (`Hero.svelte`) — full copy replacement
```
[mono, --accent, small]  SHAWN McPEEK · COLORADO
[display, large]         I ship cross-platform apps that are live on both stores.
[body, --text-2]         Flutter and SvelteKit developer. Three production apps on
                         iOS and Android, four published VS Code extensions, and a
                         habit of finishing what I start.
[proof row, mono, --text-3]  App Store · Google Play · VS Code Marketplace
                             (each linking to the respective store/publisher page)
```
Buttons: "View work" (primary, → #projects) and "Get in touch" (secondary, → #contact). Delete the old subtitle/description copy entirely.

### About (`About.svelte`) — gut and rebuild
- Delete the three-column nested `<ul>` skill lists (including the IDE sub-list).
- Replace with: 3 sentences of narrative (solo developer; ships end-to-end from design to store submission; Flutter + SvelteKit + TypeScript with Supabase/Firebase backends), then ONE row of small bordered chips: `Flutter` `SvelteKit` `TypeScript` `Supabase` `Firebase` `Unity`.
- **Keep** the `getYearsOfExperience()` function and weave the number into the narrative sentence.

### Contact & Footer
- Restyle to tokens. Footer gains two mono links: `TEXT MODE` (placeholder `<a>` for the terminal spec — render it now, wire it later) and the theme-dice easter egg if 1a-optional was built.
- Footer must NOT link any hidden route (see Phase 5).

---

## Phase 3 — Projects restructure

Rework `Projects.svelte` (the `Project` interface and array stay in place; presentation changes).

### Three tiers

1. **Featured — "Work"**: exactly the three entries with `featured: true` → set it on **Ridewealth Assistant, Conclavium, and Twisted Fortunes**. Render as a 3-up row (stacking to 1-col on mobile) of large cards: screenshot area on top (use existing images; a simple rounded container is fine, no device-frame art required), title, one-line description (trim the current long ones to ≤120 chars for card display), status badge ("Live on both stores" style), tech chips, store badges via the existing `StoreBadges` component, and link.
2. **Developer tools strip — "Tools"**: the four VS Code extensions (Zivora, NotchList, AddASaint, SecretKeeper) as compact cards: icon, name, one-liner, marketplace link (+ Open VSX where present). Grid `repeat(auto-fit, minmax(200px, 1fr))`.
3. **Lab**: everything else (Stock Market Game, Pandalerium, Simpsons quotes, ChronoCluster, TopMath, New Horizons, 303-Vinyl, Otto & Furiends, QR generator). Render as a single full-width strip or compact list — deliberately smaller than the tiers above. Add a `category: 'Lab'`-style flag or a `tier: 'featured' | 'tool' | 'lab'` field to the interface and drive rendering from it. Intro line: "Experiments, gifts, and small tools. Built for fun, kept because they work."

Keep the existing filter logic only if it survives the restructure cleanly; otherwise delete it — three visible tiers replace the need for filter pills.

Section headers throughout use the mono-label style: `FEATURED WORK`, `DEVELOPER TOOLS`, `THE LAB` in `--font-mono`, `--text-3`, letter-spaced, small.

---

## Phase 4 — Telemetry bar

New component `src/lib/components/TelemetryBar.svelte`, rendered site-wide from `+layout.svelte` directly under the Header (thin strip, mono font, `--text-3` with `--accent-dim` labels, borders top/bottom).

### Data (left to right)
| Item | Source | Staleness risk |
|---|---|---|
| `ISS 41.2°N 103.7°W` | Reuse the existing ISS logic in `src/lib/clocks/` / `ISSClock.svelte` — do not reimplement | None (computed) |
| `DEC 4.71.83` | Existing decimal-time util | None |
| `MST 14:32:07` | `Intl.DateTimeFormat`, `America/Denver` | None |
| `COMMITS/30D 48 · 6 REPOS` | GitHub API, see below | Low |
| `● 3 apps in production` | Static string | None |

**Deliberately excluded:** "last deploy" or anything scoped to this repo — the portfolio updates sporadically and must never advertise its own staleness. Only cross-repo or computed values.

### GitHub activity fetch
- Client-side fetch of `https://api.github.com/users/shawnmcpeek/events/public` (and optionally the same for the `Daddoo-Dev` org's repos), counting `PushEvent` commits in the last 30 days and distinct repos. Unauthenticated limit is 60 req/hr per IP — fine for this traffic.
- Cache the result in `sessionStorage` for the session.
- **Failure mode:** if the fetch fails or returns zero, hide the commits item entirely. Never render `0 commits` or an error.
- Clock items tick via one shared `setInterval(1000)`; clear it in `onDestroy`.

### Behavior
- On viewports < 640px show only MST + the production-apps item.
- `prefers-reduced-motion` does not apply (numbers changing once per second is content, not decoration) — but no transition animations on updates.
- The bar renders on every route, hidden pages included.

---

## Phase 5 — Subpage sweep (public AND hidden)

Goal: every route looks like it belongs to the new site. Work route by route; most of the restyle already cascaded from Phase 1 tokens — this phase is cleanup of page-local styles.

### Public pages
- `/clocks`: restyle clock cards to token surfaces (`--bg-1`, `--border`, `--radius-lg`). The chrono grid tweaks near the bottom of global.css likely need updating.
- `/qr-generator`: token-align form controls and preview card.
- `/twistedfortunes` (439-line page): migrate any page-local colors/fonts to tokens; keep its content and store links intact.
- `/privacy`, `/terms`: typography pass only (readable measure ~70ch, `--text-2` body). Do not edit legal content.

### Hidden pages — restyle but keep unlisted
Applies to `/marketminder`, `/marketminder/login`, `/honorguard`, `/honorguard/preview`, `/analytics/conclavium`, `/analytics/knights-management`.

**Restyle:**
- `src/lib/styles/honorguard.css` (323 lines): migrate its palette/fonts to the new tokens. The honorguard sign-in form and its generated sheet preview should look native to the new theme. Do NOT change `honorguardPdf*` output formatting — the printed/exported sheet is a real-world artifact with its own requirements; only the on-screen UI changes.
- MarketMinder components (`PortfolioCard`, `WatchlistCard`, `DiscoveryPanel`) and the login page: token-align. Do not touch auth logic, Firebase calls, or data code — styling only.
- Analytics pages: token-align tables/charts styling only.

**Visibility rules (the "hidden but glowed-up" contract):**
1. Each hidden route's page passes `noindex={true}` to the `SEO` component (from Phase 0), or adds its own `<svelte:head><meta name="robots" content="noindex, nofollow" /></svelte:head>` if it doesn't use SEO.svelte.
2. No Header, Footer, Projects, or Lab entry may link to any hidden route. Add a Playwright test asserting none of these hrefs appear in the homepage DOM.
3. If a sitemap is ever generated, hidden routes are excluded. **Do not add `Disallow` lines for them to robots.txt** — a robots.txt entry publicly advertises the path. `noindex` meta is the correct mechanism.
4. Direct URLs keep working exactly as today; MarketMinder's existing auth gate is unchanged and remains the real access control.

---

## Global acceptance criteria

- [ ] Lighthouse (mobile, homepage): Performance ≥ 90, Accessibility ≥ 95. The photo-background removal and font swap should make this comfortable.
- [ ] All text passes WCAG AA against its surface (`--text-2` on `--bg-0` and `--bg-1` in particular).
- [ ] `grep -ri "dadddodev" src static` → nothing (Phase 0).
- [ ] Homepage shows exactly 3 featured cards, 4 tool cards, and a Lab strip.
- [ ] Telemetry bar renders on `/`, `/clocks`, and `/marketminder`; with network blocked, it renders without the commits item and without errors.
- [ ] Every hidden route serves a `noindex, nofollow` robots meta; every public route serves `index, follow`.
- [ ] No homepage DOM link to `/marketminder`, `/honorguard`, or `/analytics/*` (Playwright).
- [ ] Existing e2e suite passes; hidden-page functionality (honorguard sheet generation, marketminder login flow) is manually verified unchanged.

## Out of scope — do not build in this spec

- The BBS terminal (separate spec; only the footer `TEXT MODE` placeholder link is created here).
- Case-study pages, ship log, live store-rating fetches (future phases).
- Any change to `/api/*` endpoints, Firebase functions, auth logic, or legal page content.
- Light mode.
