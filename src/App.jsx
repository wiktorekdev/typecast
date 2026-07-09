import React, { useCallback, useEffect, useRef, useState } from "react"
import { useDropzone } from "react-dropzone"
import { GithubLogo, UploadSimple } from "@phosphor-icons/react"
import {
  loadImageToCanvas,
  previewScaleFor,
  CHAR_SETS,
  FONTS,
  COLOR_MODES,
} from "@/lib/asciiEngine.js"
import { renderAsciiToUrl } from "@/hooks/useAsciiRender.js"
import { StageViewport } from "@/components/StageViewport.jsx"
import { ExportPanel } from "@/components/ExportPanel.jsx"
import {
  NumberSlider,
  OptionSelect,
  ColorField,
  PanelCard,
} from "@/components/controls.jsx"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

const DEFAULT_OPTS = {
  cols: 160,
  charSet: "binary",
  customChars: "",
  fontFamily: '"Courier New", monospace',
  fontSize: 8,
  colorMode: "tinted",
  bgColor: "#000000",
  fgColor: "#ffffff",
  tintColor: "#ffffff",
  brightness: 0,
  contrast: 1.4,
  saturation: 100,
  threshold: 8,
  invert: false,
  charAspect: 0.55,
  scale: 3,
}

const GITHUB_URL = "https://github.com/wiktorekdev"

