import React, { useState } from "react"
import { CopySimple, DownloadSimple, X } from "@phosphor-icons/react"
import { EXPORT_FORMATS, EXPORT_PRESETS, exportSize, scaleForPreset } from "@/lib/export.js"
import { renderAsciiToUrl } from "@/hooks/useAsciiRender.js"
import { useI18n } from "@/i18n/I18nProvider.jsx"
import { cn } from "@/lib/utils"

export function ExportPanel({
  open,
  onClose,
  sourceCanvas,
  opts,
  fileName,
  onSaved,
}) {
  const { t } = useI18n()
  const [formatId, setFormatId] = useState("png")
  const [presetId, setPresetId] = useState("4k")
  const [exporting, setExporting] = useState(false)

  const format = EXPORT_FORMATS.find((f) => f.id === formatId) ?? EXPORT_FORMATS[0]
  const preset = EXPORT_PRESETS.find((p) => p.id === presetId) ?? EXPORT_PRESETS[2]
  const scale = scaleForPreset(sourceCanvas, opts, preset.targetW)
  const size = exportSize(sourceCanvas, opts, scale)

  const renderBlob = async () => {
    const url = await renderAsciiToUrl(
      sourceCanvas,
      { ...opts, scale },
      { format: format.mime, quality: format.quality ?? 0.95 }
    )
    const res = await fetch(url)
    const blob = await res.blob()
    URL.revokeObjectURL(url)
    return blob
  }

  const download = async () => {
    if (!sourceCanvas) return
    setExporting(true)
    try {
      const blob = await renderBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      const base = fileName.replace(/\.[^.]+$/, "") || "typecast"
      a.download = `${base}-typecast-${preset.id}.${format.ext}`
      a.click()
      URL.revokeObjectURL(url)
      onSaved?.(t("saved"), "success")
      onClose()
    } catch {
      onSaved?.(t("exportFailed"), "error")
    } finally {
      setExporting(false)
    }
  }

  const copyPng = async () => {
    if (!sourceCanvas) return
    if (!navigator.clipboard?.write || typeof ClipboardItem === "undefined") {
      onSaved?.(t("copyUnsupported"), "error")
      return
    }
    setExporting(true)
    try {
      // Clipboard image write is most reliable as PNG
      const url = await renderAsciiToUrl(
        sourceCanvas,
        { ...opts, scale },
        { format: "image/png", quality: 0.95 }
      )
      const res = await fetch(url)
      const blob = await res.blob()
      URL.revokeObjectURL(url)
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ])
      onSaved?.(t("copied"), "success")
    } catch {
      onSaved?.(t("copyFailed"), "error")
    } finally {
      setExporting(false)
    }
  }

  if (!open) return null

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-20 z-30 flex justify-center px-4">
      <div className="pointer-events-auto w-full max-w-[22rem] rounded-2xl border border-white/10 bg-zinc-950/95 p-4 shadow-2xl shadow-black/50 backdrop-blur-md">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-[14px] font-semibold tracking-tight">{t("exportTitle")}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("closeExport")}
            className="flex size-8 items-center justify-center rounded-full text-zinc-400 transition hover:bg-white/10 hover:text-zinc-100"
          >
            <X className="size-4" weight="bold" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <span className="text-[12px] text-zinc-400">{t("format")}</span>
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
              <span className="text-[12px] text-zinc-400">{t("sizeLabel")}</span>
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

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={exporting || !sourceCanvas}
              onClick={copyPng}
              className="flex h-10 items-center justify-center gap-2 rounded-full border border-zinc-700 bg-zinc-900 text-[13px] font-semibold text-zinc-100 transition hover:bg-zinc-800 disabled:opacity-40"
            >
              <CopySimple weight="bold" className="size-4" />
              {t("copy")}
            </button>
            <button
              type="button"
              disabled={exporting || !sourceCanvas}
              onClick={download}
              className="flex h-10 items-center justify-center gap-2 rounded-full bg-white text-[13px] font-semibold text-zinc-950 transition hover:bg-zinc-100 disabled:opacity-40"
            >
              <DownloadSimple weight="bold" className="size-4" />
              {exporting ? t("saving") : t("download", { format: format.label })}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
