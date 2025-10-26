import { create } from "zustand"
import { animate,cancelAnimation } from "./animation"

export interface CanvasNode {
  id: string
  name: string
  x: number
  y: number
  radius: number
  color: string
  childLayerId?: string
}

export interface CanvasLayer {
  id: string
  name: string
  backgroundColor: string
  nodes: CanvasNode[]
  parentNodeId?: string
}

export interface VisualizationConfig {
  canvasStyle: {
    width: number
    height: number
    backgroundColor: string
  }
  layers: Record<string, CanvasLayer>
  rootLayerId: string
}

interface CanvasTransform {
  scaleX: number
  scaleY: number
  x: number
  y: number
}

interface VisualizationState {
  config: VisualizationConfig | null
  layers: Record<string, CanvasLayer>
  currentLayerId: string
  navigationHistory: string[]
  canvasStyle: VisualizationConfig["canvasStyle"]

  canvasTransform: CanvasTransform
  layerTransforms: Record<string, CanvasTransform>
  isAnimating: boolean

  // Actions
  initializeData: (config: VisualizationConfig) => void
  zoomIn: (nodeId: string) => void
  zoomOut: () => void
  goHome: () => void
  navigateToLayer: (historyIndex: number) => void

  pan: (dx: number, dy: number) => void
  setZoom: (scale: number, centerX?: number, centerY?: number) => void
  animateZoom: (targetScale: number, centerX?: number, centerY?: number, duration?: number) => void
  animatePan: (targetX: number, targetY: number, duration?: number) => void
  resetTransform: () => void
  saveLayerTransform: () => void
  restoreLayerTransform: () => void

  getCurrentLayer: () => CanvasLayer | null
  getLayerBreadcrumb: () => Array<{ id: string; name: string }>
}

export const useVisualizationStore = create<VisualizationState>((set, get) => ({
  config: null,
  layers: {},
  currentLayerId: "",
  navigationHistory: [],
  canvasStyle: {
    width: 0,
    height: 0,
    backgroundColor: "#ffffff",
  },
  canvasTransform: {
    scaleX: 1,
    scaleY: 1,
    x: 0,
    y: 0,
  },
  layerTransforms: {},
  isAnimating: false,

  initializeData: (config) => {
    set({
      config,
      layers: config.layers,
      currentLayerId: config.rootLayerId,
      navigationHistory: [config.rootLayerId],
      canvasStyle: config.canvasStyle,
      canvasTransform: {
        scaleX: 1,
        scaleY: 1,
        x: 0,
        y: 0,
      },
      layerTransforms: {},
    })
  },

  zoomIn: (nodeId) => {
    const { layers, currentLayerId } = get()
    const currentLayer = layers[currentLayerId]

    if (!currentLayer) return

    const node = currentLayer.nodes.find((n) => n.id === nodeId)
    if (!node || !node.childLayerId) return

    const nextLayerId = node.childLayerId
    const { navigationHistory } = get()

    get().saveLayerTransform()

    set({
      currentLayerId: nextLayerId,
      navigationHistory: [...navigationHistory, nextLayerId],
      canvasTransform: {
        scaleX: 1,
        scaleY: 1,
        x: 0,
        y: 0,
      },
    })
  },

  zoomOut: () => {
    const { navigationHistory } = get()

    if (navigationHistory.length <= 1) return

    const newHistory = navigationHistory.slice(0, -1)
    const previousLayerId = newHistory[newHistory.length - 1]

    get().restoreLayerTransform()

    set({
      currentLayerId: previousLayerId,
      navigationHistory: newHistory,
    })
  },

  goHome: () => {
    const { config } = get()
    if (!config) return

    get().animateZoom(1, 0, 0, 600)

    set({
      currentLayerId: config.rootLayerId,
      navigationHistory: [config.rootLayerId],
      layerTransforms: {},
    })
  },

  navigateToLayer: (historyIndex) => {
    const { navigationHistory } = get()

    if (historyIndex < 0 || historyIndex >= navigationHistory.length) return

    const newHistory = navigationHistory.slice(0, historyIndex + 1)
    const targetLayerId = newHistory[newHistory.length - 1]

    get().animateZoom(1, 0, 0, 400)

    set({
      currentLayerId: targetLayerId,
      navigationHistory: newHistory,
    })
  },

  pan: (dx, dy) => {
    const { canvasTransform } = get()
    set({
      canvasTransform: {
        ...canvasTransform,
        x: canvasTransform.x + dx,
        y: canvasTransform.y + dy,
      },
    })
  },

  setZoom: (scale, centerX = 0, centerY = 0) => {
    const { canvasTransform } = get()
    const newScale = Math.max(0.1, Math.min(scale, 5))

    const dx = centerX - (centerX - canvasTransform.x) * (newScale / canvasTransform.scaleX)
    const dy = centerY - (centerY - canvasTransform.y) * (newScale / canvasTransform.scaleY)

    set({
      canvasTransform: {
        scaleX: newScale,
        scaleY: newScale,
        x: dx,
        y: dy,
      },
    })
  },

  animateZoom: (targetScale, centerX = 0, centerY = 0, duration = 400) => {
    const { canvasTransform } = get()
    const startScale = canvasTransform.scaleX
    const clampedScale = Math.max(0.1, Math.min(targetScale, 5))

    set({ isAnimating: true })

    animate(
      "zoom",
      startScale,
      clampedScale,
      duration,
      (scale) => {
        const { canvasTransform: current } = get()
        const dx = centerX - (centerX - current.x) * (scale / current.scaleX)
        const dy = centerY - (centerY - current.y) * (scale / current.scaleY)

        set({
          canvasTransform: {
            scaleX: scale,
            scaleY: scale,
            x: dx,
            y: dy,
          },
        })
      },
      () => {
        set({ isAnimating: false })
      },
    )
  },

  animatePan: (targetX, targetY, duration = 300) => {
    const { canvasTransform } = get()

    set({ isAnimating: true })

    const startX = canvasTransform.x
    const startY = canvasTransform.y

    animate("pan-x", startX, targetX, duration, (x) => {
      const { canvasTransform: current } = get()
      set({
        canvasTransform: {
          ...current,
          x,
        },
      })
    })

    animate(
      "pan-y",
      startY,
      targetY,
      duration,
      (y) => {
        const { canvasTransform: current } = get()
        set({
          canvasTransform: {
            ...current,
            y,
          },
        })
      },
      () => {
        set({ isAnimating: false })
      },
    )
  },

  resetTransform: () => {
    cancelAnimation("zoom")
    cancelAnimation("pan-x")
    cancelAnimation("pan-y")

    set({
      canvasTransform: {
        scaleX: 1,
        scaleY: 1,
        x: 0,
        y: 0,
      },
      isAnimating: false,
    })
  },

  saveLayerTransform: () => {
    const { currentLayerId, canvasTransform, layerTransforms } = get()
    set({
      layerTransforms: {
        ...layerTransforms,
        [currentLayerId]: canvasTransform,
      },
    })
  },

  restoreLayerTransform: () => {
    const { currentLayerId, layerTransforms } = get()
    const transform = layerTransforms[currentLayerId]

    if (transform) {
      set({
        canvasTransform: transform,
      })
    } else {
      get().resetTransform()
    }
  },

  getCurrentLayer: () => {
    const { layers, currentLayerId } = get()
    return layers[currentLayerId] || null
  },

  getLayerBreadcrumb: () => {
    const { navigationHistory, layers } = get()
    return navigationHistory.map((layerId) => ({
      id: layerId,
      name: layers[layerId]?.name || "Unknown",
    }))
  },
}))