export default function App() {
  const [opts, setOpts] = useState(DEFAULT_OPTS)
  const [sourceCanvas, setSourceCanvas] = useState(null)
  const [fileName, setFileName] = useState("")
  const [previewUrl, setPreviewUrl] = useState(null)
  const [rendering, setRendering] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const [status, setStatus] = useState("")
  const previewGen = useRef(0)

  const set = useCallback((key, val) => {
    setOpts((current) => ({ ...current, [key]: val }))
  }, [])

  const handleFile = useCallback(async (file) => {
    if (!file?.type.startsWith("image/")) return
    setStatus("")
    try {
      setSourceCanvas(await loadImageToCanvas(file))
      setFileName(file.name || "image")
    } catch {
      setStatus("Could not load image.")
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    accept: { "image/*": [] },
    multiple: false,
    noKeyboard: true,
    noClick: true,
    onDrop: (files) => files[0] && handleFile(files[0]),
  })

  useEffect(() => {
    if (!sourceCanvas) {
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev)
        return null
      })
      setRendering(false)
      setExportOpen(false)
      return
    }

    const gen = ++previewGen.current
    setRendering(true)

    const timer = window.setTimeout(async () => {
      try {
        const scale = previewScaleFor(
          sourceCanvas.width,
          sourceCanvas.height,
          opts
        )
        const url = await renderAsciiToUrl(sourceCanvas, { ...opts, scale })
        if (gen !== previewGen.current) {
          URL.revokeObjectURL(url)
          return
        }
        setPreviewUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev)
          return url
        })
      } catch (err) {
        console.error(err)
        if (gen === previewGen.current) setStatus("Preview failed.")
      } finally {
        if (gen === previewGen.current) setRendering(false)
      }
    }, 140)

    return () => window.clearTimeout(timer)
  }, [opts, sourceCanvas])

  useEffect(() => {
    const onPaste = (event) => {
      for (const item of event.clipboardData?.items ?? []) {
        if (item.type.startsWith("image/")) {
          event.preventDefault()
          handleFile(item.getAsFile())
          break
        }
      }
    }
    window.addEventListener("paste", onPaste)
    return () => window.removeEventListener("paste", onPaste)
  }, [handleFile])

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-zinc-950 text-zinc-50">
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-zinc-800/80 px-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="text-[14px] font-semibold tracking-tight">Typecast</span>
          {sourceCanvas && fileName && (
            <span className="hidden min-w-0 max-w-[12rem] truncate text-[12px] text-zinc-500 md:inline">
              {fileName}
            </span>
          )}
          {status && (
            <span className="shrink-0 text-[12px] text-zinc-400">{status}</span>
          )}
        </div>
        {rendering && (
          <span className="text-[12px] text-zinc-500">Rendering…</span>
        )}
      </header>

      <div className="flex min-h-0 flex-1">
        <main
          {...getRootProps()}
          className={cn(
            "relative flex min-w-0 flex-1 flex-col",
            isDragActive && "bg-white/[0.02]"
          )}
        >
          <input {...getInputProps()} />

          {!sourceCanvas ? (
            <div className="relative flex min-h-0 flex-1 flex-col">
              <button
                type="button"
                onClick={open}
                className={cn(
                  "m-4 flex flex-1 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed transition",
                  isDragActive
                    ? "border-zinc-500 bg-white/[0.03]"
                    : "border-zinc-800 bg-zinc-950/50 hover:border-zinc-600 hover:bg-zinc-900/40"
                )}
              >
                <div className="flex size-12 items-center justify-center rounded-2xl bg-zinc-900 ring-1 ring-zinc-800">
                  <UploadSimple className="size-5 text-zinc-400" weight="bold" />
                </div>
                <div className="flex flex-col items-center gap-1 px-4">
                  <span className="text-[15px] font-medium tracking-tight">
                    Drop an image here
                  </span>
                  <span className="text-[13px] text-zinc-500">
                    Binary · ASCII · characters · export HD–8K
                  </span>
                </div>
                <span className="mt-1 inline-flex h-9 items-center rounded-full bg-white px-4 text-[13px] font-semibold text-zinc-950">
                  Choose file
                </span>
              </button>
            </div>
          ) : (
            <StageViewport
              previewUrl={previewUrl}
              bgColor={opts.bgColor}
              rendering={rendering}
              fitKey={
                fileName +
                (sourceCanvas
                  ? `-${sourceCanvas.width}x${sourceCanvas.height}`
                  : "")
              }
              onOpenExport={() => setExportOpen((v) => !v)}
              exportOpen={exportOpen}
              onReplace={open}
              hasImage={Boolean(sourceCanvas)}
            />
          )}

          {sourceCanvas && (
            <ExportPanel
              open={exportOpen}
              onClose={() => setExportOpen(false)}
              sourceCanvas={sourceCanvas}
              opts={opts}
              fileName={fileName}
              onSaved={(msg) => {
                setStatus(msg || "Saved")
                window.setTimeout(() => setStatus(""), 1800)
              }}
            />
          )}

          {isDragActive && sourceCanvas && (
            <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center bg-zinc-950/80">
              <p className="rounded-full bg-white px-4 py-2 text-[13px] font-semibold text-zinc-950">
                Drop to replace
              </p>
            </div>
          )}

          <div className="absolute bottom-5 left-4 z-20 flex items-center gap-1">
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              title="GitHub"
              className="flex size-9 items-center justify-center rounded-full border border-white/10 bg-zinc-950/80 text-zinc-400 backdrop-blur-md transition hover:bg-zinc-900 hover:text-zinc-100"
            >
              <GithubLogo className="size-4" weight="fill" />
            </a>
          </div>
        </main>

        <aside className="tc-panel flex w-[320px] shrink-0 flex-col border-l border-zinc-800/80 bg-zinc-950 xl:w-[360px]">
          <div className="flex-1 space-y-3 overflow-y-auto p-3">
            <PanelCard title="Type">
              <OptionSelect
                label="Characters"
                value={opts.charSet}
                onChange={(value) => set("charSet", value)}
                options={Object.entries(CHAR_SETS).map(([value, item]) => ({
                  value,
                  label: item.label,
                }))}
              />

              {opts.charSet === "custom" && (
                <div className="flex w-full flex-col gap-2">
                  <span className="text-[13px] text-zinc-400">Custom</span>
                  <Input
                    aria-label="Custom characters"
                    type="text"
                    value={opts.customChars}
                    placeholder="01"
                    onChange={(e) => set("customChars", e.target.value)}
                    className="h-9 min-h-9 rounded-xl border-zinc-800 bg-zinc-900/80 px-3 font-mono text-[13px] shadow-none dark:bg-zinc-900/80"
                  />
                </div>
              )}

              <NumberSlider
                label="Columns"
                value={opts.cols}
                min={60}
                max={400}
                onChange={(v) => set("cols", v)}
              />

              <OptionSelect
                label="Font"
                value={opts.fontFamily}
                onChange={(value) => set("fontFamily", value)}
                options={FONTS.map((font) => ({
                  value: font.value,
                  label: font.label,
                }))}
              />

              <NumberSlider
                label="Size"
                value={opts.fontSize}
                min={4}
                max={20}
                onChange={(v) => set("fontSize", v)}
              />
            </PanelCard>

            <PanelCard title="Color">
              <OptionSelect
                label="Mode"
                value={opts.colorMode}
                onChange={(value) => set("colorMode", value)}
                options={Object.entries(COLOR_MODES).map(([value, mode]) => ({
                  value,
                  label: mode.label,
                }))}
              />

              <ColorField
                label="Background"
                value={opts.bgColor}
                onChange={(value) => set("bgColor", value)}
              />

              {opts.colorMode === "bw" && (
                <ColorField
                  label="Text"
                  value={opts.fgColor}
                  onChange={(value) => set("fgColor", value)}
                />
              )}

              {(opts.colorMode === "tinted" || opts.colorMode === "tintedRaw") && (
                <ColorField
                  label="Tint"
                  value={opts.tintColor}
                  onChange={(value) => set("tintColor", value)}
                />
              )}
            </PanelCard>

            <PanelCard title="Adjust">
              <NumberSlider
                label="Contrast"
                value={opts.contrast}
                min={0.5}
                max={3}
                step={0.1}
                onChange={(v) => set("contrast", v)}
              />
              <NumberSlider
                label="Threshold"
                value={opts.threshold}
                min={0}
                max={50}
                onChange={(v) => set("threshold", v)}
              />
              <div className="flex items-center justify-between gap-3">
                <span className="text-[13px] text-zinc-400">Invert</span>
                <Switch
                  checked={opts.invert}
                  onCheckedChange={(checked) => set("invert", checked)}
                />
              </div>
            </PanelCard>
          </div>
        </aside>
      </div>
    </div>
  )
}
