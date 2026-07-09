// High-quality ASCII renderer (main thread + worker safe with OffscreenCanvas)

export type CharSetId =
  | "binary"
  | "digits"
  | "hex"
  | "standard"
  | "blocks"
  | "matrix"
  | "custom"

export type ColorModeId =
  | "tinted"
  | "tintedRaw"
  | "colored"
  | "bw"
  | "inverted"
  | "neon"

export type AsciiOptions = {
  cols: number
  charSet: CharSetId | string
  customChars: string
  fontFamily: string
  fontSize: number
  colorMode: ColorModeId | string
  bgColor: string
  fgColor: string
  tintColor: string
  brightness: number
  contrast: number
  saturation: number
  threshold: number
  invert: boolean
  charAspect: number
  scale: number
}

export type AsciiOptionsInput = Partial<AsciiOptions>

export type AsciiSource = HTMLCanvasElement | OffscreenCanvas | ImageBitmap

export type RenderCanvas = HTMLCanvasElement | OffscreenCanvas

export type AsciiCell = {
  ch: string
  r: number
  g: number
  b: number
  adj: number
  rawLum: number
}

export type AsciiGrid = {
  cols: number
  rows: number
  charW: number
  charH: number
  grid: AsciiCell[][]
}

export const CHAR_SETS: Record<CharSetId, { label: string; chars: string }> = {
  binary: { label: "Binary 0/1", chars: "01" },
  digits: { label: "Digits 0-9", chars: "0123456789" },
  hex: { label: "Hex 0-F", chars: "0123456789ABCDEF" },
  standard: {
    label: "Standard",
    chars: " .'`^\",:;Il!i><~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$",
  },
  blocks: { label: "Block ░▒▓█", chars: " ░▒▓█" },
  matrix: {
    label: "Matrix カナ",
    chars: "ｦｧｨｩｪｫｬｭｮｯｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ",
  },
  custom: { label: "Custom…", chars: "" },
}

export const FONTS = [
  { label: "Courier New", value: '"Courier New", monospace' },
  { label: "Space Mono", value: '"Space Mono", monospace' },
  { label: "Consolas", value: '"Consolas", monospace' },
  { label: "Monospace", value: "monospace" },
] as const

export const COLOR_MODES: Record<ColorModeId, { label: string }> = {
  tinted: { label: "Tinted" },
  tintedRaw: { label: "Tinted raw" },
  colored: { label: "Colored" },
  bw: { label: "B&W" },
  inverted: { label: "Inverted" },
  neon: { label: "Neon" },
}

const DENSITY_SETS = new Set<string>(["standard", "blocks"])

function hexToRgb(hex: string) {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return r
    ? { r: parseInt(r[1], 16), g: parseInt(r[2], 16), b: parseInt(r[3], 16) }
    : { r: 255, g: 255, b: 255 }
}

function cellHash(row: number, col: number) {
  let h = Math.imul(row + 1, 73856093) ^ Math.imul(col + 1, 19349663)
  h ^= h >>> 13
  return h >>> 0
}

function createCanvas(w: number, h: number): RenderCanvas {
  if (typeof OffscreenCanvas !== "undefined") {
    try {
      return new OffscreenCanvas(w, h)
    } catch {
      /* fall through */
    }
  }
  if (typeof document !== "undefined") {
    const c = document.createElement("canvas")
    c.width = w
    c.height = h
    return c
  }
  throw new Error("No canvas available")
}

function get2d(canvas: RenderCanvas) {
  const ctx = canvas.getContext("2d", { alpha: false, desynchronized: true }) as
    | CanvasRenderingContext2D
    | OffscreenCanvasRenderingContext2D
    | null
  if (!ctx) throw new Error("2d context unavailable")
  return ctx
}

