import {
  renderAscii,
  canvasToBlob,
  type AsciiOptionsInput,
} from "@/lib/asciiEngine"

type WorkerOk =
  | { id: number; ok: true; buffer: ArrayBuffer; mime?: string }
  | { id: number; ok: true; bitmap: ImageBitmap }

type WorkerErr = { id: number; ok: false; error?: string }

type WorkerMsg = WorkerOk | WorkerErr

let worker: Worker | null = null
let workerBroken = false

function getWorker() {
  if (workerBroken) return null
  if (worker) return worker
  try {
    worker = new Worker(new URL("../workers/ascii.worker.ts", import.meta.url), {
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

function runOnWorker(
  bitmap: ImageBitmap,
  options: AsciiOptionsInput,
  format: string,
  quality: number
): Promise<WorkerOk> {
  const w = getWorker()
  if (!w) return Promise.reject(new Error("no worker"))

  const id = ++msgId
  return new Promise((resolve, reject) => {
    const onMessage = (e: MessageEvent<WorkerMsg>) => {
      if (e.data?.id !== id) return
      w.removeEventListener("message", onMessage)
      if (!e.data.ok) {
        reject(new Error(("error" in e.data && e.data.error) || "Worker render failed"))
        return
      }
      resolve(e.data)
    }
    w.addEventListener("message", onMessage)
    w.postMessage({ id, bitmap, options, format, quality }, [bitmap])
  })
}

async function sourceToBitmap(sourceCanvas: HTMLCanvasElement) {
  if (typeof createImageBitmap === "function") {
    return createImageBitmap(sourceCanvas)
  }
  const blob = await canvasToBlob(sourceCanvas, "image/png")
  return createImageBitmap(blob)
}

export async function renderAsciiToUrl(
  sourceCanvas: HTMLCanvasElement,
  options: AsciiOptionsInput,
  {
    format = "image/png",
    quality = 0.95,
  }: { format?: string; quality?: number } = {}
) {
  const w = getWorker()
  if (w) {
    try {
      const bitmap = await sourceToBitmap(sourceCanvas)
      const result = await runOnWorker(bitmap, options, format, quality)
      if ("buffer" in result && result.buffer) {
        const blob = new Blob([result.buffer], { type: result.mime || format })
        return URL.createObjectURL(blob)
      }
      if ("bitmap" in result && result.bitmap) {
        const c = document.createElement("canvas")
        c.width = result.bitmap.width
        c.height = result.bitmap.height
        const ctx = c.getContext("2d")
        if (!ctx) throw new Error("2d context unavailable")
        ctx.drawImage(result.bitmap, 0, 0)
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
