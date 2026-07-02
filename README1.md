# Handoff: Daddoo Dev — New Homepage ("Orbit" direction)

## Overview
A full redesign of the daddoodev.pro homepage. Single-page scroll: Nav → Hero → About/Skills → Featured Work → More Projects (filterable) → Contact → Footer. Dark, cinematic, "Tron done right": solid readable headings with a single signature accent color used as *light* (glow), not as hollow outline. Replaces the previous random-accent-per-visit behavior with one committed brand color.

## About the Design Files
The file in this bundle — `Daddoo Dev — Homepage.dc.html` — is a **design reference created in HTML**. It is a prototype showing the intended look and behavior. **It is not production code to copy directly.**

Your live site is **SvelteKit + TypeScript** (Firebase Hosting), with components in `src/lib/components/` (Header, Hero, About, Projects, Contact, Footer) and theme in `src/lib/styles/global.css`. The task is to **recreate this design inside that existing structure** — port the visuals into the matching `.svelte` components and CSS, using your established patterns. Do **not** introduce HTML/React; keep everything Svelte.

> The HTML mock uses a small runtime wrapper (a `<div>` whose inline `style` defines CSS variables, and a tiny logic class for the project filter). Ignore the wrapper mechanics — only the **CSS values, layout, copy, and behavior** described below matter.

## Fidelity
**High-fidelity.** Final colors, typography, spacing, and interactions. Recreate pixel-accurately using your existing CSS approach. Exact hex values, font sizes, and spacing are specified throughout.

---

## Design Tokens

### Fonts (Google Fonts)
```
Chakra Petch    — 400, 500, 600, 700   → display / headings / nav / logo
Inter Tight     — 400, 500, 600, 700   → body copy, UI
JetBrains Mono  — 400, 500, 700        → labels, kickers, meta, placeholders
```
Import:
```
https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;500;600;700&family=Inter+Tight:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap
```
This **replaces Orbitron**. Keep Chakra Petch for the logo and all H1/H2; it reads as "tech" without Orbitron's legibility problems. Set headings **solid** — no `-webkit-text-stroke` / outline.

### Colors
| Token | Value | Use |
|---|---|---|
| `--bg` | `#05070d` | page background |
| `--ink` | `#eaf6ff` | primary text / headings |
| `--ink-2` | `#bcccd8` | secondary text (skill items) |
| `--muted` | `#9fb6c6` | body paragraphs |
| `--muted-2` | `#8da3b5` | nav links, captions |
| `--muted-3` | `#6f899b` / `#5b7184` | footer meta, mono captions |
| `--field-bg` | `#0a0f17` | input/textarea background |
| `--field-border` | `#18303c` | input border |
| `--hairline` | `#11212b` | footer dividers |
| `--card-border` | `#13242e` | "more projects" card border |
| `--pill-border` | `#1e3744` | tech-tag pill border |
| `--accent` | `#38e0ff` (default) | **the one signature color** |
| `--accent-ink` | `#04181d` | text/icon on top of accent fills |

### The accent system (important)
The whole theme derives from **one** accent hex. Set it **once** (do not randomize). Everything else is computed from it:
```
--accent      = <chosen hex>                          e.g. #38e0ff
--glow        = rgba(accentR, accentG, accentB, I)    // strong glow, I = intensity (shipped at 1.0 = max)
--glow-soft   = rgba(accentR, accentG, accentB, I*0.5) // soft glow
--glow-faint  = rgba(accentR, accentG, accentB, 0.16) // subtle borders / chip bg / focus ring
```
This maps directly onto your current `--primary-*` variable approach — just commit to a fixed value in `:root` instead of the random theme picker. Candidate brand colors that were designed to work: cyan `#38e0ff` (**chosen**), green `#57e389`, amber `#ffae3b`, magenta `#c779ff`. **Glow intensity `I` ships at `1.0` (max)** — the alpha on `--glow`; keep it a tunable constant.

Svelte sketch:
```svelte
<!-- app.html or +layout -->
<style>
  :root {
    --accent: #38e0ff;
    --glow: rgba(56, 224, 255, 1);
    --glow-soft: rgba(56, 224, 255, 0.28);
    --glow-faint: rgba(56, 224, 255, 0.16);
  }
</style>
```

### Spacing & radius
- Content max-width: **1180px**, side padding **60px** (desktop).
- Section vertical padding: **~96px** (hero is taller: `110px` top / `150px` bottom to sit above the horizon glow).
- Radius: buttons/inputs **11px**, cards **14–18px**, tech pills **6px**, filter chips **999px (pill)**, store-badge buttons **9px**.
- Card grids: 3 columns, gap **24px** (featured) / **20px** (more projects).

---

