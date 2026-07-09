import { measureOutput, scaleForTargetWidth } from "./asciiEngine.js"

export const EXPORT_FORMATS = [
  { id: "png", label: "PNG", mime: "image/png", ext: "png", quality: null },
  { id: "jpeg", label: "JPEG", mime: "image/jpeg", ext: "jpg", quality: 0.92 },
  { id: "webp", label: "WebP", mime: "image/webp", ext: "webp", quality: 0.92 },
]

export const EXPORT_PRESETS = [
  { id: "hd", label: "HD", targetW: 1920 },
  { id: "2k", label: "2K", targetW: 2560 },
  { id: "4k", label: "4K", targetW: 3840 },
  { id: "8k", label: "8K", targetW: 7680 },
]

export function baseSize(sourceCanvas, opts) {
  if (!sourceCanvas) return null
  const m = measureOutput(sourceCanvas.width, sourceCanvas.height, {
    ...opts,
    scale: 1,
  })
  return { w: m.outW, h: m.outH }
}

export function exportSize(sourceCanvas, opts, scale) {
  if (!sourceCanvas) return null
  const m = measureOutput(sourceCanvas.width, sourceCanvas.height, {
    ...opts,
    scale,
  })
  return { w: m.outW, h: m.outH }
}

export function scaleForPreset(sourceCanvas, opts, targetW) {
  if (!sourceCanvas) return 3
  return scaleForTargetWidth(
    sourceCanvas.width,
    sourceCanvas.height,
    opts,
    targetW
  )
}
