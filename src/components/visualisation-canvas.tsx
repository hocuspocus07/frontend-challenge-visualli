"use client"

import { useEffect, useRef } from "react"
import { useVisualizationStore } from "@/utils/visualisation-store"
import { renderLayer } from "@/utils/canvas-renderer"

export function VisualizationCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  //refs for mouse and general state
  const isDraggingRef = useRef(false)
  const lastPosRef = useRef({ x: 0, y: 0 })
  const spaceKeyRef = useRef(false)

  //refs specifically for touch events
  const initialPinchDistanceRef = useRef(0)
  const lastTouchPosRef = useRef({ x: 0, y: 0 })
  const touchActionRef = useRef<"pan" | "zoom" | null>(null)


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
  } = useVisualizationStore()

  //initialize canvas and handle resize
  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const resizeObserver = new ResizeObserver(() => {
      const rect = container.getBoundingClientRect()
      canvas.width = rect.width * window.devicePixelRatio
      canvas.height = rect.height * window.devicePixelRatio
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`
    })

    resizeObserver.observe(container)
    return () => resizeObserver.disconnect()
  }, [])

  //render canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const currentLayer = layers[currentLayerId]
    if (!currentLayer) return

    ctx.save()
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    ctx.fillStyle = currentLayer.backgroundColor || "#ffffff"
    ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)

    ctx.translate(canvasTransform.x, canvasTransform.y)
    ctx.scale(canvasTransform.scaleX, canvasTransform.scaleY)

    renderLayer(ctx, currentLayer.nodes, canvas.offsetWidth, canvas.offsetHeight)

    ctx.restore()
  }, [currentLayerId, layers, canvasTransform])

  //automatic zoom-in logic (works for both mouse and touch)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || isAnimating) return

    const currentLayer = layers[currentLayerId]
    if (!currentLayer) return

    const minCanvasDim = Math.min(canvas.offsetWidth, canvas.offsetHeight)
    
    const viewportCenterX = (canvas.offsetWidth / 2 - canvasTransform.x) / canvasTransform.scaleX
    const viewportCenterY = (canvas.offsetHeight / 2 - canvasTransform.y) / canvasTransform.scaleY

    let bestCandidate = null
    let minDistance = Infinity

    for (const node of currentLayer.nodes) {
      if (node.childLayerId) {
        const apparentDiameter = node.radius * minCanvasDim * 2 * canvasTransform.scaleX

        if (apparentDiameter > canvas.offsetWidth * 0.9) {
          const nodeX = node.x * canvas.offsetWidth
          const nodeY = node.y * canvas.offsetHeight
          const distance = Math.hypot(viewportCenterX - nodeX, viewportCenterY - nodeY)

          if (distance < minDistance) {
            minDistance = distance
            bestCandidate = node
          }
        }
      }
    }

    if (bestCandidate) {
      zoomIn(bestCandidate, canvas.offsetWidth, canvas.offsetHeight)
    }
  }, [canvasTransform, currentLayerId, layers, isAnimating, zoomIn])


  //handle mouse wheel zoom
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      if (isAnimating) return

      const rect = canvas.getBoundingClientRect()
      const pointerX = e.clientX - rect.left
      const pointerY = e.clientY - rect.top
      const scaleBy = 1.3

      animateZoom(e.deltaY < 0 ? canvasTransform.scaleX * scaleBy : canvasTransform.scaleX / scaleBy, pointerX, pointerY, 200)
    }

    canvas.addEventListener("wheel", handleWheel, { passive: false })
    return () => canvas.removeEventListener("wheel", handleWheel)
  }, [canvasTransform.scaleX, animateZoom, isAnimating])

  //handle canvas panning (Mouse)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handleMouseDown = (e: MouseEvent) => {
      if ((e.button === 1 || (spaceKeyRef.current && e.button === 0)) && !isAnimating) {
        isDraggingRef.current = true
        lastPosRef.current = { x: e.clientX, y: e.clientY }
        canvas.style.cursor = "grabbing"
      }
    }
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return
      pan(e.clientX - lastPosRef.current.x, e.clientY - lastPosRef.current.y)
      lastPosRef.current = { x: e.clientX, y: e.clientY }
    }
    const handleMouseUp = () => {
      isDraggingRef.current = false
      canvas.style.cursor = spaceKeyRef.current ? "grab" : "default"
    }
    const handleKeyDown = (e: KeyboardEvent) => { if (e.code === "Space" && !isDraggingRef.current) { spaceKeyRef.current = true; canvas.style.cursor = "grab" } }
    const handleKeyUp = (e: KeyboardEvent) => { if (e.code === "Space") { spaceKeyRef.current = false; if (!isDraggingRef.current) canvas.style.cursor = "default" } }

    canvas.addEventListener("mousedown", handleMouseDown)
    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)
    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown)
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [pan, isAnimating])

  //handle Touch Events (Mobile)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handleTouchStart = (e: TouchEvent) => {
        e.preventDefault()
        if (isAnimating) return;

        if (e.touches.length === 2) { //pinch
            touchActionRef.current = "zoom";
            const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
            initialPinchDistanceRef.current = dist;
        } else if (e.touches.length === 1) { //panning
            touchActionRef.current = "pan";
            lastTouchPosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }
    }

    const handleTouchMove = (e: TouchEvent) => {
        e.preventDefault()
        if (isAnimating) return;

        if (e.touches.length === 2 && touchActionRef.current === "zoom") { //pinch
            const newDist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
            const scaleMultiplier = newDist / initialPinchDistanceRef.current;
            const newScale = canvasTransform.scaleX * scaleMultiplier;

            const rect = canvas.getBoundingClientRect();
            const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left;
            const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top;

            setZoom(newScale, centerX, centerY);
            initialPinchDistanceRef.current = newDist;

        } else if (e.touches.length === 1 && touchActionRef.current === "pan") { //panning
            const touch = e.touches[0];
            const dx = touch.clientX - lastTouchPosRef.current.x;
            const dy = touch.clientY - lastTouchPosRef.current.y;
            pan(dx, dy);
            lastTouchPosRef.current = { x: touch.clientX, y: touch.clientY };
        }
    }

    const handleTouchEnd = () => {
        touchActionRef.current = null;
        initialPinchDistanceRef.current = 0;
    }

    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd);
    canvas.addEventListener('touchcancel', handleTouchEnd);

    return () => {
        canvas.removeEventListener('touchstart', handleTouchStart);
        canvas.removeEventListener('touchmove', handleTouchMove);
        canvas.removeEventListener('touchend', handleTouchEnd);
        canvas.removeEventListener('touchcancel', handleTouchEnd);
    }
}, [pan, isAnimating, setZoom, canvasTransform.scaleX]);

  //handle right-click zoom out
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
      zoomOut(canvas.offsetWidth, canvas.offsetHeight)
    }
    canvas.addEventListener("contextmenu", handleContextMenu)
    return () => canvas.removeEventListener("contextmenu", handleContextMenu)
  }, [zoomOut])

  //handle node clicks
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handleCanvasClick = (e: MouseEvent) => {
      if (isAnimating || e.button !== 0) return

      const rect = canvas.getBoundingClientRect()
      const clickX = e.clientX - rect.left
      const clickY = e.clientY - rect.top

      const canvasX = (clickX - canvasTransform.x) / canvasTransform.scaleX
      const canvasY = (clickY - canvasTransform.y) / canvasTransform.scaleY

      const currentLayer = layers[currentLayerId]
      if (!currentLayer) return

      const minCanvasDim = Math.min(canvas.offsetWidth, canvas.offsetHeight)

      for (const node of [...currentLayer.nodes].reverse()) {
        const nodeX = node.x * canvas.offsetWidth
        const nodeY = node.y * canvas.offsetHeight
        const nodeRadius = node.radius * minCanvasDim

        const distance = Math.hypot(canvasX - nodeX, canvasY - nodeY)

        if (distance <= nodeRadius && node.childLayerId) {
          zoomIn(node, canvas.offsetWidth, canvas.offsetHeight)
          break
        }
      }
    }

    canvas.addEventListener("click", handleCanvasClick)
    return () => canvas.removeEventListener("click", handleCanvasClick)
  }, [currentLayerId, layers, canvasTransform, zoomIn, isAnimating])

  return (
    <div
      ref={containerRef}
      className="flex-1 relative overflow-hidden transition-colors duration-500 ease-in-out"
      style={{ backgroundColor: canvasStyle.backgroundColor }}
    >
      <canvas ref={canvasRef} id="visualization-canvas" className="absolute top-0 left-0 w-full h-full" />
    </div>
  )
}