# Daddoo Dev Portfolio & QR Code Generator

A modern, themed SvelteKit site featuring a personal portfolio and a fully client-side QR code generator with logo support. Deployed with Firebase Hosting.

---

## Features

- **Personal Portfolio**
  - Home, About, Projects, and Contact sections
  - Responsive, modern design with custom theming and background
  - Navigation bar with smooth scrolling and section links

- **QR Code Generator**
  - Generate QR codes for any website URL instantly
  - Optionally upload a logo/image to embed in the center of the QR code (SVG)
  - Download the QR code as SVG or right-click to save
  - No sign-up or authentication required

---

## Tech Stack

- [SvelteKit](https://kit.svelte.dev/) (with Vite)
- TypeScript
- [qrcode-svg](https://www.npmjs.com/package/qrcode-svg) (SVG QR code generation)
- [Firebase Hosting](https://firebase.google.com/docs/hosting) (static deployment)
- Custom CSS theming

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Development

Start the development server:

```bash
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Build for Production

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

---

## QR Code Generator Usage

- Navigate to `/qr-generator` or use the "QR Generator" link in the navbar.
- Enter a website URL.
- (Optional) Click "Add Logo to QR Code" and upload an image (max 2MB, JPG/PNG/GIF).
- Click "Generate QR Code".
- Download the SVG or right-click to save.

**Note:** The logo is overlaid in the center of the QR code. For best results, use a small, square, transparent image and test the QR code with multiple scanners.

---

## Deployment

This project is configured for static deployment with Firebase Hosting.

### Build and Deploy

```bash
npm run build
firebase deploy
```

- The production build outputs to the `build` directory.
- Hosting is configured in `firebase.json` to serve from `build` and use SPA fallback.

---

## Project Structure

```
src/
  lib/components/    # Svelte components (Header, About, Projects, Contact, etc.)
  lib/styles/        # Global CSS and theming
  routes/            # SvelteKit routes (main page, qr-generator, etc.)
  types/             # TypeScript type declarations
static/              # Static assets (images, favicon, etc.)
```

---

## Scripts

- `npm run dev` – Start dev server
- `npm run build` – Build for production
- `npm run preview` – Preview production build
- `npm run check` – Type check and lint
- `npm run lint` – Lint code
- `npm run format` – Format code with Prettier
- `npm run test` – Run end-to-end tests (Playwright)

---

## License

MIT (or your preferred license)