## Full-bleed background (moon)
A fixed, full-bleed lunar photo sits behind the **entire** page (like the current site's diagonal), with the accent glow catching its edge in the hero — then a scrim keeps all content readable.

- **Image:** the repo's own `art002e009285~large.jpg`. In the HTML mock it's hotlinked from GitHub raw for preview; **in Svelte, import it from your assets** (e.g. `static/` or a Vite import) and set it as the background — do not hotlink in production.
- **Layer 1 (moon):** `position:fixed; inset:0; z-index:0; background:#05070d url(moon) center/cover; background-position:50% 40%;`
- **Layer 2 (scrim):** `position:fixed; inset:0; z-index:0;` with two stacked gradients:
  - vertical: `linear-gradient(180deg, rgba(5,7,13,0.86) 0%, rgba(5,7,13,0.34) 20%, rgba(5,7,13,0.34) 76%, rgba(5,7,13,0.93) 100%)` (darkens under nav + footer, reveals moon mid-page)
  - diagonal: `linear-gradient(118deg, rgba(5,7,13,0.9) 0%, rgba(5,7,13,0.42) 50%, rgba(5,7,13,0.85) 100%)`
- **Content** sits in a `position:relative; z-index:1` wrapper above both layers. Glass cards (`backdrop-filter:blur`) pleasantly blur the moon behind them.
- The hero's own radial cyan glow layers on top of the moon (see Hero below).

## Screens / Views
One page, top to bottom. Content column is centered at max-width 1180px unless noted.

### 1. Nav (`Header.svelte`)
- **Layout:** flex row, space-between, padding `34px 60px`.
- **Left:** `DADDOO DEV` — Chakra Petch 700, 20px, letter-spacing `0.16em`.
- **Right:** links `Home · Work · About · Tools` — Inter Tight 500, 15px, color `--muted-2`, hover → `--ink`. Plus a `Contact` button: 1px border `--glow-faint`, padding `9px 18px`, radius 9px, hover bg `--glow-faint`.
- Anchors scroll to `#home #work #about #tools #contact`.

### 2. Hero (`Hero.svelte`)
- Sits over the full-bleed moon background (see the Background section above); no separate hero image needed.
- **Layout:** centered text, `position:relative; overflow:hidden`, padding `110px 60px 150px`.
- **Horizon glow:** absolutely-positioned div, `width:1500px; height:760px`, centered horizontally, `bottom:-380px`, background `radial-gradient(closest-side, var(--glow), transparent 70%)`, `opacity:0.55`, `pointer-events:none`.
- **Horizon line:** 1px full-width strip at the bottom: `linear-gradient(90deg, transparent, var(--glow), transparent)`.
- **Kicker:** `CROSS-PLATFORM DEVELOPER` — Chakra Petch, 14px, `--accent`, letter-spacing `0.36em`, margin-bottom 30px.
- **H1:** Chakra Petch 600, **74px**, line-height 1.05, max-width 15ch. Text: `I build what users need.` — the word **users** is `color:var(--accent)` with `text-shadow:0 0 30px var(--glow)`.
- **Subline:** Inter Tight, 20px, `--muted`, line-height 1.6, max-width 56ch. Copy: *"I'm Shawn McPeek — I design and ship modern mobile, web and game software with clean code and thoughtful design. From first sketch to the store listing."*
- **CTAs (flex, gap 16px):**
  - Primary `View my work`: bg `--accent`, text `--accent-ink`, 700, padding `16px 28px`, radius 11px, `box-shadow:0 0 34px var(--glow)`, hover `filter:brightness(1.12)`.
  - Secondary `Get in touch`: bg `rgba(255,255,255,0.04)`, text `#cdeefb`, 600, 1px border `--glow-faint`, hover bg `--glow-faint`.
- **Stat line:** JetBrains Mono, 13px, `--muted-3`, letter-spacing `0.08em`, gap 40px: `12 SHIPPED` · `iOS · ANDROID · WEB · VS CODE` · `FIRESTONE, CO` (bold the "12" in `--ink`).

### 3. About / Skills (`About.svelte`)
- Padding `96px 60px`.
- **Kicker:** `ABOUT` (Chakra Petch 13px, `--accent`, ls `0.3em`).
- **Lead statement:** Chakra Petch 500, **32px**, line-height 1.35, max-width 30ch: *"Cross-platform solutions that work seamlessly across mobile and web — with payments built in."*
- **Three columns** (grid `1fr 1fr 1fr`, gap 44px). Each: a mono column-header (JetBrains Mono 12px, `--accent`, ls `0.12em`, 14px bottom padding, 1px bottom border `--glow-faint`), then a vertical list (gap 11px, Inter Tight 16px, `--ink-2`).
  - **MOBILE & WEB:** Flutter (iOS / Android / Web) · Flutter Flame (2D games) · Kotlin Multiplatform · Svelte / SvelteKit · JavaScript / TypeScript · HTML5 / CSS3
  - **BACKEND & SERVICES:** Firebase Authentication · Firebase Database · Supabase · RevenueCat (subscriptions) · Square Integration · E-commerce Solutions
  - **TOOLS & INTERESTS:** Cross-platform Development · Git / GitHub · VS Code · Android Studio · WebStorm · Cursor · Unity Game Development

### 4. Featured Work (`Projects.svelte` — featured block)
- Centered header: kicker `SELECTED WORK` (`--accent`), H2 `Things I've shipped` (Chakra Petch 600, 38px), subline (`--muted-2`, 17px): *"From mobile apps and games to e-commerce — here's a showcase of recent work."*
- **3 equal glass cards** (grid `1fr 1fr 1fr`, gap 24px). **Equal size is deliberate — do not bento these.** Card style: `background:rgba(255,255,255,0.04); backdrop-filter:blur(12px); border:1px solid var(--glow-faint); border-radius:18px; padding:20px; display:flex; flex-direction:column;` hover → `border-color:var(--accent)`.
  - **Icon slot:** height 172px, radius 12px — placeholder is a diagonal stripe pattern; **replace with the real app icon/screenshot**. A `AVAILABLE NOW` badge sits top-right (bg `--accent`, text `--accent-ink`, 11px 700).
  - **Category** (mono 11px `--accent`), **Title** (22px 600), **Description** (14px `--muted-2`, `flex:1` so buttons align across cards).
  - **Tech pills:** 11px, `--muted`, 1px border `--pill-border`, radius 6px, padding `5px 10px`.
  - **CTA row** (flex, gap 9px): outline buttons for stores (`App Store ↗`, `Google Play ↗`) + one filled accent button (`Live ↗` / `Site ↗`). Outline: 1px `--pill-border`, hover `border-color:var(--accent)`. Filled: bg `--accent`, text `--accent-ink`.
  - **Cards & copy:**
    1. **Conclavium** — MOBILE APP — *"Finance & administration for member organizations — dues, volunteer hours, programs, reimbursements and audit-ready reports."* — Flutter · Supabase · iOS · +2 — App Store / Google Play / **Live**.
    2. **Ridewealth Assistant** — MOBILE APP — *"A comprehensive financial tracking app built for rideshare drivers — earnings, expenses and mileage, all in one place."* — Flutter · Firebase · iOS · +2 — App Store / Google Play / **Site**.
    3. **Twisted Fortunes** — GAME — *"A darkly humorous fortune-cookie game. Crack open a cookie and reveal a twisted fortune — with optional ads for extra ones."* — Flame · Android · iOS · +2 — App Store / **Google Play**.

### 5. More Projects (`Projects.svelte` — grid + filter)
- Header row (space-between): H2 `More projects` (Chakra Petch 600, 28px) + **filter chips**.
- **Filter chips** (pill, 14px 600, padding `10px 18px`, radius 999px):
  - Inactive: 1px border `#16323e`, bg `rgba(255,255,255,0.02)`, color `--muted`.
  - Active: 1px border `--accent`, bg `--glow-faint`, color `--accent`.
  - Chips: **All · Extensions · Web Tools**. Clicking filters the grid below.
- **Uniform grid** (3 cols, gap 20px). Card: `background:rgba(255,255,255,0.03); border:1px solid var(--card-border); border-radius:14px; padding:22px; min-height:188px; display:flex; flex-direction:column;` hover → `border-color:var(--accent); background:rgba(255,255,255,0.05)`.
  - Top row (space-between): category (mono 11px `--accent`) + CTA label (mono 11px `--muted-3`).
  - Title (19px 600), description (14px `--muted-2`, `flex:1`), stack line (mono 11px `--muted-3`) at bottom.
- **Items** (all shown; `cat` drives the filter):
  | Name | Category (`cat`) | CTA | Stack | Description |
  |---|---|---|---|---|
  | Zivora | EXTENSION (`extension`) | VS CODE ↗ | TypeScript · Marketplace | Manage Sentry issues right inside your IDE, with AI-powered debugging. |
  | ToDoSync | EXTENSION (`extension`) | VS CODE ↗ | TypeScript · Notion API | Sync your VS Code workspace tasks with Notion projects, automatically. |
  | NotchList | EXTENSION (`extension`) | VS CODE ↗ | TypeScript · Marketplace | *(placeholder — supply real copy)* |
  | SecretKeeper | EXTENSION (`extension`) | OPEN VSX ↗ | TypeScript · Open VSX | *(placeholder — supply real copy)* |
  | ChronoCluster | WEB TOOL (`web`) | OPEN ↗ | SvelteKit · /clocks | World time plus Standard, Decimal, ISS and Hobbit-meal clocks. |
  | QR Generator | WEB TOOL (`web`) | OPEN ↗ | SvelteKit · /qr-generator | Generate a QR for any URL, add an optional logo, export as SVG. |
- **Excluded on purpose:** 303 Vinyl and Otto & Furiends (not progressing to production).

### 6. Contact (`Contact.svelte`)
- `position:relative; overflow:hidden`, content max-width **720px**, centered, padding `96px 60px`.
- **Top glow:** radial `--glow-soft`, `width:1100px; height:560px`, centered, `top:-280px`, opacity 0.5.
- Kicker `GET IN TOUCH` (`--accent`), H2 `Let's build something` (Chakra Petch 600, 38px), subline (`--muted-2`).
- **Form fields are DARK** (this fixes the old stark-white inputs). Each: label (14px 600 `--ink-2`, 9px below) + field:
  ```
  background:#0a0f17; border:1px solid #18303c; border-radius:11px;
  padding:15px 16px; color:#eaf6ff; font-size:15px;
  :focus → border-color:var(--accent); box-shadow:0 0 0 3px var(--glow-faint);
  placeholder color:#5b7184;
  ```
  Fields: **Name** (input), **Email** (input), **Message** (textarea, 5 rows, `resize:vertical`).
- **Submit:** full-width, bg `--accent`, text `--accent-ink`, 700, 16px, padding 17px, radius 11px, `box-shadow:0 0 34px var(--glow)`, hover `brightness(1.12)`. Copy: `Send message`.

### 7. Footer (`Footer.svelte`)
- Top border `--hairline`. Inner grid `1.6fr 1fr 1fr 1fr`, gap 40px, padding 60px.
- **Brand col:** `DADDOO DEV` wordmark — Chakra Petch 700, 20px, ls `0.14em`, **color `--accent`** (previously a mismatched purple — now tied to the accent). Tagline (14px `--muted-3`, max-width 30ch): *"Cross-platform apps, games and developer tools — designed and shipped by Shawn McPeek."*
- **Link columns** (mono 11px header `#5b7184` ls `0.12em`; links 14px `--muted`, hover `--ink`):
  - **APPS & TOOLS:** Conclavium · Ridewealth Assistant · Twisted Fortunes · ChronoCluster · QR Generator
  - **EXTENSIONS:** Zivora · ToDoSync · NotchList · SecretKeeper
  - **COMPANY:** About · Projects · Contact · Privacy
- **Sub-bar** (top border `--hairline`, padding `22px 60px`, mono 12px `--muted-3`, space-between): `© 2026 Daddoo Dev · Firestone, CO` and right-aligned `GitHub · Play Store · App Store` (hover → `--accent`).

---

## Interactions & Behavior
- **Project filter:** chip click sets active category; grid renders `all` or items where `cat === filter`. In Svelte: `let filter = 'all';` + `$: shown = filter === 'all' ? projects : projects.filter(p => p.cat === filter);`
- **Hovers:** cards lift their border to `--accent`; primary buttons use `filter:brightness(1.12)`; outline buttons swap border to `--accent`; nav/footer links go to `--ink`/`--accent`.
- **Focus:** inputs show `--accent` border + 3px `--glow-faint` ring. Keep visible focus for accessibility.
- **Smooth scroll** between sections via in-page anchors (`scroll-behavior:smooth` on `html`).

## State Management
- `filter: 'all' | 'extension' | 'web'` — the only UI state. (Contact form bindings as you already do them; the mock does not wire submission.)

## Responsive Behavior (to add during implementation)
The mock is desktop-width. For the port:
- Collapse all 3-column grids (skills, featured, more projects, footer) to 1 column under ~760px.
- Reduce hero H1 from 74px → ~40px on mobile; section padding 96px → ~56px; side padding 60px → ~24px.
- Nav becomes a hamburger/stacked menu (use your existing Header pattern).

## Assets
- **Moon background:** `art002e009285~large.jpg` (already in the repo root). The mock hotlinks it from GitHub raw for preview; import it properly in the Svelte build.
- App icon slots are diagonal-stripe placeholders — drop in the real app icons/screenshots for Conclavium, Ridewealth Assistant, Twisted Fortunes (and optionally the secondary items).
- **Store badges** are rendered as simple text buttons (`App Store ↗`, `Google Play ↗`) to avoid bundling Apple/Google brand artwork; swap in official badges if you prefer.
- Fonts are loaded from Google Fonts (see import above).

## Files
- `Daddoo Dev — Homepage.dc.html` — the full high-fidelity design reference (open in a browser to interact with the filter, hovers, and theme).
