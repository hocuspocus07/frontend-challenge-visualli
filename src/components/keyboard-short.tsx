"use client"

import { useEffect, useState } from "react"
import { useVisualizationStore } from "@/utils/visualisation-store"

export function KeyboardShortcuts() {
  const { goHome, zoomOut, navigationHistory } = useVisualizationStore()
  const [canvasEl, setCanvasEl] = useState<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const el = document.getElementById("visualization-canvas")
    if (el instanceof HTMLCanvasElement) {
      setCanvasEl(el)
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      if (!canvasEl) return

      switch (e.key.toLowerCase()) {
        case "h":
          e.preventDefault()
          goHome()
          break
        case "escape":
        case "arrowup":
          e.preventDefault()
          if (navigationHistory.length > 1) {
            //pass the required canvas dimensions to zoomOut
            zoomOut(canvasEl.offsetWidth, canvasEl.offsetHeight)
          }
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [goHome, zoomOut, navigationHistory.length, canvasEl])

  return null
}