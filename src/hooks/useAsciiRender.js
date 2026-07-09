import { useCallback, useEffect, useRef } from "react"
import {
  renderAscii,
  canvasToBlob,
  previewScaleFor,
} from "@/lib/asciiEngine.js"

let worker = null
let workerBroken = false

function getWorker() {
  if (workerBroken) return null
  if (worker) return worker
  try {
    worker = new Worker(new URL("../workers/ascii.worker.js", import.meta.url), {
      type: "module",
    })
    worker.onerror = () => {
      workerBroken = true
      worker = null
    }
    return worker
  } catch {
    workerBroken = true
    return null
  }
}

let msgId = 0

function runOnWorker(bitmap, options, format, quality) {
  const w = getWorker()
  if (!w) return Promise.reject(new Error("no worker"))

  const id = ++msgId
  return new Promise((resolve, reject) => {
    const onMessage = (e) => {
      if (e.data?.id !== id) return
      w.removeEventListener("message", onMessage)
      if (!e.data.ok) {
        reject(new Error(e.data.error || "Worker render failed"))
        return
      }
      resolve(e.data)
    }
    w.addEventListener("message", onMessage)
    w.postMessage({ id, bitmap, options, format, quality }, [bitmap])
  })
}

async function sourceToBitmap(sourceCanvas) {
  if (typeof createImageBitmap === "function") {
    return createImageBitmap(sourceCanvas)
  }
  // fallback: clone via blob
  const blob = await canvasToBlob(sourceCanvas, "image/png")
  return createImageBitmap(blob)
}

/**
 * Renders ASCII off the main thread when possible.
 * Returns a blob URL for display / download.
 */
export async function renderAsciiToUrl(sourceCanvas, options, {
  format = "image/png",
  quality = 0.95,
} = {}) {
  const w = getWorker()
  if (w) {
    try {
      const bitmap = await sourceToBitmap(sourceCanvas)
      const result = await runOnWorker(bitmap, options, format, quality)
      if (result.buffer) {
        const blob = new Blob([result.buffer], { type: result.mime || format })
        return URL.createObjectURL(blob)
      }
      if (result.bitmap) {
        // draw bitmap to canvas then blob
        const c = document.createElement("canvas")
        c.width = result.bitmap.width
        c.height = result.bitmap.height
        c.getContext("2d").drawImage(result.bitmap, 0, 0)
        result.bitmap.close?.()
        const blob = await canvasToBlob(c, format, quality)
        return URL.createObjectURL(blob)
      }
    } catch {
      // fall through to main thread
    }
  }

  const canvas = renderAscii(sourceCanvas, options)
  const blob = await canvasToBlob(canvas, format, quality)
  return URL.createObjectURL(blob)
}

export function useAsciiPreview(sourceCanvas, opts, delay = 140) {
  const urlRef = useRef(null)
  const genRef = useRef(0)

  const clearUrl = useCallback(() => {
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current)
      urlRef.current = null
    }
  }, [])

  useEffect(() => () => clearUrl(), [clearUrl])

  const render = useCallback(
    async (onResult, onError) => {
      if (!sourceCanvas) {
        clearUrl()
        onResult?.(null)
        return
      }

      const gen = ++genRef.current
      try {
        const scale = previewScaleFor(
          sourceCanvas.width,
          sourceCanvas.height,
          opts
        )
        const url = await renderAsciiToUrl(sourceCanvas, { ...opts, scale })
        if (gen !== genRef.current) {
          URL.revokeObjectURL(url)
          return
        }
        clearUrl()
        urlRef.current = url
        onResult?.(url)
      } catch (err) {
        if (gen === genRef.current) onError?.(err)
      }
    },
    [sourceCanvas, opts, clearUrl]
  )

  return { render, clearUrl, delay }
}
