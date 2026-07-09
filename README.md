# Typecast

<p align="center">
  <strong>Images to binary, ASCII and character art</strong><br />
  Local browser converter. Zoom stage. Export HD to 8K.
</p>

<p align="center">
  <a href="https://typecast2.vercel.app"><img src="https://img.shields.io/badge/live-demo-000?style=flat&logo=vercel&logoColor=white" alt="Live demo" /></a>
  <a href="https://github.com/wiktorekdev/typecast/stargazers"><img src="https://img.shields.io/github/stars/wiktorekdev/typecast?style=flat&logo=github" alt="Stars" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/github/license/wiktorekdev/typecast?style=flat" alt="License" /></a>
  <img src="https://img.shields.io/badge/privacy-local--only-111?style=flat" alt="Privacy" />
</p>

<p align="center">
  <a href="https://typecast2.vercel.app"><strong>Open app</strong></a>
  ·
  <a href="#features">Features</a>
  ·
  <a href="#stack">Stack</a>
  ·
  <a href="#develop">Develop</a>
  ·
  <a href="#deploy">Deploy</a>
  ·
  <a href="https://ko-fi.com/wiktorekdev">Ko-fi</a>
</p>

---

Drop a photo. Pick a charset. Export a high-res character render.

Everything runs in your browser. Nothing is uploaded.

## Features

- **Stage-first UI** with floating bar for zoom, pan, replace and export
- **Scroll zoom and drag pan** (fit is 100%; smooth when zoomed out)
- **Charsets:** binary `01`, digits, hex, density ASCII, blocks `░▒▓█`, matrix カナ, custom
- **Color modes:** tinted, tinted raw, full color, B&W, inverted, neon
- **Export panel:** PNG / JPEG / WebP at **HD · 2K · 4K · 8K**
- **Web Worker** render path for heavy jobs
- **i18n:** EN · PL · DE · ES · FR · UK (instant switch, saved locally)
- **Privacy-first:** pixels never leave the device

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
bun run build
bun run preview
```

## Deploy

Live: **[typecast2.vercel.app](https://typecast2.vercel.app)**

Push to `main` deploys on Vercel automatically.

```bash
npx vercel --prod
```

## How it works

1. Sample the image into a character grid (`columns` × aspect)
2. Map luminance to density or charset choice
3. Draw glyphs on a high-res canvas (integer pixel centers)
4. Preview uses a screen-sized render; export re-renders at HD–8K on demand

```
Image → sample grid → luminance → chars → canvas → PNG / JPEG / WebP
              ↑                      ↑
         columns / font        color mode / tint
```

## Privacy

Conversion is **100% local**. No upload API. No account required.

## Support

If Typecast is useful, you can fuel more of it on [Ko-fi](https://ko-fi.com/wiktorekdev).

## Contributing

Issues and PRs welcome. Keep the core local-only (no server-side image pipeline).

## License

MIT © [wiktorekdev](https://github.com/wiktorekdev)
