// @ts-nocheck
import { CircleNotch } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

export function Spinner({ className, ...props }: any) {
  return (
    <CircleNotch
      aria-label="Loading"
      className={cn("animate-spin", className)}
      role="status"
      weight="bold"
      {...props}
    />
  )
}
