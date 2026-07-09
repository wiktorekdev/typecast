import React, { useEffect, useState } from "react"
import {
  Select,
  SelectGroup,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"

const HEX_RE = /^#[0-9a-f]{6}$/i

const fieldClass =
  "box-border h-7 shrink-0 rounded-lg border border-zinc-800 bg-zinc-900/80 text-center font-mono text-[12px] tabular-nums text-zinc-100 outline-none transition placeholder:text-zinc-600 focus-visible:border-zinc-600 focus-visible:ring-2 focus-visible:ring-zinc-500/40"

export function NumberSlider({ label, value, min, max, step = 1, onChange }) {
  const format = (next) => {
    if (step < 0.1) return Number(next).toFixed(2)
    if (step < 1) return Number(next).toFixed(1)
    return String(Math.round(Number(next)))
  }

  const [draft, setDraft] = useState(() => format(value))
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    if (!focused) setDraft(format(value))
  }, [value, focused, step])

  const snap = (n) => {
    if (!Number.isFinite(n)) return value
    const stepped = Math.round((n - min) / step) * step + min
    const clamped = Math.min(max, Math.max(min, stepped))
    if (step < 0.1) return Number(clamped.toFixed(2))
    if (step < 1) return Number(clamped.toFixed(1))
    return Math.round(clamped)
  }

  const commit = (raw) => {
    const parsed = parseFloat(String(raw).replace(",", "."))
    const next = snap(parsed)
    setDraft(format(next))
    if (next !== value) onChange(next)
  }

  return (
    <div className="flex w-full min-w-0 flex-col gap-2">
      <div className="flex min-w-0 items-center justify-between gap-2">
        <span className="min-w-0 flex-1 truncate text-[13px] text-zinc-400">{label}</span>
        <input
          aria-label={label}
          type="text"
          inputMode={step < 1 ? "decimal" : "numeric"}
          value={draft}
          onFocus={(e) => {
            setFocused(true)
            e.target.select()
          }}
          onBlur={() => {
            setFocused(false)
            commit(draft)
          }}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur()
            if (e.key === "Escape") {
              setDraft(format(value))
              e.currentTarget.blur()
            }
            if (e.key === "ArrowUp") {
              e.preventDefault()
              const next = snap(value + step)
              setDraft(format(next))
              onChange(next)
            }
            if (e.key === "ArrowDown") {
              e.preventDefault()
              const next = snap(value - step)
              setDraft(format(next))
              onChange(next)
            }
          }}
          className={cn(fieldClass, "w-12 px-1")}
        />
      </div>
      <Slider
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={value}
        onValueChange={(next) => onChange(Array.isArray(next) ? next[0] : next)}
        className="w-full min-w-0"
      />
    </div>
  )
}

export function OptionSelect({ label, value, onChange, options }) {
  const selected = options.find((option) => option.value === value)

  return (
    <div className="flex w-full flex-col gap-2">
      <span className="text-[13px] text-zinc-400">{label}</span>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-9 min-h-9 w-full min-w-0 rounded-xl border-zinc-800 bg-zinc-900/80 px-3 text-[13px] shadow-none dark:bg-zinc-900/80">
          <SelectValue>{selected?.label}</SelectValue>
        </SelectTrigger>
        <SelectPopup>
          <SelectGroup>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectPopup>
      </Select>
    </div>
  )
}

export function ColorField({ label, value, onChange }) {
  const safe = HEX_RE.test(value) ? value.toLowerCase() : "#000000"
  const [draft, setDraft] = useState(safe)

  useEffect(() => {
    setDraft(safe)
  }, [safe])

  const commitHex = (raw) => {
    let next = raw.trim()
    if (!next.startsWith("#")) next = `#${next}`
    setDraft(next)
    if (HEX_RE.test(next)) onChange(next.toLowerCase())
  }

  return (
    <div className="flex w-full min-w-0 items-center justify-between gap-2">
      <span className="min-w-0 flex-1 truncate text-[13px] text-zinc-400">{label}</span>
      <div className="flex shrink-0 items-center gap-2">
        <label
          className="relative size-7 shrink-0 cursor-pointer overflow-hidden rounded-lg shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)] ring-1 ring-black/40 transition hover:brightness-110"
          title={safe}
          style={{ backgroundColor: safe }}
        >
          <input
            type="color"
            value={safe}
            aria-label={`${label} color picker`}
            onChange={(e) => {
              const next = e.target.value.toLowerCase()
              setDraft(next)
              onChange(next)
            }}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
        </label>
        <input
          aria-label={`${label} hex`}
          type="text"
          value={draft}
          spellCheck={false}
          maxLength={7}
          onChange={(e) => commitHex(e.target.value)}
          onBlur={() => {
            if (!HEX_RE.test(draft)) setDraft(safe)
          }}
          className={cn(fieldClass, "w-[5.25rem] px-1.5 uppercase tracking-wide")}
        />
      </div>
    </div>
  )
}

export function PanelCard({ title, children }) {
  return (
    <section className="rounded-2xl border border-zinc-800/90 bg-zinc-950/40 p-3.5">
      <h2 className="mb-3 text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-500">
        {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </section>
  )
}
