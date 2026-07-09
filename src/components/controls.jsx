import React, { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectGroup,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"

const HEX_RE = /^#[0-9a-f]{6}$/i

export function NumberSlider({ label, value, min, max, step = 1, onChange }) {
  const format = (next) => (step < 1 ? Number(next).toFixed(1) : String(next))

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[13px] text-zinc-400">{label}</span>
        <span className="shrink-0 font-mono text-[12px] tabular-nums text-zinc-100">
          {format(value)}
        </span>
      </div>
      <Slider
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={value}
        onValueChange={(next) => onChange(Array.isArray(next) ? next[0] : next)}
        className="w-full"
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
  const safe = HEX_RE.test(value) ? value : "#000000"
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
    <div className="flex w-full flex-col gap-2">
      <span className="text-[13px] text-zinc-400">{label}</span>
      <div className="flex min-w-0 items-center gap-2.5">
        <label className="relative size-9 shrink-0 cursor-pointer overflow-hidden rounded-xl ring-1 ring-white/10">
          <span className="absolute inset-0" style={{ backgroundColor: safe }} />
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
        <Input
          aria-label={`${label} hex`}
          type="text"
          value={draft}
          spellCheck={false}
          maxLength={7}
          onChange={(e) => commitHex(e.target.value)}
          className="h-9 min-h-9 min-w-0 flex-1 rounded-xl border-zinc-800 bg-zinc-900/80 px-3 font-mono text-[13px] uppercase tracking-wide shadow-none dark:bg-zinc-900/80"
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
