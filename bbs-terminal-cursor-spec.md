# Build Spec: "Daddoo Dev BBS" Terminal Easter Egg

Feed this document to Cursor as the task description. Work through it top to bottom. Phases 1–3 are the core deliverable; Phase 4 (guestbook) can be a separate session.

---

## Context (read first)

This is an existing SvelteKit + TypeScript site (daddoodev.pro), deployed to Firebase Hosting, with Firestore already configured (`firestore.rules` at repo root) and a `functions/` directory. Styling is plain global CSS at `src/lib/styles/global.css` — **no Tailwind on the main site**. Components live in `src/lib/components/`.

**Do not** add heavy dependencies. No xterm.js, no terminal libraries, no CSS frameworks. This is a self-contained Svelte component with a keypress handler. Total new JS should be small and lazy-loaded.

---

## Concept

A retro dial-up BBS terminal overlay. Visitor presses `~` anywhere on the site (or clicks a "TEXT MODE" link in the footer, or visits `/bbs`) and the screen is taken over by a full-viewport amber-phosphor terminal that emulates logging into "DADDOO DEV BBS". It has a short fake modem boot sequence, a `guest` login, and a small command set for exploring the site. `exit` or `Escape` returns to the normal site.

Tone: affectionate early-computing nostalgia, lightly self-aware. Think 1993 single-node hobbyist BBS, not Hollywood hacker.

---

## Phase 1 — Component scaffold & activation

### Files to create

```
src/lib/components/terminal/
  Terminal.svelte        # overlay, screen, input handling, render loop
  commands.ts            # command registry (pure functions, unit-testable)
  bootSequence.ts        # boot/login script lines with timing
  terminalStore.ts       # writable store: { open: boolean }
```

### Activation rules

