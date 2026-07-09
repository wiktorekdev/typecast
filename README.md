# Typecast

<p align="center">
  <strong>Images → binary, ASCII &amp; character art</strong><br />
  Local browser converter · zoom stage · export HD–8K
</p>

<p align="center">
  <a href="https://typecast2.vercel.app"><strong>Live demo</strong></a>
  ·
  <a href="https://github.com/wiktorekdev/typecast">GitHub</a>
</p>

<p align="center">
  <a href="https://typecast2.vercel.app"><img src="https://img.shields.io/badge/demo-typecast2.vercel.app-000?style=for-the-badge&logo=vercel&logoColor=white" alt="Live demo" /></a>
</p>

<p align="center">
  <a href="https://github.com/wiktorekdev/typecast/stargazers"><img src="https://img.shields.io/github/stars/wiktorekdev/typecast?style=flat&logo=github&color=yellow" alt="Stars" /></a>
  <a href="https://github.com/wiktorekdev/typecast/network/members"><img src="https://img.shields.io/github/forks/wiktorekdev/typecast?style=flat&logo=github&color=blue" alt="Forks" /></a>
  <a href="https://github.com/wiktorekdev/typecast/issues"><img src="https://img.shields.io/github/issues/wiktorekdev/typecast?style=flat&color=orange" alt="Issues" /></a>
  <a href="https://github.com/wiktorekdev/typecast/pulls"><img src="https://img.shields.io/github/issues-pr/wiktorekdev/typecast?style=flat&color=blueviolet" alt="PRs" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/github/license/wiktorekdev/typecast?style=flat&color=green" alt="License" /></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Vite-6-646CFF?style=flat&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind-4-38BDF8?style=flat&logo=tailwindcss&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Bun-ready-000?style=flat&logo=bun&logoColor=white" alt="Bun" />
  <img src="https://img.shields.io/badge/Web_Worker-yes-0A0A0A?style=flat" alt="Worker" />
  <img src="https://img.shields.io/badge/privacy-100%25%20local-111?style=flat" alt="Privacy" />
  <img src="https://img.shields.io/badge/platform-browser-informational?style=flat" alt="Platform" />
  <img src="https://img.shields.io/github/last-commit/wiktorekdev/typecast?style=flat" alt="Last commit" />
  <img src="https://img.shields.io/github/languages/top/wiktorekdev/typecast?style=flat" alt="Language" />
  <img src="https://img.shields.io/github/repo-size/wiktorekdev/typecast?style=flat" alt="Repo size" />
</p>

---

## At a glance

| | |
|:--|:--|
| **What** | Image → character grid (binary, ASCII, blocks, matrix, custom) |
| **Where** | Fully in-browser — no uploads |
| **Export** | PNG · JPEG · WebP at HD / 2K / 4K / 8K |
| **Input** | PNG, JPG, WEBP, GIF (drop, paste, file picker) |
| **Charsets** | 6 built-in + custom string |
| **Color** | Tinted, colored, B&W, inverted, neon |
| **UX** | Stage, scroll-zoom, pan, floating bar |
| **Perf** | Canvas renderer + optional Web Worker |

### Numbers

| Metric | Value |
|--------|------:|
| Charsets (built-in) | **6** + custom |
| Color modes | **6** |
| Export formats | **3** (PNG / JPEG / WebP) |
| Export size presets | **4** (HD · 2K · 4K · 8K) |
| Column range | **60 – 400** |
| Font size range | **4 – 20 px** |
| Contrast range | **0.5× – 3×** |
| Zoom (view) | **~15% – 800%** of fit |
| Max export scale factor | up to **~16×** base grid |
| Cloud processing | **0** |

---

## Features

- **Stage-first UI** — large preview, floating control bar (zoom · pan · export)
- **Scroll zoom / drag pan** — fit = 100%; clean scaling when zoomed out
- **Charsets** — binary `01`, digits, hex, density ASCII, block `░▒▓█`, matrix カナ, custom
- **Color modes** — tinted, tinted raw, full color, B&W, inverted, neon
- **Export panel** — format + size presets with live pixel dimensions
- **Worker render** — heavy jobs off the main thread when the browser allows it
- **Privacy-first** — pixels never leave the device

## Stack

| Layer | Choice |
|--------|--------|
| UI | React 18, Vite 6, Tailwind CSS 4 |
| Components | Base UI / shadcn-style primitives |
| Icons | Phosphor |
| Render | Canvas 2D + optional Web Worker |
| Deploy | Vercel (static SPA) |

## Develop

Requires [Bun](https://bun.sh) (or Node 20+).

```bash
bun install
bun run dev
```

```bash
bun run build   # → dist/
bun run preview
```

## Deploy

Live: **[typecast2.vercel.app](https://typecast2.vercel.app)**

Connected to this repo — push to `main` deploys automatically on Vercel.

```bash
npx vercel --prod
```

## How it works

1. Source image is sampled to a character grid (`columns` × aspect)
2. Luminance drives density / charset selection
3. Glyphs are drawn on a high-res canvas (centered on integer pixels)
4. Preview uses a screen-sized render; export re-renders at HD–8K on demand

```
Image  →  sample grid  →  map luminance → chars  →  canvas  →  PNG/JPEG/WebP
                ↑                    ↑
           columns / font      color mode / tint
```

## Privacy

Everything runs **in your browser**. No upload API, no account, no tracking required for conversion.

## Contributing

Issues and PRs welcome. Keep the core **local-only** (no server-side image pipeline).

## License

MIT © [wiktorekdev](https://github.com/wiktorekdev)
