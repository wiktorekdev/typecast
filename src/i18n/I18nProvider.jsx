import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
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

  return (
    <label className={className}>
      <span className="sr-only">{t("language")}</span>
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value)}
        aria-label={t("language")}
        className="h-8 cursor-pointer appearance-none rounded-full border border-zinc-800 bg-zinc-900/90 px-3 pe-7 text-[12px] font-medium text-zinc-300 outline-none transition hover:border-zinc-600 hover:text-zinc-50 focus-visible:ring-2 focus-visible:ring-zinc-500"
      >
        {locales.map((l) => (
          <option key={l.id} value={l.id}>
            {l.short} · {l.label}
          </option>
        ))}
      </select>
    </label>
  )
}