1. Global `keydown` listener (added in `+layout.svelte`): backtick/tilde key (`` ` `` or `~`) opens the terminal — **but never when focus is inside an `input`, `textarea`, `select`, or `[contenteditable]`**. Check `event.target` before acting.
2. Footer link labeled `TEXT MODE` (styled in mono font) sets the store to open. This is the discoverable path and the only path on touch devices.
3. Route `src/routes/bbs/+page.svelte` that opens the terminal on mount, so the experience is directly shareable/linkable. Closing the terminal from this route navigates to `/`.
4. `Escape` closes from anywhere inside the terminal. The `exit` command also closes it.
5. **Lazy-load**: `Terminal.svelte` must be dynamically imported on first activation (`const { default: Terminal } = await import(...)`). Zero cost for visitors who never trigger it.

### Overlay behavior

- Full viewport: `position: fixed; inset: 0; z-index` above the header.
- Lock body scroll while open (`overflow: hidden` on `body`, restored on close).
- Clicking anywhere inside the terminal focuses the (visually hidden) input so the keyboard works — this is also what raises the soft keyboard on mobile.

---

## Phase 2 — Visual design

All terminal styles are scoped inside `Terminal.svelte` (Svelte scoped styles), not global.css, except CSS custom properties which may go in `:root`.

### Palette (fixed, no theme switching inside the terminal)

```css
--bbs-bg:      #14100A;   /* near-black warm brown */
--bbs-amber:   #EF9F27;   /* primary phosphor text */
--bbs-bright:  #FAC775;   /* highlighted/output text */
--bbs-dim:     #BA7517;   /* system/secondary text */
--bbs-error:   #E24B4A;   /* error lines only */
```

### Type & texture

- Font: `'JetBrains Mono', 'Courier New', monospace`. If JetBrains Mono is not already loaded on the site, self-host the woff2 in `/static/fonts/` (regular weight only) rather than adding a Google Fonts request.
- Font size 15px desktop / 14px mobile, line-height 1.6, max content width ~80ch centered, padding 24px.
- Block cursor: an inline element sized to one character cell, background `--bbs-amber`, blinking via CSS `@keyframes` at ~530ms steps. Use `steps(1)` so it snaps, not fades.
- Optional CRT flavor, kept subtle: a repeating-linear-gradient scanline overlay at ≤4% opacity and a faint text-shadow glow (`0 0 4px rgba(239,159,39,0.35)`). **Both must be disabled under `@media (prefers-reduced-motion: reduce)`**, and there must be no flicker animation at all — flicker effects are a migraine/photosensitivity risk. When in doubt, less texture.

### Layout

- Output area: scrollable history (newest at bottom, auto-scroll on new lines).
- Prompt line pinned at the bottom: `guest@daddoodev:~$ ` followed by typed text and the block cursor.
- The real `<input>` is visually hidden (offscreen, not `display:none`) and always focused while the terminal is open; typed characters mirror into the visible prompt line. This keeps IME/mobile keyboards working without styling a real input.

---

## Phase 3 — Boot sequence & command set

### Boot sequence (bootSequence.ts)

Lines appear with staggered delays (120–400ms), typewriter effect optional but keep total boot under ~4 seconds. **Any keypress skips instantly to the ready prompt.** Under `prefers-reduced-motion`, print everything at once.

```
CONNECTING 2400 BAUD ........ CONNECT
(simulated — mercifully)

 ██████  ██████  ██████
 DADDOO DEV BBS · node 1 of 1 · est. 2024
 SysOp: Shawn McPeek · Colorado

login: guest
password: ********
Last caller: [random handle from a small fun list]
You are caller #[persisted count, see note]

Type HELP for commands.
guest@daddoodev:~$
```

Caller count: keep it honest-ish — store a counter doc in Firestore incremented on boot (fire-and-forget, no await blocking the UI), fall back to a static number if offline. If Phase 4 is skipped, just omit the caller line.

### Commands (commands.ts)

Case-insensitive. Unknown input → `command not found: X — type HELP`. Each command is a pure function returning an array of output lines (string + optional color class), so the registry is unit-testable without the DOM.

| Command | Behavior |
|---|---|
| `help` | List all commands with one-line descriptions. |
| `ls` or `ls projects` | Directory-style listing: `ridewealth/  conclavium/  twistedfortunes/  extensions/  lab/` plus one-liners. |
| `open <name>` | Navigates: `open ridewealth` → external marketing site; `open conclavium` → conclavium.app; `open twistedfortunes` → the `/twistedfortunes` route (already exists in `src/routes/`); `open extensions` → closes terminal and scrolls to the tools section; `open lab` → `/clocks`. Use `goto` for internal, `window.open` for external. |
| `about` | 3–4 lines: who Shawn is, stack, "3 apps in production, 4 extensions published." |
| `contact` | Prints email + GitHub, as selectable text. |
| `clocks` | Prints the current time in standard, decimal, and Hobbit-meal formats — **reuse the existing utils in `src/lib/clocks/`**, do not reimplement. |
| `guestbook` | Phase 4. Until then: `guestbook offline — check back soon`. |
| `sign <handle> <message>` | Phase 4. |
| `whoami` | `guest — but you can leave a name in the guestbook` |
| `clear` | Clears output history. |
| `exit` | Closes terminal (navigates home if on `/bbs`). |

### Easter eggs (cheap, high-delight)

- `sudo <anything>` → `guest is not in the sudoers file. This incident will be reported to the SysOp.`
- `dir` → `This is a respectable UNIX-flavored board. But fine: [ls output]`
- `pray` → prints a random saint invocation (mirrors the AddASaint extension — pull 5–6 invocations into a const array).

---

## Phase 4 — Firestore guestbook

### Data model

Collection `guestbook`, documents:

```ts
{
  handle: string,      // 2–24 chars, trimmed
  message: string,     // 1–140 chars, trimmed
  createdAt: Timestamp // serverTimestamp()
}
```

### Commands

- `guestbook` → fetch latest 10 ordered by `createdAt desc`, render as:
  `[06/29] CoolHandle: message text`
- `sign <handle> <message>` → validate lengths client-side, write doc, print `Entry saved. Thanks for calling!` On failure print a dim error line, never a raw exception.

### Security rules (append to firestore.rules)

```
match /guestbook/{entry} {
  allow read: if true;
  allow create: if request.resource.data.keys().hasOnly(['handle','message','createdAt'])
    && request.resource.data.handle is string
    && request.resource.data.handle.size() >= 2
    && request.resource.data.handle.size() <= 24
    && request.resource.data.message is string
    && request.resource.data.message.size() >= 1
    && request.resource.data.message.size() <= 140
    && request.resource.data.createdAt == request.time;
  allow update, delete: if false;
}
```

### Spam mitigation (keep it proportionate)

- Client-side cooldown: one `sign` per 5 minutes, tracked in `localStorage` (`bbs_last_sign`). Attempting sooner prints `The SysOp asks you to slow down, caller.`
- Strip anything matching a URL pattern from messages (BBS guestbooks don't need links).
- That's enough for launch. If it ever attracts abuse, add Firebase App Check or route writes through a callable function — note this in a code comment, don't build it now.

---

## Accessibility requirements (non-negotiable)

1. Terminal overlay has `role="dialog"` `aria-modal="true"` `aria-label="Daddoo Dev BBS terminal"`.
2. Focus is trapped inside while open; focus returns to the triggering element on close.
3. Output region is `aria-live="polite"` so screen readers announce command results.
4. `Escape` always exits.
5. `prefers-reduced-motion: reduce` → no typewriter, no scanlines, no glow animation, instant boot.
6. Contrast: `--bbs-amber` on `--bbs-bg` passes WCAG AA for the given sizes; do not dim body text below `--bbs-amber`. `--bbs-dim` is for decorative/system lines only.

---

## Acceptance criteria (write these as Playwright tests in e2e/)

- [ ] Pressing `~` on the homepage opens the terminal; pressing `~` while focused in the contact form does NOT.
- [ ] `Escape` closes it and focus returns to the page.
- [ ] Visiting `/bbs` boots the terminal directly.
- [ ] Any keypress during boot skips to the prompt.
- [ ] `help`, `ls`, `whoami`, `clear`, `exit` behave per spec.
- [ ] `open conclavium` opens conclavium.app in a new tab.
- [ ] Unknown command prints the error line and does not throw.
- [ ] `sudo make me a sandwich` prints the sudoers joke.
- [ ] With reduced motion emulated, boot renders instantly and no scanline overlay exists.
- [ ] Lighthouse: the terminal bundle is not in the initial page load (verify via network tab — it loads only on activation).
- [ ] (Phase 4) `sign` writes a doc that appears in `guestbook`; a second `sign` within the cooldown is refused client-side; a malformed write is rejected by rules (test with the emulator).

## Out of scope — do not build

- No sound effects (modem audio autoplay is hostile; skip it).
- No user accounts, no auth, no admin UI.
- No ANSI art library or terminal emulation framework.
- No theming/color options inside the terminal.
- Do not modify the existing site theme, header, or Projects component in this task.
