import { renderAscii, canvasToBlob, type AsciiOptionsInput } from "../lib/asciiEngine"

type WorkerIn = {
  id: number
  bitmap: ImageBitmap
  options: AsciiOptionsInput
  format?: string
  quality?: number
}

type WorkerOut =
  | { id: number; ok: true; buffer: ArrayBuffer; mime: string }
  | { id: number; ok: true; bitmap: ImageBitmap }
  | { id: number; ok: false; error: string }

self.onmessage = async (event: MessageEvent<WorkerIn>) => {
  const { id, bitmap, options, format, quality } = event.data

  try {
    const canvas = renderAscii(bitmap, options)
    bitmap.close?.()

    if (format) {
      const blob = await canvasToBlob(canvas, format, quality ?? 0.95)
      const buffer = await blob.arrayBuffer()
      const msg: WorkerOut = {
        id,
        ok: true,
        buffer,
        mime: blob.type || format,
      }
      self.postMessage(msg, { transfer: [buffer] })
      return
    }

    let outBitmap: ImageBitmap
    if ("transferToImageBitmap" in canvas && typeof canvas.transferToImageBitmap === "function") {
      outBitmap = canvas.transferToImageBitmap()
    } else if (typeof createImageBitmap === "function") {
      outBitmap = await createImageBitmap(canvas as CanvasImageSource)
    } else {
      const blob = await canvasToBlob(canvas, "image/png")
      const buffer = await blob.arrayBuffer()
      const msg: WorkerOut = { id, ok: true, buffer, mime: "image/png" }
      self.postMessage(msg, { transfer: [buffer] })
      return
    }

    const msg: WorkerOut = { id, ok: true, bitmap: outBitmap }
    self.postMessage(msg, { transfer: [outBitmap] })
  } catch (err) {
    const msg: WorkerOut = {
      id,
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    }
    self.postMessage(msg)
  }
}

export {}