export function measureOutput(
  sourceW: number,
  sourceH: number,
  options: AsciiOptionsInput
) {
  const {
    cols = 160,
    fontSize = 8,
    charAspect = 0.55,
    scale = 1,
  } = options

  const charW = fontSize * charAspect
  const charH = fontSize * 1.15
  const aspect = sourceH / sourceW
  const rows = Math.max(1, Math.round(cols * aspect * (charW / charH)))
  const outW = Math.ceil(cols * charW * scale)
  const outH = Math.ceil(rows * charH * scale)
  return { cols, rows, charW, charH, outW, outH }
}

export function scaleForTargetWidth(
  sourceW: number,
  sourceH: number,
  options: AsciiOptionsInput,
  targetW: number
) {
  const base = measureOutput(sourceW, sourceH, { ...options, scale: 1 })
  if (base.outW <= 0) return 3
  return Math.min(16, Math.max(0.5, targetW / base.outW))
}

export const MAX_SOURCE_EDGE = 4096

function resolveChars(charSet: string, customChars: string) {
  if (charSet === "custom") return customChars || "01"
  return CHAR_SETS[charSet as CharSetId]?.chars || "01"
}

function pickChar(
  chars: string,
  charSet: string,
  adj: number,
  row: number,
  col: number
) {
  const useDensity = DENSITY_SETS.has(charSet) || charSet === "custom"
  if (useDensity && chars.length > 1) {
    const idx = Math.round(adj * (chars.length - 1))
    return chars[Math.max(0, Math.min(chars.length - 1, idx))]
  }
  if (chars.length === 2) return adj > 0.5 ? chars[1] : chars[0]
  return chars[cellHash(row, col) % chars.length]
}

export function buildAsciiGrid(
  source: AsciiSource,
  options: AsciiOptionsInput = {}
): AsciiGrid {
  const {
    cols = 160,
    charSet = "binary",
    customChars = "",
    fontSize = 8,
    brightness = 0,
    contrast = 1.4,
    threshold = 8,
    invert = false,
    charAspect = 0.55,
  } = options

  const srcW = source.width
  const srcH = source.height
  if (!srcW || !srcH) throw new Error("Invalid source image")

  const chars = resolveChars(charSet, customChars)
  const charW = fontSize * charAspect
  const charH = fontSize * 1.15
  const aspect = srcH / srcW
  const rows = Math.max(1, Math.round(cols * aspect * (charW / charH)))

  const sample = createCanvas(cols, rows)
  const sctx = get2d(sample)
  sctx.imageSmoothingEnabled = true
  sctx.imageSmoothingQuality = "high"
  sctx.drawImage(source as CanvasImageSource, 0, 0, cols, rows)
  const px = sctx.getImageData(0, 0, cols, rows).data

  const thresholdVal = threshold / 100
  const grid: AsciiCell[][] = []

  for (let r = 0; r < rows; r++) {
    const line: AsciiCell[] = []
    for (let c = 0; c < cols; c++) {
      const i = (r * cols + c) * 4
      const R = px[i]
      const G = px[i + 1]
      const B = px[i + 2]

      const rawLum = (0.2126 * R + 0.7152 * G + 0.0722 * B) / 255
      let lum = Math.min(1, Math.max(0, rawLum + brightness / 100))
      let adj = (lum - 0.5) * contrast + 0.5
      adj = Math.min(1, Math.max(0, adj))
      if (invert) adj = 1 - adj

      if (adj < thresholdVal) {
        line.push({ ch: " ", r: R, g: G, b: B, adj, rawLum })
        continue
      }

      const ch = pickChar(chars, charSet, adj, r, c) || " "
      line.push({ ch, r: R, g: G, b: B, adj, rawLum })
    }
    grid.push(line)
  }

  return { cols, rows, charW, charH, grid }
}

