import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react"
import { cn } from "@/lib/utils"

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null)
  const timer = useRef(null)

  const showToast = useCallback((message, type = "success") => {
    if (timer.current) window.clearTimeout(timer.current)
    setToast({ message, type, id: Date.now() })
    timer.current = window.setTimeout(() => setToast(null), 2200)
  }, [])

  const value = useMemo(() => ({ showToast }), [showToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-6 z-[100] flex justify-center px-4"
        aria-live="polite"
      >
        {toast && (
          <div
            key={toast.id}
            className={cn(
              "pointer-events-auto rounded-full border px-4 py-2 text-[13px] font-medium shadow-2xl backdrop-blur-md",
              toast.type === "error"
                ? "border-red-500/30 bg-red-950/90 text-red-100"
                : "border-white/10 bg-zinc-950/95 text-zinc-100"
            )}
          >
            {toast.message}
          </div>
        )}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error("useToast within ToastProvider")
  return ctx
}
