# Daddoo Dev Portfolio

Personal portfolio built with SvelteKit: main site, ChronoCluster (world + alternate clocks), and a client-side QR code generator. Dark theme with a random accent color on each visit.

**[View live →](https://www.daddoodev.pro)**

- Portfolio (Home, About, Projects, Contact)
- ChronoCluster at `/clocks` — world time strip plus Standard, Decimal, ISS, and Hobbit meal clocks
- QR generator at `/qr-generator` — any URL, optional logo, download as SVG

---

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## Tech

SvelteKit, TypeScript, global CSS. QR via [qrcode-svg](https://www.npmjs.com/package/qrcode-svg). Deployed to Firebase Hosting.

**Scripts:** `npm run dev` · `npm run build` · `npm run preview` · `npm run check` · `npm run lint` · `npm run format` · `npm run test` (Playwright)

---

## Project layout

- `src/lib/components/` — Header, Hero, About, Projects, Contact, Footer, clocks
- `src/lib/clocks/` — time utils (decimal, Hobbit meals, world zones, ISS)
- `src/lib/styles/global.css` — theme and layout
- `src/routes/` — `/`, `/clocks`, `/qr-generator`

Build: `npm run build` → `build/`. Deploy: `firebase deploy`.

---

## License

MIT
