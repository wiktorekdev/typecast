import React, { useCallback, useEffect, useRef, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Coffee, GithubLogo, List, Question } from "@phosphor-icons/react"
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
import { KeyboardHelp } from "@/components/KeyboardHelp.jsx"
import { useToast } from "@/components/Toast.jsx"
import {
  NumberSlider,
  OptionSelect,
  ColorField,
  PanelCard,
} from "@/components/controls.jsx"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  Sheet,
  SheetPopup,
  SheetHeader,
  SheetTitle,
  SheetPanel,
} from "@/components/ui/sheet"
import { useMediaQuery } from "@/hooks/use-media-query.js"
import { LanguageSelect, useI18n } from "@/i18n/I18nProvider.jsx"
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

const GITHUB_URL = "https://github.com/wiktorekdev/typecast"
const KOFI_URL = "https://ko-fi.com/wiktorekdev"

function SidebarLinks({ t }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 p-3">
      <div className="pointer-events-auto flex items-center gap-1 rounded-2xl border border-white/10 bg-zinc-950/90 p-1 shadow-2xl shadow-black/40 backdrop-blur-md">
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noreferrer"
          title="GitHub"
          className="flex h-9 flex-1 items-center justify-center gap-2 rounded-xl px-3 text-[13px] font-medium text-zinc-300 transition hover:bg-white/10 hover:text-zinc-50"
        >
          <GithubLogo className="size-4 shrink-0" weight="fill" />
          <span>GitHub</span>
        </a>
        <div className="h-5 w-px shrink-0 bg-white/10" />
        <a
          href={KOFI_URL}
          target="_blank"
          rel="noreferrer"
          title={t("supportKofi")}
          className="flex h-9 flex-1 items-center justify-center gap-2 rounded-xl px-3 text-[13px] font-medium text-zinc-300 transition hover:bg-[#ff5e5b]/15 hover:text-[#ff8a88]"
        >
          <Coffee className="size-4 shrink-0" weight="fill" />
          <span>Ko-fi</span>
        </a>
      </div>
    </div>
  )
}