export function renderAscii(
  source: AsciiSource,
  options: AsciiOptionsInput = {}
): RenderCanvas {
  const {
    fontFamily = '"Courier New", monospace',
    fontSize = 8,
    colorMode = "bw",
    bgColor = "#000000",
    fgColor = "#ffffff",
    tintColor = "#ffffff",
    saturation = 100,
    scale = 1,
  } = options

  const { cols, rows, charW, charH, grid } = buildAsciiGrid(source, options)

  const outW = Math.ceil(cols * charW * scale)
  const outH = Math.ceil(rows * charH * scale)
  const out = createCanvas(outW, outH)
  const ctx = get2d(out)

  ctx.imageSmoothingEnabled = false
  ctx.fillStyle = bgColor
  ctx.fillRect(0, 0, outW, outH)

  const scaledFontSize = fontSize * scale
  ctx.font = `${scaledFontSize}px ${fontFamily}`
  ctx.textBaseline = "middle"
  ctx.textAlign = "center"

  const tint = hexToRgb(tintColor)
  const cellW = charW * scale
  const cellH = charH * scale
  const sf = saturation / 100

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = grid[r][c]
      if (!cell.ch || cell.ch === " ") continue

      let R = cell.r
      let G = cell.g
      let B = cell.b
      const gray = 0.2126 * R + 0.7152 * G + 0.0722 * B
      R = Math.min(255, Math.max(0, gray + sf * (R - gray)))
      G = Math.min(255, Math.max(0, gray + sf * (G - gray)))
      B = Math.min(255, Math.max(0, gray + sf * (B - gray)))

      const { adj, rawLum } = cell

      switch (colorMode) {
        case "colored":
          ctx.fillStyle = `rgb(${R | 0},${G | 0},${B | 0})`
          break
        case "tinted": {
          const ta = Math.pow(adj, 0.72)
          ctx.fillStyle = `rgb(${(tint.r * ta) | 0},${(tint.g * ta) | 0},${(tint.b * ta) | 0})`
          break
        }
        case "tintedRaw":
          ctx.fillStyle = `rgb(${(tint.r * rawLum) | 0},${(tint.g * rawLum) | 0},${(tint.b * rawLum) | 0})`
          break
        case "inverted":
          ctx.fillStyle = `rgb(${(255 - R) | 0},${(255 - G) | 0},${(255 - B) | 0})`
          break
        case "neon": {
          const h = (adj * 300 + 120) % 360
          ctx.fillStyle = `hsl(${h} 100% ${30 + adj * 55}%)`
          break
        }
        default:
          ctx.fillStyle = fgColor
      }

      const x = Math.round(c * cellW + cellW * 0.5)
      const y = Math.round(r * cellH + cellH * 0.5)
      ctx.fillText(cell.ch, x, y)
    }
  }

  return out
}

export function loadImageToCanvas(file: Blob): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      let w = img.naturalWidth || img.width
      let h = img.naturalHeight || img.height
      const edge = Math.max(w, h)
      if (edge > MAX_SOURCE_EDGE) {
        const s = MAX_SOURCE_EDGE / edge
        w = Math.max(1, Math.round(w * s))
        h = Math.max(1, Math.round(h * s))
      }
      const c = document.createElement("canvas")
      c.width = w
      c.height = h
      const ctx = c.getContext("2d", { alpha: false })
      if (!ctx) {
        URL.revokeObjectURL(url)
        reject(new Error("2d context unavailable"))
        return
      }
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = "high"
      ctx.drawImage(img, 0, 0, w, h)
      URL.revokeObjectURL(url)
      resolve(c)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("Failed to load image"))
    }
    img.src = url
  })
}

export function canvasToBlob(
  canvas: RenderCanvas,
  format = "image/png",
  quality = 0.95
): Promise<Blob> {
  if ("convertToBlob" in canvas && typeof canvas.convertToBlob === "function") {
    return canvas.convertToBlob({ type: format, quality })
  }
  return new Promise((res, rej) => {
    ;(canvas as HTMLCanvasElement).toBlob(
      (b) => (b ? res(b) : rej(new Error("toBlob failed"))),
      format,
      quality
    )
  })
}

export function previewScaleFor(
  sourceW: number,
  sourceH: number,
  options: AsciiOptionsInput
) {
  const targetW = Math.min(1600, Math.max(1100, Math.round(sourceW)))
  return scaleForTargetWidth(sourceW, sourceH, options, targetW)
}
