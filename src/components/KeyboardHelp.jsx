import React from "react"
import { X } from "@phosphor-icons/react"
import { useI18n } from "@/i18n/I18nProvider.jsx"
import { cn } from "@/lib/utils"

function Kbd({ children }) {
  return (
    <kbd className="inline-flex min-w-7 items-center justify-center rounded-md border border-zinc-700 bg-zinc-900 px-1.5 py-0.5 font-mono text-[11px] text-zinc-200">
      {children}
    </kbd>
  )
}

export function KeyboardHelp({ open, onClose }) {
  const { t } = useI18n()
  if (!open) return null

  const rows = [
    { keys: ["?"], label: t("helpToggle") },
    { keys: ["Scroll"], label: t("helpZoom") },
    { keys: ["Drag"], label: t("helpPan") },
    { keys: ["C"], label: t("helpCompare") },
    { keys: ["Ctrl", "0"], label: t("helpFit") },
    { keys: ["Ctrl", "1"], label: t("helpHundred") },
    { keys: ["Ctrl", "+"], label: t("zoomIn") },
    { keys: ["Ctrl", "−"], label: t("zoomOut") },
    { keys: ["Ctrl", "E"], label: t("export") },
    { keys: ["Ctrl", "V"], label: t("helpPaste") },
    { keys: ["Esc"], label: t("helpEsc") },
  ]

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        aria-label={t("close")}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="kbd-help-title"
        className="relative w-full max-w-md rounded-2xl border border-white/10 bg-zinc-950 p-5 shadow-2xl"
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 id="kbd-help-title" className="text-[15px] font-semibold">
            {t("helpTitle")}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-full text-zinc-400 hover:bg-white/10 hover:text-zinc-100"
            aria-label={t("close")}
          >
            <X className="size-4" weight="bold" />
          </button>
        </div>
        <ul className="space-y-2">
          {rows.map((row) => (
            <li
              key={row.label}
              className="flex items-center justify-between gap-3 border-b border-zinc-800/80 py-2 last:border-0"
            >
              <span className="text-[13px] text-zinc-300">{row.label}</span>
              <span className="flex shrink-0 items-center gap-1">
                {row.keys.map((k, i) => (
                  <React.Fragment key={`${row.label}-${k}-${i}`}>
                    {i > 0 && (
                      <span className="text-[11px] text-zinc-600">+</span>
                    )}
                    <Kbd>{k}</Kbd>
                  </React.Fragment>
                ))}
              </span>
            </li>
          ))}
        </ul>
        <p className={cn("mt-4 text-[12px] text-zinc-500")}>{t("helpCompareHint")}</p>
      </div>
    </div>
  )
}
