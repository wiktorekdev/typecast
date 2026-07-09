import { renderAscii, canvasToBlob } from "../lib/asciiEngine.js"

self.onmessage = async (event) => {
  const { id, bitmap, options, format, quality } = event.data

  try {
    const canvas = renderAscii(bitmap, options)
    bitmap.close?.()

    if (format) {
      const blob = await canvasToBlob(canvas, format, quality ?? 0.95)
      const buffer = await blob.arrayBuffer()
      self.postMessage(
        { id, ok: true, buffer, mime: blob.type || format },
        [buffer]
      )
      return
    }

    // preview path: transfer ImageBitmap
    let outBitmap
    if (canvas.transferToImageBitmap) {
      outBitmap = canvas.transferToImageBitmap()
    } else if (typeof createImageBitmap === "function") {
      outBitmap = await createImageBitmap(canvas)
    } else {
      const blob = await canvasToBlob(canvas, "image/png")
      const buffer = await blob.arrayBuffer()
      self.postMessage(
        { id, ok: true, buffer, mime: "image/png" },
        [buffer]
      )
      return
    }

    self.postMessage({ id, ok: true, bitmap: outBitmap }, [outBitmap])
  } catch (err) {
    self.postMessage({
      id,
      ok: false,
      error: err?.message || String(err),
    })
  }
}
