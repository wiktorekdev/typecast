import React, { useState } from "react"
import { DownloadSimple, X } from "@phosphor-icons/react"
import { EXPORT_FORMATS, EXPORT_PRESETS, exportSize, scaleForPreset } from "@/lib/export.js"
import { renderAsciiToUrl } from "@/hooks/useAsciiRender.js"
import { cn } from "@/lib/utils"

export function ExportPanel({
  open,
  onClose,
  sourceCanvas,
  opts,
  fileName,
  onSaved,
}) {
  const [formatId, setFormatId] = useState("png")
  const [presetId, setPresetId] = useState("4k")
  const [exporting, setExporting] = useState(false)

  const format = EXPORT_FORMATS.find((f) => f.id === formatId) ?? EXPORT_FORMATS[0]
  const preset = EXPORT_PRESETS.find((p) => p.id === presetId) ?? EXPORT_PRESETS[2]
  const scale = scaleForPreset(sourceCanvas, opts, preset.targetW)
  const size = exportSize(sourceCanvas, opts, scale)

  const download = async () => {
    if (!sourceCanvas) return
    setExporting(true)
    try {
      const url = await renderAsciiToUrl(
        sourceCanvas,
        { ...opts, scale },
        { format: format.mime, quality: format.quality ?? 0.95 }
      )
      const a = document.createElement("a")
      a.href = url
      const base = fileName.replace(/\.[^.]+$/, "") || "typecast"
      a.download = `${base}-typecast-${preset.id}.${format.ext}`
      a.click()
      URL.revokeObjectURL(url)
      onSaved?.()
      onClose()
    } catch {
      onSaved?.("Export failed.")
    } finally {
      setExporting(false)
    }
  }

  if (!open) return null

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-20 z-30 flex justify-center px-4">
      <div className="pointer-events-auto w-full max-w-[22rem] rounded-2xl border border-white/10 bg-zinc-950/95 p-4 shadow-2xl shadow-black/50 backdrop-blur-md">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-[14px] font-semibold tracking-tight">Export</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close export"
            className="flex size-8 items-center justify-center rounded-full text-zinc-400 transition hover:bg-white/10 hover:text-zinc-100"
          >
            <X className="size-4" weight="bold" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <span className="text-[12px] text-zinc-400">Format</span>
            <div className="grid grid-cols-3 gap-1.5">
              {EXPORT_FORMATS.map((f) => {
                const active = formatId === f.id
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFormatId(f.id)}
                    className={cn(
                      "h-9 rounded-xl text-[13px] font-medium transition",
                      active
                        ? "bg-white text-zinc-950"
                        : "bg-zinc-900 text-zinc-300 ring-1 ring-zinc-800 hover:bg-zinc-800"
                    )}
                  >
                    {f.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[12px] text-zinc-400">Size</span>
              {size && (
                <span className="font-mono text-[12px] tabular-nums text-zinc-300">
                  {size.w.toLocaleString()} × {size.h.toLocaleString()}
                </span>
              )}
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {EXPORT_PRESETS.map((p) => {
                const active = presetId === p.id
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPresetId(p.id)}
                    className={cn(
                      "flex h-11 flex-col items-center justify-center rounded-xl transition",
                      active
                        ? "bg-white text-zinc-950"
                        : "bg-zinc-900 text-zinc-300 ring-1 ring-zinc-800 hover:bg-zinc-800"
                    )}
                  >
                    <span className="text-[13px] font-semibold">{p.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <button
            type="button"
            disabled={exporting || !sourceCanvas}
            onClick={download}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-full bg-white text-[13px] font-semibold text-zinc-950 transition hover:bg-zinc-100 disabled:opacity-40"
          >
            <DownloadSimple weight="bold" className="size-4" />
            {exporting ? "Saving…" : `Download ${format.label}`}
          </button>
        </div>
      </div>
    </div>
  )
}
