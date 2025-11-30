"use client"

import { useEffect, useRef } from "react"
import { useVisualizationStore } from "@/utils/visualisation-store"
import { renderLayer } from "@/utils/canvas-renderer"

export function VisualizationCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const isDragging = useRef(false)
  const lastPos = useRef({ x: 0, y: 0 })
  const pinchStart = useRef(0)

  const {
    currentLayerId,
    layers,
    canvasTransform,
    animateZoom,
    isAnimating,
    pan,
    zoomIn,
    zoomOut,
    setZoom,
    canvasStyle,
    navigationHistory,
  } = useVisualizationStore()

  // constants for auto zoom behaviour
  const AUTO_IN_FRAC = 0.45
  const AUTO_OUT_SCALE = 0.6
  const COOLDOWN = 900
  const lastAutoOut = useRef(0)
  const prevNavLen = useRef(navigationHistory?.length || 0)

  // Resize canvas to DPR-correct dimensions
  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return
    const ro = new ResizeObserver(() => {
      const r = container.getBoundingClientRect()
      canvas.width = r.width * devicePixelRatio
      canvas.height = r.height * devicePixelRatio
      canvas.style.width = `${r.width}px`
      canvas.style.height = `${r.height}px`
    })
    ro.observe(container)
    return () => ro.disconnect()
  }, [])

  // Render active layer
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const layer = layers[currentLayerId]
    if (!layer) return

    const w = canvas.offsetWidth
    const h = canvas.offsetHeight

    ctx.save()
    ctx.scale(devicePixelRatio, devicePixelRatio)
    ctx.fillStyle = layer.backgroundColor || "#ffffff"
    ctx.fillRect(0, 0, w, h)
    ctx.translate(canvasTransform.x, canvasTransform.y)
    ctx.scale(canvasTransform.scaleX, canvasTransform.scaleY)
    renderLayer(ctx, layer.nodes, w, h)
    ctx.restore()
  }, [currentLayerId, layers, canvasTransform])

  // Auto-zoom-in (centered, picks best candidate)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || isAnimating) return
    const layer = layers[currentLayerId]
    if (!layer) return
    const w = canvas.offsetWidth
    const h = canvas.offsetHeight
    const minDim = Math.min(w, h)
    const cx = (w / 2 - canvasTransform.x) / canvasTransform.scaleX
    const cy = (h / 2 - canvasTransform.y) / canvasTransform.scaleY
    let best: any = null
    let bestDist = Infinity
    for (const n of layer.nodes) {
      if (!n.childLayerId) continue
      const diameter = n.radius * minDim * 2 * canvasTransform.scaleX
      if (diameter < w * AUTO_IN_FRAC) continue
      const nx = n.x * w
      const ny = n.y * h
      const d = Math.hypot(cx - nx, cy - ny)
      if (d < bestDist) { bestDist = d; best = n }
    }
    if (best && Date.now() - lastAutoOut.current > COOLDOWN) zoomIn(best, w, h)
  }, [canvasTransform, currentLayerId, layers, isAnimating, zoomIn])

  // Auto zoom-out on scale threshold (only when inside child)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || isAnimating) return
    if (!navigationHistory || navigationHistory.length <= 1) return
    if (canvasTransform.scaleX < AUTO_OUT_SCALE && Date.now() - lastAutoOut.current > COOLDOWN) {
      zoomOut(canvas.offsetWidth, canvas.offsetHeight)
      lastAutoOut.current = Date.now()
    }
  }, [canvasTransform.scaleX, navigationHistory, isAnimating, zoomOut])

  // Recognize programmatic zoom-outs and set cooldown
  useEffect(() => {
    const current = navigationHistory?.length || 0
    if (current < prevNavLen.current) lastAutoOut.current = Date.now()
    prevNavLen.current = current
  }, [navigationHistory])

  // Wheel zoom (animate)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      if (isAnimating) return
      const rect = canvas.getBoundingClientRect()
      const scaleBy = 1.3
      const target = e.deltaY < 0 ? canvasTransform.scaleX * scaleBy : canvasTransform.scaleX / scaleBy
      animateZoom(target, e.clientX - rect.left, e.clientY - rect.top, 200)
    }
    canvas.addEventListener("wheel", onWheel, { passive: false })
    return () => canvas.removeEventListener("wheel", onWheel)
  }, [canvasTransform, animateZoom, isAnimating])

  // Middle-mouse pan
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const onMouseDown = (e: MouseEvent) => { if (e.button !== 1 || isAnimating) return; isDragging.current = true; lastPos.current = { x: e.clientX, y: e.clientY }; canvas.style.cursor = "grabbing" }
    const onMouseMove = (e: MouseEvent) => { if (!isDragging.current) return; pan(e.clientX - lastPos.current.x, e.clientY - lastPos.current.y); lastPos.current = { x: e.clientX, y: e.clientY } }
    const onMouseUp = () => { isDragging.current = false; canvas.style.cursor = "default" }
    canvas.addEventListener("mousedown", onMouseDown)
    window.addEventListener("mousemove", onMouseMove)
    window.addEventListener("mouseup", onMouseUp)
    return () => { canvas.removeEventListener("mousedown", onMouseDown); window.removeEventListener("mousemove", onMouseMove); window.removeEventListener("mouseup", onMouseUp) }
  }, [pan, isAnimating])

  // Touch pan & pinch
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const onStart = (e: TouchEvent) => {
      e.preventDefault(); if (isAnimating) return
      if (e.touches.length === 2) { pinchStart.current = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY) }
      else { lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY } }
    }
    const onMove = (e: TouchEvent) => {
      e.preventDefault(); if (isAnimating) return
      if (e.touches.length === 2) {
        const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY)
        const rect = canvas.getBoundingClientRect()
        const centerX = ((e.touches[0].clientX + e.touches[1].clientX) / 2) - rect.left
        const centerY = ((e.touches[0].clientY + e.touches[1].clientY) / 2) - rect.top
        const targetScale = canvasTransform.scaleX * (dist / pinchStart.current)
        setZoom(Math.max(0.1, Math.min(targetScale, 10)), centerX, centerY)
        pinchStart.current = dist
      } else if (e.touches.length === 1) {
        const t = e.touches[0]
        pan(t.clientX - lastPos.current.x, t.clientY - lastPos.current.y)
        lastPos.current = { x: t.clientX, y: t.clientY }
      }
    }
    const onEnd = () => { pinchStart.current = 0 }
    canvas.addEventListener("touchstart", onStart, { passive: false }); canvas.addEventListener("touchmove", onMove, { passive: false }); canvas.addEventListener("touchend", onEnd); canvas.addEventListener("touchcancel", onEnd)
    return () => { canvas.removeEventListener("touchstart", onStart); canvas.removeEventListener("touchmove", onMove); canvas.removeEventListener("touchend", onEnd); canvas.removeEventListener("touchcancel", onEnd) }
  }, [pan, setZoom, canvasTransform, isAnimating])

  // Right-click to zoom out
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const onContext = (e: MouseEvent) => { e.preventDefault(); zoomOut(canvas.offsetWidth, canvas.offsetHeight) }
    canvas.addEventListener("contextmenu", onContext)
    return () => canvas.removeEventListener("contextmenu", onContext)
  }, [zoomOut])

  // Click to zoom in on node
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const onClick = (e: MouseEvent) => {
      if (isAnimating || e.button !== 0) return
      const rect = canvas.getBoundingClientRect()
      const clickX = e.clientX - rect.left
      const clickY = e.clientY - rect.top
      const canvasX = (clickX - canvasTransform.x) / canvasTransform.scaleX
      const canvasY = (clickY - canvasTransform.y) / canvasTransform.scaleY
      const layer = layers[currentLayerId]
      if (!layer) return
      const minDim = Math.min(canvas.offsetWidth, canvas.offsetHeight)
      for (const node of [...layer.nodes].reverse()) {
        const nx = node.x * canvas.offsetWidth
        const ny = node.y * canvas.offsetHeight
        const nr = node.radius * minDim
        if (Math.hypot(canvasX - nx, canvasY - ny) <= nr && node.childLayerId) { zoomIn(node, canvas.offsetWidth, canvas.offsetHeight); break }
      }
    }
    canvas.addEventListener("click", onClick)
    return () => canvas.removeEventListener("click", onClick)
  }, [layers, currentLayerId, canvasTransform, zoomIn, isAnimating])

  return (
    <div ref={containerRef} className="flex-1 relative overflow-hidden transition-colors duration-500 ease-in-out" style={{ backgroundColor: canvasStyle.backgroundColor }}>
      <canvas ref={canvasRef} id="visualization-canvas" className="absolute top-0 left-0 w-full h-full" />
    </div>
  )
}