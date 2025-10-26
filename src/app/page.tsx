"use client"

import { useEffect } from "react"
import { VisualizationCanvas } from "@/components/visualisation-canvas"
import { KeyboardShortcuts } from "@/components/keyboard-short"
import { BreadcrumbNavigation } from "@/components/breadcrumb"
import { NavigationControls } from "@/components/navigation-control"
import { useVisualizationStore } from "@/utils/visualisation-store"
import { sampleData } from "@/utils/sample"

export default function Home() {
  const { initializeData } = useVisualizationStore()

  useEffect(() => {
    initializeData(sampleData)
  }, [initializeData])

  return (
    <main className="w-full h-screen bg-background flex flex-col overflow-hidden">
      <KeyboardShortcuts />
      <BreadcrumbNavigation />
      <div className="flex flex-1 overflow-hidden">
        <NavigationControls />
        <VisualizationCanvas />
      </div>
    </main>
  )
}
