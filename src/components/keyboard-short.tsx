"use client"

import { useEffect } from "react"
import { useVisualizationStore } from "@/utils/visualisation-store"

export function KeyboardShortcuts() {
  const { goHome, zoomOut, navigationHistory } = useVisualizationStore()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      switch (e.key.toLowerCase()) {
        case "h":
          e.preventDefault()
          goHome()
          break
        case "escape":
          e.preventDefault()
          if (navigationHistory.length > 1) {
            zoomOut()
          }
          break
        case "arrowup":
          e.preventDefault()
          if (navigationHistory.length > 1) {
            zoomOut()
          }
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [goHome, zoomOut, navigationHistory.length])

  return null
}
