import { Toaster, toast } from "sonner"

export type ToastType = "success" | "error"

export function showToast(message: string, type: ToastType = "success") {
  if (type === "error") {
    toast.error(message)
    return
  }
  toast.success(message)
}

/** Thin wrapper so call sites can keep `const { showToast } = useToast()` */
export function useToast() {
  return { showToast }
}

export function AppToaster() {
  return (
    <Toaster
      theme="dark"
      position="bottom-center"
      toastOptions={{
        classNames: {
          toast:
            "rounded-full border border-white/10 bg-zinc-950/95 text-zinc-100 shadow-2xl backdrop-blur-md",
          error: "border-red-500/30 bg-red-950/90 text-red-100",
          success: "border-white/10 bg-zinc-950/95 text-zinc-100",
          title: "text-[13px] font-medium",
        },
      }}
    />
  )
}
