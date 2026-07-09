import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { CaretDown } from "@phosphor-icons/react"
import { Menu, MenuItem, MenuPopup, MenuTrigger } from "@/components/ui/menu"
import { cn } from "@/lib/utils"
import { Flag } from "./flags.jsx"
import { LOCALES, detectLocale, messages } from "./messages.js"

const I18nContext = createContext(null)

export function I18nProvider({ children }) {
  const [locale, setLocaleState] = useState(() => detectLocale())

  const setLocale = useCallback((id) => {
    if (!messages[id]) return
    setLocaleState(id)
    try {
      localStorage.setItem("typecast-lang", id)
    } catch {
      /* ignore */
    }
  }, [])

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  const t = useCallback(
    (key, vars) => {
      const table = messages[locale] || messages.en
      let str = table[key] ?? messages.en[key] ?? key
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          str = str.replaceAll(`{${k}}`, String(v))
        }
      }
      return str
    },
    [locale]
  )

  const value = useMemo(
    () => ({ locale, setLocale, t, locales: LOCALES }),
    [locale, setLocale, t]
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error("useI18n must be used within I18nProvider")
  return ctx
}

export function LanguageSelect({ className }) {
  const { locale, setLocale, locales, t } = useI18n()
  const current = locales.find((l) => l.id === locale) ?? locales[0]

  return (
    <Menu>
      <MenuTrigger
        aria-label={t("language")}
        className={cn(
          "inline-flex h-8 items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900/90 px-2 text-[12px] font-medium text-zinc-300 outline-none transition",
          "hover:border-zinc-600 hover:text-zinc-50 focus-visible:ring-2 focus-visible:ring-zinc-500",
          "data-popup-open:border-zinc-600 data-popup-open:text-zinc-50",
          className
        )}
      >
        <Flag code={current.flag} className="h-3.5 w-[21px]" title={current.label} />
        <span className="tabular-nums tracking-wide">{current.short}</span>
        <CaretDown className="size-3 opacity-60" weight="bold" />
      </MenuTrigger>
      <MenuPopup
        align="end"
        sideOffset={6}
        className="min-w-[11rem] border-zinc-800 bg-zinc-950 text-zinc-100 shadow-2xl shadow-black/40"
      >
        {locales.map((l) => {
          const active = l.id === locale
          return (
            <MenuItem
              key={l.id}
              onClick={() => setLocale(l.id)}
              className={cn(
                "gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px] text-zinc-200 data-highlighted:bg-white/10 data-highlighted:text-zinc-50",
                active && "bg-white/5"
              )}
            >
              <Flag code={l.flag} className="h-3.5 w-[21px]" title={l.label} />
              <span className="flex-1">{l.label}</span>
              <span className="font-mono text-[11px] text-zinc-500">{l.short}</span>
            </MenuItem>
          )
        })}
      </MenuPopup>
    </Menu>
  )
}
