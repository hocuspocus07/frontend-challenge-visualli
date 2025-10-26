"use client"

import { useEffect, useRef } from "react"
import { useVisualizationStore } from "@/utils/visualisation-store"
import { renderLayer } from "@/utils/canvas-renderer"

export function VisualizationCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const animationFrameRef = useRef<number | null>(null)
  const isDraggingRef = useRef(false)
  const lastPosRef = useRef({ x: 0, y: 0 })
  const spaceKeyRef = useRef(false)

  const { currentLayerId, layers, canvasTransform, animateZoom, isAnimating, pan } = useVisualizationStore()

  //initialize canvas and handle resize
  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = rect.height
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    return () => window.removeEventListener("resize", resizeCanvas)
  }, [])

  //render canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const currentLayer = layers[currentLayerId]
    if (!currentLayer) return

    //clear canvas
    ctx.fillStyle = currentLayer.backgroundColor || "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    //save context state
    ctx.save()

    //apply transforms
    ctx.translate(canvasTransform.x, canvasTransform.y)
    ctx.scale(canvasTransform.scaleX, canvasTransform.scaleY)

    //render nodes
    renderLayer(ctx, currentLayer, canvas.width, canvas.height, canvasTransform)

    //restore context state
    ctx.restore()
  }, [currentLayerId, layers, canvasTransform])

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
      const oldScale = canvasTransform.scaleX

      if (e.deltaY < 0) {
        const newScale = oldScale * scaleBy
        animateZoom(newScale, pointerX, pointerY, 200)
      } else {
        const newScale = oldScale / scaleBy
        animateZoom(newScale, pointerX, pointerY, 200)
      }
    }

    canvas.addEventListener("wheel", handleWheel, { passive: false })
    return () => canvas.removeEventListener("wheel", handleWheel)
  }, [canvasTransform, animateZoom, isAnimating])

  //handle canvas panning
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handleMouseDown = (e: MouseEvent) => {
      const isMiddleClick = e.button === 1
      const isSpaceClick = spaceKeyRef.current && e.button === 0

      if (isMiddleClick || isSpaceClick) {
        isDraggingRef.current = true
        lastPosRef.current = { x: e.clientX, y: e.clientY }
        canvas.style.cursor = "grabbing"
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return

      const dx = e.clientX - lastPosRef.current.x
      const dy = e.clientY - lastPosRef.current.y

      pan(dx, dy)
      lastPosRef.current = { x: e.clientX, y: e.clientY }
    }

    const handleMouseUp = () => {
      isDraggingRef.current = false
      canvas.style.cursor = "default"
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        spaceKeyRef.current = true
        canvas.style.cursor = "grab"
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        spaceKeyRef.current = false
        canvas.style.cursor = "default"
        isDraggingRef.current = false
      }
    }

    canvas.addEventListener("mousedown", handleMouseDown)
    canvas.addEventListener("mousemove", handleMouseMove)
    canvas.addEventListener("mouseup", handleMouseUp)
    document.addEventListener("keydown", handleKeyDown)
    document.addEventListener("keyup", handleKeyUp)

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown)
      canvas.removeEventListener("mousemove", handleMouseMove)
      canvas.removeEventListener("mouseup", handleMouseUp)
      document.removeEventListener("keydown", handleKeyDown)
      document.removeEventListener("keyup", handleKeyUp)
    }
  }, [pan])

  //handle right-click zoom out
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const { zoomOut } = useVisualizationStore.getState()

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
      zoomOut()
    }

    canvas.addEventListener("contextmenu", handleContextMenu)
    return () => canvas.removeEventListener("contextmenu", handleContextMenu)
  }, [])

  //handle node clicks
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const { zoomIn } = useVisualizationStore.getState()
    const currentLayer = layers[currentLayerId]
    if (!currentLayer) return

    const handleCanvasClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const clickX = e.clientX - rect.left
      const clickY = e.clientY - rect.top

      //transform click coordinates back to canvas space
      const canvasX = (clickX - canvasTransform.x) / canvasTransform.scaleX
      const canvasY = (clickY - canvasTransform.y) / canvasTransform.scaleY

      //check if click is on a node
      for (const node of currentLayer.nodes) {
        const distance = Math.sqrt((canvasX - node.x) ** 2 + (canvasY - node.y) ** 2)
        if (distance <= node.radius && node.childLayerId) {
          zoomIn(node.id)
          break
        }
      }
    }

    canvas.addEventListener("click", handleCanvasClick)
    return () => canvas.removeEventListener("click", handleCanvasClick)
  }, [currentLayerId, layers, canvasTransform])

  return (
    <div
      ref={containerRef}
      className="flex-1 relative overflow-hidden"
      style={{
        backgroundColor: layers[currentLayerId]?.backgroundColor || "#ffffff",
      }}
    >
      <canvas ref={canvasRef} className="w-full h-full block" style={{ display: "block" }} />
    </div>
  )
}
