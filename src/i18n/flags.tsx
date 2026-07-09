import { DE, ES, FR, PL, UA, US } from "country-flag-icons/react/3x2"
import { cn } from "@/lib/utils"
import type { FlagCode } from "./messages"

const FLAGS = {
  us: US,
  pl: PL,
  de: DE,
  es: ES,
  fr: FR,
  ua: UA,
} as const satisfies Record<FlagCode, typeof US>

type FlagProps = {
  code: FlagCode | string
  className?: string
  title?: string
}

/** Compact 3:2 flags via country-flag-icons */
export function Flag({ code, className, title }: FlagProps) {
  const Cmp = FLAGS[code as FlagCode]
  if (!Cmp) return null
  return (
    <span
      title={title}
      className={cn(
        "inline-flex shrink-0 overflow-hidden rounded-[3px] ring-1 ring-black/20 dark:ring-white/15",
        className
      )}
      aria-hidden
    >
      <Cmp className="block size-full" />
    </span>
  )
}
