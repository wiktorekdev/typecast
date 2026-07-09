# Typecast

**Turn any image into high-res type art.**  
Drop a photo, tweak characters and color, export HD → 8K PNG, JPEG, or WebP.

<p align="center">
  <a href="#features">Features</a>
  ·
  <a href="#stack">Stack</a>
  ·
  <a href="#develop">Develop</a>
  ·
  <a href="#deploy">Deploy</a>
</p>

---

## Features

- **Stage-first UI** — full preview, floating bar (zoom, pan, export)
- **Scroll zoom / drag pan** — fit = 100%, clean scaling when zoomed out
- **Charsets** — binary, digits, hex, standard density, blocks, matrix, custom
- **Color modes** — tinted, colored, B&W, inverted, neon
- **Export** — floating panel with **HD / 2K / 4K / 8K** and PNG · JPEG · WebP
- **Worker render** — heavy conversion off the main thread when possible
- **Local only** — image never leaves your browser

## Stack

| Layer | Choice |
|--------|--------|
| UI | React 18, Vite 6, Tailwind 4 |
| Components | Base UI / shadcn-style primitives |
| Icons | Phosphor |
| Render | Canvas + optional Web Worker |

## Develop

Requires [Bun](https://bun.sh) (or Node 20+).

```bash
bun install
bun run dev
```

```bash
bun run build
bun run preview
```

## Deploy

This app is a static SPA. **Vercel** (recommended):

```bash
npx vercel
```

Or connect the GitHub repo in the Vercel dashboard — zero config needed for Vite.

## How it works

1. Image is sampled to a character grid (columns × aspect)
2. Luminance drives density / charset choice
3. Glyphs are drawn on a high-res canvas (integer pixel centers)
4. Preview uses a screen-sized render; export targets HD–8K on demand

## Privacy

Everything runs **in your browser**. No upload API, no account.

## License

MIT © [wiktorekdev](https://github.com/wiktorekdev)
