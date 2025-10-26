import type { CanvasLayer,CanvasNode } from "./visualisation-store"

interface CanvasTransform {
  scaleX: number
  scaleY: number
  x: number
  y: number
}

export function renderLayer(
  ctx: CanvasRenderingContext2D,
  canvasLayer: CanvasLayer,
  canvasWidth: number,
  canvasHeight: number,
  transform: CanvasTransform,
) {
  canvasLayer.nodes.forEach((node) => {
    renderNode(ctx, node, transform, canvasWidth, canvasHeight)
  })
}

function renderNode(
  ctx: CanvasRenderingContext2D,
  node: CanvasNode,
  transform: CanvasTransform,
  canvasWidth: number,
  canvasHeight: number,
) {
  ctx.fillStyle = node.color
  ctx.strokeStyle = "#ffffff"
  ctx.lineWidth = 2
  ctx.globalAlpha = 0.9

  ctx.beginPath()
  ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()

  ctx.globalAlpha = 1

  ctx.fillStyle = "#ffffff"
  ctx.font = "12px sans-serif"
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"

  ctx.fillText(node.name, node.x, node.y)
}

export function isNodeClickable(node: CanvasNode, clickX: number, clickY: number): boolean {
  const distance = Math.sqrt((clickX - node.x) ** 2 + (clickY - node.y) ** 2)
  return distance <= node.radius
}
