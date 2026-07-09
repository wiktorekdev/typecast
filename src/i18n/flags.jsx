import React from "react"
import { cn } from "@/lib/utils"

/** Compact 3:2 country flags for the language picker */
export function Flag({ code, className, title }) {
  const Cmp = FLAGS[code]
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
      <Cmp />
    </span>
  )
}

function Frame({ children }) {
  return (
    <svg
      viewBox="0 0 24 16"
      width="100%"
      height="100%"
      className="block size-full"
      xmlns="http://www.w3.org/2000/svg"
    >
      {children}
    </svg>
  )
}

// English → US (common convention for “en” UIs)
function UsFlag() {
  return (
    <Frame>
      <rect width="24" height="16" fill="#b22234" />
      {[1, 3, 5, 7, 9, 11, 13].map((y) => (
        <rect key={y} y={y} width="24" height="1" fill="#fff" />
      ))}
      <rect width="10" height="8.5" fill="#3c3b6e" />
      {[
        [1.5, 1.2], [3.5, 1.2], [5.5, 1.2], [7.5, 1.2],
        [2.5, 2.6], [4.5, 2.6], [6.5, 2.6],
        [1.5, 4], [3.5, 4], [5.5, 4], [7.5, 4],
        [2.5, 5.4], [4.5, 5.4], [6.5, 5.4],
        [1.5, 6.8], [3.5, 6.8], [5.5, 6.8], [7.5, 6.8],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="0.45" fill="#fff" />
      ))}
    </Frame>
  )
}

function PlFlag() {
  return (
    <Frame>
      <rect width="24" height="8" fill="#fff" />
      <rect y="8" width="24" height="8" fill="#dc143c" />
    </Frame>
  )
}

function DeFlag() {
  return (
    <Frame>
      <rect width="24" height="5.34" fill="#000" />
      <rect y="5.34" width="24" height="5.33" fill="#dd0000" />
      <rect y="10.67" width="24" height="5.33" fill="#ffce00" />
    </Frame>
  )
}

function EsFlag() {
  return (
    <Frame>
      <rect width="24" height="16" fill="#c60b1e" />
      <rect y="4" width="24" height="8" fill="#ffc400" />
    </Frame>
  )
}

function FrFlag() {
  return (
    <Frame>
      <rect width="8" height="16" fill="#002395" />
      <rect x="8" width="8" height="16" fill="#fff" />
      <rect x="16" width="8" height="16" fill="#ed2939" />
    </Frame>
  )
}

function UaFlag() {
  return (
    <Frame>
      <rect width="24" height="8" fill="#0057b7" />
      <rect y="8" width="24" height="8" fill="#ffd700" />
    </Frame>
  )
}

const FLAGS = {
  us: UsFlag,
  pl: PlFlag,
  de: DeFlag,
  es: EsFlag,
  fr: FrFlag,
  ua: UaFlag,
}
