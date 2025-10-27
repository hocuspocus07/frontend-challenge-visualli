import { create } from "zustand"
import { animate, cancelAnimation } from "./animation"

export interface CanvasNode {
  id: string
  name: string
  x: number//x,y,and r are relative
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
  canvasStyle: {
    backgroundColor: string
  }

  canvasTransform: CanvasTransform
  layerTransforms: Record<string, CanvasTransform>
  isAnimating: boolean

  // Actions
  initializeData: (config: VisualizationConfig) => void
  zoomIn: (node: CanvasNode, canvasWidth: number, canvasHeight: number) => void
  zoomOut: (canvasWidth: number, canvasHeight: number) => void
  goHome: () => void
  navigateToLayer: (historyIndex: number) => void

  pan: (dx: number, dy: number) => void
  setZoom: (scale: number, centerX?: number, centerY?: number) => void
  animateZoom: (targetScale: number, centerX?: number, centerY?: number, duration?: number) => void
  animateTransform: (target: Partial<CanvasTransform>, duration: number, onComplete?: () => void) => void
  resetTransform: () => void
  saveLayerTransform: () => void

  getCurrentLayer: () => CanvasLayer | null
  getLayerBreadcrumb: () => Array<{ id: string; name: string }>
}

export const useVisualizationStore = create<VisualizationState>((set, get) => ({
    config: null,
    layers: {},
    currentLayerId: "",
    navigationHistory: [],
    canvasStyle: {
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
            canvasStyle: {
                backgroundColor: config.layers[config.rootLayerId]?.backgroundColor || "#ffffff",
            },
            canvasTransform: { scaleX: 1, scaleY: 1, x: 0, y: 0 },
            layerTransforms: {},
        })
    },

    zoomIn: (node, canvasWidth, canvasHeight) => {
        const { isAnimating } = get()
        if (!node.childLayerId || isAnimating) return

        const { layers, navigationHistory } = get()
        const nextLayerId = node.childLayerId

        get().saveLayerTransform()

        const minCanvasDim = Math.min(canvasWidth, canvasHeight)
        const targetScale = canvasWidth / (node.radius * minCanvasDim * 2.2)
        const targetX = canvasWidth / 2 - node.x * canvasWidth * targetScale
        const targetY = canvasHeight / 2 - node.y * canvasHeight * targetScale

        set({ isAnimating: true })
        get().animateTransform({ scaleX: targetScale, scaleY: targetScale, x: targetX, y: targetY }, 500, () => {
            set({
                currentLayerId: nextLayerId,
                navigationHistory: [...navigationHistory, nextLayerId],
                canvasStyle: {
                    backgroundColor: layers[nextLayerId]?.backgroundColor || "#ffffff",
                },
            })
            get().resetTransform() // Resets transform for the new layer
        })
    },

    zoomOut: (canvasWidth, canvasHeight) => {
        const { navigationHistory, layers, isAnimating, layerTransforms } = get()

        if (navigationHistory.length <= 1 || isAnimating) return

        const currentLayer = layers[get().currentLayerId]
        const parentLayerId = navigationHistory[navigationHistory.length - 2]
        const parentLayer = layers[parentLayerId]
        const parentNode = parentLayer.nodes.find((n) => n.id === currentLayer.parentNodeId)

        if (!parentNode) return

        const minCanvasDim = Math.min(canvasWidth, canvasHeight)
        const startScale = canvasWidth / (parentNode.radius * minCanvasDim * 2.2)
        const startX = canvasWidth / 2 - parentNode.x * canvasWidth * startScale
        const startY = canvasHeight / 2 - parentNode.y * canvasHeight * startScale

        set({
            currentLayerId: parentLayerId,
            navigationHistory: navigationHistory.slice(0, -1),
            canvasStyle: {
                backgroundColor: parentLayer.backgroundColor,
            },
            canvasTransform: { scaleX: startScale, scaleY: startScale, x: startX, y: startY },
        })

        const targetTransform = layerTransforms[parentLayerId] || { scaleX: 1, scaleY: 1, x: 0, y: 0 }
        set({ isAnimating: true })
        get().animateTransform(targetTransform, 500, () => {
            set({ isAnimating: false })
        })
    },

    goHome: () => {
        const { config, layers } = get()
        if (!config) return

        const rootLayerId = config.rootLayerId
        set({ isAnimating: true })

        get().animateTransform({ scaleX: 1, scaleY: 1, x: 0, y: 0 }, 600, () => {
            set({
                currentLayerId: rootLayerId,
                navigationHistory: [rootLayerId],
                layerTransforms: {},
                canvasStyle: {
                    backgroundColor: layers[rootLayerId]?.backgroundColor || "#ffffff",
                },
                isAnimating: false,
            })
        })
    },

    navigateToLayer: (historyIndex) => {
        const { navigationHistory, layers } = get()
        if (historyIndex < 0 || historyIndex >= navigationHistory.length) return

        const newHistory = navigationHistory.slice(0, historyIndex + 1)
        const targetLayerId = newHistory[newHistory.length - 1]

        get().animateTransform({ scaleX: 1, scaleY: 1, x: 0, y: 0 }, 400, () => {
            set({
                currentLayerId: targetLayerId,
                navigationHistory: newHistory,
                canvasStyle: {
                    backgroundColor: layers[targetLayerId]?.backgroundColor || "#ffffff",
                },
            })
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
        const newScale = Math.max(0.1, Math.min(scale, 10))

        const dx = centerX - ((centerX - canvasTransform.x) * newScale) / canvasTransform.scaleX
        const dy = centerY - ((centerY - canvasTransform.y) * newScale) / canvasTransform.scaleY

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
        const startX = canvasTransform.x
        const startY = canvasTransform.y
        const clampedScale = Math.max(0.1, Math.min(targetScale, 10))

        set({ isAnimating: true })

        animate(
            "zoom",
            startScale,
            clampedScale,
            duration,
            (scale) => {
                const x = centerX - ((centerX - startX) * scale) / startScale
                const y = centerY - ((centerY - startY) * scale) / startScale
                set({
                    canvasTransform: { scaleX: scale, scaleY: scale, x, y },
                })
            },
            () => set({ isAnimating: false }),
        )
    },

    animateTransform: (target, duration, onComplete) => {
        const { canvasTransform: start } = get()
        const targetWithDefaults = { ...start, ...target }

        animate(
            "transform",
            0,
            1,
            duration,
            (progress) => {
                const scaleX = start.scaleX + (targetWithDefaults.scaleX - start.scaleX) * progress
                const scaleY = start.scaleY + (targetWithDefaults.scaleY - start.scaleY) * progress
                const x = start.x + (targetWithDefaults.x - start.x) * progress
                const y = start.y + (targetWithDefaults.y - start.y) * progress
                set({ canvasTransform: { scaleX, scaleY, x, y } })
            },
            onComplete,
        )
    },

    resetTransform: () => {
        cancelAnimation("transform")
        set({
            canvasTransform: { scaleX: 1, scaleY: 1, x: 0, y: 0 },
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
}));