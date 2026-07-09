import { useCallback, useSyncExternalStore } from "react"

/** Simple matchMedia hook — pass a full media query string */
export function useMediaQuery(query: string) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query)
      mql.addEventListener("change", onChange)
      return () => mql.removeEventListener("change", onChange)
    },
    [query]
  )

  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query])

  return useSyncExternalStore(subscribe, getSnapshot, () => false)
}

export function useIsNarrow() {
  return useMediaQuery("(max-width: 1023px)")
}
