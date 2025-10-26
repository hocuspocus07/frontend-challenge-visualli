"use client"

import { useVisualizationStore } from "@/utils/visualisation-store"

export function BreadcrumbNavigation() {
  const { getLayerBreadcrumb, navigateToLayer, navigationHistory, isAnimating } = useVisualizationStore()

  const breadcrumbs = getLayerBreadcrumb()

  return (
    <nav
      className="flex items-center gap-1 px-4 py-3 bg-card border-b border-border overflow-x-auto scrollbar-hide"
      aria-label="Layer navigation breadcrumb"
    >
      {breadcrumbs.map((breadcrumb, index) => (
        <div key={breadcrumb.id} className="flex items-center gap-1 min-w-max">
          <button
            onClick={() => navigateToLayer(index)}
            disabled={isAnimating || index === breadcrumbs.length - 1}
            className={`px-3 py-1 rounded text-sm transition-all duration-200 truncate ${
              index === breadcrumbs.length - 1
                ? "bg-primary text-primary-foreground font-semibold"
                : "bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            aria-current={index === breadcrumbs.length - 1 ? "page" : undefined}
          >
            {breadcrumb.name}
          </button>

          {index < breadcrumbs.length - 1 && (
            <svg
              className="w-4 h-4 text-muted-foreground flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
        </div>
      ))}
    </nav>
  )
}
