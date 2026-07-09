import React, { useCallback, useEffect, useRef, useState } from "react"
import {
  CornersOut,
  DownloadSimple,
  MagnifyingGlassMinus,
  MagnifyingGlassPlus,
  UploadSimple,
} from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

const MIN_VIEW = 0.15
const MAX_VIEW = 8
const ZOOM_STEP = 1.12

function clampView(z) {
  return Math.min(MAX_VIEW, Math.max(MIN_VIEW, z))
}

function FloatingBarButton({ onClick, disabled, title, children, className }) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium text-zinc-200 transition",
        "hover:bg-white/10 disabled:pointer-events-none disabled:opacity-40",
        className
      )}
    >
      {children}
    </button>
  )
}

/**
 * viewZoom is relative to "fit":
 * 1 = 100% fitted to viewport
 * Display size = natural * fitScale * viewZoom  (width/height resize, NOT CSS scale —
 * CSS scale() on large bitmaps breaks when zoomed out).
 */
export function StageViewport({
  previewUrl,
  bgColor,
  rendering,
  fitKey,
  onOpenExport,
  exportOpen,
  onReplace,
  hasImage,
}) {
  const viewportRef = useRef(null)
  const imgRef = useRef(null)
  const [viewZoom, setViewZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [fitScale, setFitScale] = useState(1)
  const [imgSize, setImgSize] = useState({ w: 0, h: 0 })
  const [dragging, setDragging] = useState(false)
  const [spaceHeld, setSpaceHeld] = useState(false)
  const dragStart = useRef(null)
  const naturalSize = useRef({ w: 0, h: 0 })
  const viewZoomRef = useRef(viewZoom)
  const panRef = useRef(pan)
  const fitScaleRef = useRef(fitScale)
  const shouldResetView = useRef(true)
  const lastFitKey = useRef(fitKey)

  useEffect(() => {
    viewZoomRef.current = viewZoom
  }, [viewZoom])

  useEffect(() => {
    panRef.current = pan
  }, [pan])

  useEffect(() => {
    fitScaleRef.current = fitScale
  }, [fitScale])

  useEffect(() => {
    if (fitKey !== lastFitKey.current) {
      lastFitKey.current = fitKey
      shouldResetView.current = true
    }
  }, [fitKey])

  const computeFitScale = useCallback(() => {
    const vp = viewportRef.current
    const { w, h } = naturalSize.current
    if (!vp || !w || !h) return 1
    const pad = 80
    return Math.min(
      (vp.clientWidth - pad) / w,
      (vp.clientHeight - pad) / h
    )
  }, [])

  const resetToFit = useCallback(() => {
    const fs = computeFitScale()
    setFitScale(fs)
    fitScaleRef.current = fs
    setViewZoom(1)
    setPan({ x: 0, y: 0 })
  }, [computeFitScale])

  const onImageLoad = useCallback(
    (e) => {
      const w = e.currentTarget.naturalWidth
      const h = e.currentTarget.naturalHeight
      naturalSize.current = { w, h }
      setImgSize({ w, h })
      if (shouldResetView.current) {
        shouldResetView.current = false
        resetToFit()
      } else {
        const fs = computeFitScale()
        setFitScale(fs)
        fitScaleRef.current = fs
      }
    },
    [resetToFit, computeFitScale]
  )

  useEffect(() => {
    if (!previewUrl) return
    const id = window.requestAnimationFrame(() => {
      const img = imgRef.current
      if (img?.naturalWidth) {
        const w = img.naturalWidth
        const h = img.naturalHeight
        naturalSize.current = { w, h }
        setImgSize({ w, h })
        if (shouldResetView.current) {
          shouldResetView.current = false
          resetToFit()
        } else {
          const fs = computeFitScale()
          setFitScale(fs)
          fitScaleRef.current = fs
        }
      }
    })
    return () => window.cancelAnimationFrame(id)
  }, [previewUrl, resetToFit, computeFitScale])

  // recompute fit on resize without jumping user zoom
  useEffect(() => {
    const vp = viewportRef.current
    if (!vp) return
    const ro = new ResizeObserver(() => {
      const fs = computeFitScale()
      setFitScale(fs)
      fitScaleRef.current = fs
    })
    ro.observe(vp)
    return () => ro.disconnect()
  }, [computeFitScale, hasImage])

  const zoomAt = useCallback((nextView, clientX, clientY) => {
    const vp = viewportRef.current
    const prev = viewZoomRef.current
    const next = clampView(nextView)
    if (!vp) {
      setViewZoom(next)
      return
    }
    const rect = vp.getBoundingClientRect()
    const cx = clientX - rect.left - rect.width / 2
    const cy = clientY - rect.top - rect.height / 2
    // keep point under cursor stable when display size changes
    const ratio = next / (prev || 1)
    setViewZoom(next)
    setPan({
      x: Math.round(cx - (cx - panRef.current.x) * ratio),
      y: Math.round(cy - (cy - panRef.current.y) * ratio),
    })
  }, [])

  const zoomBy = useCallback(
    (factor, clientX, clientY) => {
      const vp = viewportRef.current
      if (!vp) {
        setViewZoom((z) => clampView(z * factor))
        return
      }
      const rect = vp.getBoundingClientRect()
      const x = clientX ?? rect.left + rect.width / 2
      const y = clientY ?? rect.top + rect.height / 2
      zoomAt(viewZoomRef.current * factor, x, y)
    },
    [zoomAt]
  )

  useEffect(() => {
    const vp = viewportRef.current
    if (!vp) return

    const onWheel = (e) => {
      e.preventDefault()
      const intensity = Math.min(Math.abs(e.deltaY) / 100, 2.5)
      const factor =
        e.deltaY > 0
          ? 1 / Math.pow(ZOOM_STEP, intensity)
          : Math.pow(ZOOM_STEP, intensity)
      zoomAt(viewZoomRef.current * factor, e.clientX, e.clientY)
    }

    vp.addEventListener("wheel", onWheel, { passive: false })
    return () => vp.removeEventListener("wheel", onWheel)
  }, [zoomAt])

  useEffect(() => {
    const onKeyDown = (e) => {
      if (
        e.code === "Space" &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement)
      ) {
        e.preventDefault()
        setSpaceHeld(true)
      }
      if ((e.metaKey || e.ctrlKey) && (e.key === "=" || e.key === "+")) {
        e.preventDefault()
        zoomBy(ZOOM_STEP)
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "-") {
        e.preventDefault()
        zoomBy(1 / ZOOM_STEP)
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "0") {
        e.preventDefault()
        resetToFit()
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "1") {
        e.preventDefault()
        // 100% of fitted view
        setViewZoom(1)
        setPan({ x: 0, y: 0 })
      }
    }
    const onKeyUp = (e) => {
      if (e.code === "Space") setSpaceHeld(false)
    }
    window.addEventListener("keydown", onKeyDown)
    window.addEventListener("keyup", onKeyUp)
    return () => {
      window.removeEventListener("keydown", onKeyDown)
      window.removeEventListener("keyup", onKeyUp)
    }
  }, [zoomBy, resetToFit])

  const onPointerDown = (e) => {
    if (e.button !== 0 && e.button !== 1) return
    e.currentTarget.setPointerCapture(e.pointerId)
    setDragging(true)
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      panX: panRef.current.x,
      panY: panRef.current.y,
    }
  }

  const onPointerMove = (e) => {
    if (!dragStart.current) return
    setPan({
      x: Math.round(dragStart.current.panX + (e.clientX - dragStart.current.x)),
      y: Math.round(dragStart.current.panY + (e.clientY - dragStart.current.y)),
    })
  }

  const onPointerUp = (e) => {
    dragStart.current = null
    setDragging(false)
    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch {
      /* already released */
    }
  }

  const absScale = fitScale * viewZoom
  const zoomPct = Math.round(viewZoom * 100)
  const dispW = imgSize.w > 0 ? Math.max(1, Math.round(imgSize.w * absScale)) : undefined
  const dispH = imgSize.h > 0 ? Math.max(1, Math.round(imgSize.h * absScale)) : undefined
  // smooth when smaller than 1:1 source px; crisp only when enlarging
  const enlarge = absScale > 1.02

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div
        ref={viewportRef}
        className={cn(
          "relative min-h-0 flex-1 overflow-hidden touch-none",
          dragging || spaceHeld ? "cursor-grabbing" : "cursor-grab"
        )}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onDoubleClick={resetToFit}
      >
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px)`,
            }}
          >
            {previewUrl ? (
              <img
                ref={imgRef}
                src={previewUrl}
                alt="Typecast preview"
                draggable={false}
                onLoad={onImageLoad}
                width={dispW}
                height={dispH}
                className="block max-w-none select-none"
                style={{
                  width: dispW ? `${dispW}px` : "auto",
                  height: dispH ? `${dispH}px` : "auto",
                  backgroundColor: bgColor,
                  // browser bilinear downsample when zoomed out; pixel grid when zoomed in
                  imageRendering: enlarge ? "pixelated" : "auto",
                }}
              />
            ) : (
              <p className="text-[13px] text-zinc-500">Generating…</p>
            )}
          </div>
        </div>

        {rendering && (
          <span className="pointer-events-none absolute left-4 top-4 rounded-full bg-zinc-950/80 px-3 py-1 text-[12px] text-zinc-400 ring-1 ring-zinc-800">
            Updating…
          </span>
        )}
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-5 z-20 flex justify-center px-4">
        <div className="pointer-events-auto flex max-w-full items-center gap-0.5 rounded-full border border-white/10 bg-zinc-950/90 p-1 shadow-2xl shadow-black/50 backdrop-blur-md">
          <button
            type="button"
            onClick={resetToFit}
            title="Zoom (click to fit)"
            className="inline-flex h-9 min-w-[3.5rem] items-center justify-center rounded-full px-2.5 font-mono text-[12px] tabular-nums text-zinc-300 transition hover:bg-white/10"
          >
            {zoomPct}%
          </button>

          <FloatingBarButton
            title="Zoom out"
            onClick={() => zoomBy(1 / ZOOM_STEP)}
            className="px-2.5"
          >
            <MagnifyingGlassMinus weight="bold" className="size-4" />
          </FloatingBarButton>

          <FloatingBarButton
            title="Zoom in"
            onClick={() => zoomBy(ZOOM_STEP)}
            className="px-2.5"
          >
            <MagnifyingGlassPlus weight="bold" className="size-4" />
          </FloatingBarButton>

          <div className="mx-1 h-5 w-px shrink-0 bg-white/10" />

          <FloatingBarButton title="Fit" onClick={resetToFit} className="px-2.5">
            <CornersOut weight="bold" className="size-4" />
            <span className="hidden sm:inline">Fit</span>
          </FloatingBarButton>

          {hasImage && (
            <>
              <div className="mx-1 h-5 w-px shrink-0 bg-white/10" />
              <FloatingBarButton title="Replace image" onClick={onReplace}>
                <UploadSimple weight="bold" className="size-4" />
                <span className="hidden sm:inline">Replace</span>
              </FloatingBarButton>
            </>
          )}

          <button
            type="button"
            disabled={!hasImage}
            onClick={onOpenExport}
            className={cn(
              "ml-0.5 inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-[13px] font-semibold transition",
              exportOpen
                ? "bg-zinc-100 text-zinc-950"
                : "bg-white text-zinc-950 hover:bg-zinc-100",
              "disabled:pointer-events-none disabled:opacity-40"
            )}
          >
            <DownloadSimple weight="bold" className="size-4" />
            Export
          </button>
        </div>
      </div>
    </div>
  )
}
