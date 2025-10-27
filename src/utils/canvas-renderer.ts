import type { CanvasNode } from "./visualisation-store"

export function renderLayer(
  ctx: CanvasRenderingContext2D,
  nodes: CanvasNode[],
  canvasWidth: number,
  canvasHeight: number,
) {
  nodes.forEach((node) => {
    renderNode(ctx, node, canvasWidth, canvasHeight)
  })
}

function renderNode(
  ctx: CanvasRenderingContext2D,
  node: CanvasNode,
  canvasWidth: number,
  canvasHeight: number,
) {
  const minCanvasDim = Math.min(canvasWidth, canvasHeight)
  const pixelX = node.x * canvasWidth
  const pixelY = node.y * canvasHeight
  const pixelRadius = node.radius * minCanvasDim

  ctx.fillStyle = node.color
  ctx.strokeStyle = "#ffffff"
  ctx.lineWidth = 2
  ctx.globalAlpha = 0.9

  ctx.beginPath()
  ctx.arc(pixelX, pixelY, pixelRadius, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()
  ctx.globalAlpha = 1

  ctx.fillStyle = "#ffffff"
  ctx.font = `${Math.max(12, pixelRadius / 4)}px sans-serif`
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillText(node.name, pixelX, pixelY)
}