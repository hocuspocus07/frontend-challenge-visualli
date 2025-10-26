"use client"

import { useVisualizationStore } from "@/utils/visualisation-store"
import { useState } from "react"

export function NavigationControls() {
  const { navigationHistory, goHome, navigateToLayer, currentLayerId, layers, isAnimating } = useVisualizationStore()
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden sm:flex w-20 bg-card border-r border-border flex-col items-center py-6 gap-4 shadow-lg">
        {/* Home Button */}
        <button
          onClick={goHome}
          disabled={isAnimating}
          className="rounded-full w-12 h-12 flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
          title="Go to home layer (H)"
          aria-label="Navigate to home layer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-3m0 0l7-4 7 4M5 9v10a1 1 0 001 1h12a1 1 0 001-1V9m-9 11l4-4m0 0l4 4m-4-4v4"
            />
          </svg>
        </button>

        {/* Divider */}
        <div className="w-8 h-px bg-border" />

        {/* Layer Navigation Bubbles */}
        <div className="flex flex-col gap-3">
          {navigationHistory.map((layerId, index) => {
            const layer = layers[layerId]
            const isActive = layerId === currentLayerId

            return (
              <button
                key={layerId}
                onClick={() => navigateToLayer(index)}
                disabled={isAnimating}
                className={`w-10 h-10 rounded-full transition-all duration-300 flex items-center justify-center text-xs font-semibold ${
                  isActive
                    ? "ring-2 ring-primary bg-primary text-primary-foreground scale-110 shadow-md"
                    : "bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground hover:scale-105"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                title={`${layer?.name || `Layer ${index}`} (${index + 1})`}
                aria-label={`Navigate to ${layer?.name || `layer ${index}`}`}
                aria-current={isActive ? "page" : undefined}
              >
                {index + 1}
              </button>
            )
          })}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Info */}
        <div className="text-xs text-muted-foreground text-center px-2">
          <p className="font-semibold">{navigationHistory.length}</p>
          <p>layers</p>
        </div>
      </div>

      {/* Mobile Floating Controls */}
      <div className="sm:hidden fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        {/* Home Button */}
        <button
          onClick={goHome}
          disabled={isAnimating}
          className="rounded-full w-12 h-12 flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          title="Go to home layer"
          aria-label="Navigate to home layer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-3m0 0l7-4 7 4M5 9v10a1 1 0 001 1h12a1 1 0 001-1V9m-9 11l4-4m0 0l4 4m-4-4v4"
            />
          </svg>
        </button>

        {/* Navigation Buttons */}
        {navigationHistory.length > 1 && (
          <button
            onClick={() => navigateToLayer(Math.max(0, navigationHistory.length - 2))}
            disabled={isAnimating || navigationHistory.length <= 1}
            className="rounded-full w-12 h-12 flex items-center justify-center bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            title="Go back"
            aria-label="Navigate back"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
      </div>
    </>
  )
}