function SettingsPanels({ opts, set, t }) {
  return (
    <div className="relative flex h-full min-h-0 flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto p-3 pb-20">
      <PanelCard title={t("panelType")}>
        <OptionSelect
          label={t("characters")}
          value={opts.charSet}
          onChange={(value) => set("charSet", value)}
          options={Object.keys(CHAR_SETS).map((value) => ({
            value,
            label: t(`charset_${value}`),
          }))}
        />

        {opts.charSet === "custom" && (
          <div className="flex w-full flex-col gap-2">
            <span className="text-[13px] text-zinc-400">{t("custom")}</span>
            <Input
              aria-label={t("customChars")}
              type="text"
              value={opts.customChars}
              placeholder="01"
              onChange={(e) => set("customChars", e.target.value)}
              className="h-9 min-h-9 rounded-xl border-zinc-800 bg-zinc-900/80 px-3 font-mono text-[13px] shadow-none dark:bg-zinc-900/80"
            />
          </div>
        )}

        <NumberSlider
          label={t("columns")}
          value={opts.cols}
          min={60}
          max={400}
          onChange={(v) => set("cols", v)}
        />

        <NumberSlider
          label={t("charWidth")}
          value={opts.charAspect}
          min={0.35}
          max={1}
          step={0.01}
          onChange={(v) => set("charAspect", v)}
        />

        <OptionSelect
          label={t("font")}
          value={opts.fontFamily}
          onChange={(value) => set("fontFamily", value)}
          options={FONTS.map((font) => ({
            value: font.value,
            label: font.label,
          }))}
        />

        <NumberSlider
          label={t("size")}
          value={opts.fontSize}
          min={4}
          max={20}
          onChange={(v) => set("fontSize", v)}
        />
      </PanelCard>

      <PanelCard title={t("panelColor")}>
        <OptionSelect
          label={t("mode")}
          value={opts.colorMode}
          onChange={(value) => set("colorMode", value)}
          options={Object.keys(COLOR_MODES).map((value) => ({
            value,
            label: t(`color_${value}`),
          }))}
        />

        <ColorField
          label={t("background")}
          value={opts.bgColor}
          onChange={(value) => set("bgColor", value)}
        />

        {opts.colorMode === "bw" && (
          <ColorField
            label={t("text")}
            value={opts.fgColor}
            onChange={(value) => set("fgColor", value)}
          />
        )}

        {(opts.colorMode === "tinted" || opts.colorMode === "tintedRaw") && (
          <ColorField
            label={t("tint")}
            value={opts.tintColor}
            onChange={(value) => set("tintColor", value)}
          />
        )}
      </PanelCard>

      <PanelCard title={t("panelAdjust")}>
        <NumberSlider
          label={t("brightness")}
          value={opts.brightness}
          min={-50}
          max={50}
          onChange={(v) => set("brightness", v)}
        />
        <NumberSlider
          label={t("contrast")}
          value={opts.contrast}
          min={0.5}
          max={3}
          step={0.1}
          onChange={(v) => set("contrast", v)}
        />
        <NumberSlider
          label={t("saturation")}
          value={opts.saturation}
          min={0}
          max={200}
          onChange={(v) => set("saturation", v)}
        />
        <NumberSlider
          label={t("threshold")}
          value={opts.threshold}
          min={0}
          max={50}
          onChange={(v) => set("threshold", v)}
        />
        <div className="flex items-center justify-between gap-3">
          <span className="text-[13px] text-zinc-400">{t("invert")}</span>
          <Switch
            checked={opts.invert}
            onCheckedChange={(checked) => set("invert", checked)}
          />
        </div>
      </PanelCard>
      </div>
      <SidebarLinks t={t} />
    </div>
  )
}

export default function App() {
  const { t } = useI18n()
  const { showToast } = useToast()
  const isNarrow = useMediaQuery("max-lg")
  const [opts, setOpts] = useState(DEFAULT_OPTS)
  const [sourceCanvas, setSourceCanvas] = useState(null)
  const [sourceUrl, setSourceUrl] = useState(null)
  const [fileName, setFileName] = useState("")
  const [previewUrl, setPreviewUrl] = useState(null)
  const [rendering, setRendering] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const previewGen = useRef(0)

  const set = useCallback((key, val) => {
    setOpts((current) => ({ ...current, [key]: val }))
  }, [])

  const handleFile = useCallback(async (file) => {
    if (!file?.type.startsWith("image/")) return
    try {
      const nextUrl = URL.createObjectURL(file)
      setSourceUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev)
        return nextUrl
      })
      setSourceCanvas(await loadImageToCanvas(file))
      setFileName(file.name || "image")
      if (isNarrow) setSettingsOpen(false)
    } catch {
      showToast(t("loadFailed"), "error")
    }
  }, [t, showToast, isNarrow])

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
        if (gen === previewGen.current) showToast(t("previewFailed"), "error")
      } finally {
        if (gen === previewGen.current) setRendering(false)
      }
    }, 140)

    return () => window.clearTimeout(timer)
  }, [opts, sourceCanvas, t, showToast])

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

  useEffect(() => {
    const isTyping = (el) =>
      el instanceof HTMLInputElement ||
      el instanceof HTMLTextAreaElement ||
      el instanceof HTMLSelectElement ||
      el?.isContentEditable

    const onKeyDown = (e) => {
      if (isTyping(e.target)) return

      if (e.key === "?" || (e.shiftKey && e.key === "/")) {
        e.preventDefault()
        setHelpOpen((v) => !v)
        return
      }

      if (e.key === "Escape") {
        if (helpOpen) {
          setHelpOpen(false)
          return
        }
        if (exportOpen) {
          setExportOpen(false)
          return
        }
        if (settingsOpen) {
          setSettingsOpen(false)
        }
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [helpOpen, exportOpen, settingsOpen])

  useEffect(() => {
    if (!isNarrow) setSettingsOpen(false)
  }, [isNarrow])

  const onExportMessage = useCallback(
    (msg, type = "success") => {
      if (!msg) return
      showToast(msg, type)
    },
    [showToast]
  )

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-zinc-950 text-zinc-50">
      <header className="flex h-12 shrink-0 items-center justify-between gap-3 border-b border-zinc-800/80 px-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <img
            src="/logo.svg"
            alt=""
            width={28}
            height={28}
            className="size-7 shrink-0 text-zinc-50"
            draggable={false}
          />
          <span className="text-[14px] font-semibold tracking-tight">{t("brand")}</span>
          {sourceCanvas && fileName && (
            <span className="hidden min-w-0 max-w-[12rem] truncate text-[12px] text-zinc-500 md:inline">
              {fileName}
            </span>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {rendering && (
            <span className="hidden text-[12px] text-zinc-500 sm:inline">{t("rendering")}</span>
          )}
          <button
            type="button"
            title={t("helpTitle")}
            onClick={() => setHelpOpen(true)}
            className="flex size-9 items-center justify-center rounded-full text-zinc-400 transition hover:bg-white/10 hover:text-zinc-100"
          >
            <Question className="size-4" weight="bold" />
          </button>
          {isNarrow && (
            <button
              type="button"
              title={t("settings")}
              onClick={() => setSettingsOpen(true)}
              className="flex size-9 items-center justify-center rounded-full text-zinc-400 transition hover:bg-white/10 hover:text-zinc-100"
            >
              <List className="size-4" weight="bold" />
            </button>
          )}
          <LanguageSelect />
        </div>
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
                  <img src="/logo.svg" alt="" className="size-7 text-zinc-50" draggable={false} />
                </div>
                <div className="flex flex-col items-center gap-1 px-4">
                  <span className="text-[15px] font-medium tracking-tight">
                    {t("dropTitle")}
                  </span>
                  <span className="text-[13px] text-zinc-500">
                    {t("dropSub")}
                  </span>
                </div>
                <span className="mt-1 inline-flex h-9 items-center rounded-full bg-white px-4 text-[13px] font-semibold text-zinc-950">
                  {t("chooseFile")}
                </span>
              </button>
            </div>
          ) : (
            <StageViewport
              previewUrl={previewUrl}
              sourceUrl={sourceUrl}
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
              onSaved={onExportMessage}
            />
          )}

          {isDragActive && sourceCanvas && (
            <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center bg-zinc-950/80">
              <p className="rounded-full bg-white px-4 py-2 text-[13px] font-semibold text-zinc-950">
                {t("dropToReplace")}
              </p>
            </div>
          )}
        </main>

        {!isNarrow && (
          <aside className="tc-panel flex h-full min-h-0 w-[320px] shrink-0 flex-col border-l border-zinc-800/80 bg-zinc-950 xl:w-[360px]">
            <SettingsPanels opts={opts} set={set} t={t} />
          </aside>
        )}
      </div>

      <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
        <SheetPopup
          side="right"
          showCloseButton
          className="bg-zinc-950 text-zinc-50 sm:max-w-[360px]"
        >
          <SheetHeader className="border-b border-zinc-800 px-4 py-3">
            <SheetTitle className="text-[14px] font-semibold text-zinc-50">
              {t("settings")}
            </SheetTitle>
          </SheetHeader>
          <SheetPanel className="min-h-0 flex-1 overflow-hidden p-0">
            {isNarrow ? (
              <div className="flex h-full min-h-0 flex-col">
                <SettingsPanels opts={opts} set={set} t={t} />
              </div>
            ) : null}
          </SheetPanel>
        </SheetPopup>
      </Sheet>

      <KeyboardHelp open={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  )
}
