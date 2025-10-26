export interface AnimationFrame {
  startTime: number
  duration: number
  startValue: number
  endValue: number
  onFrame: (value: number) => void
  onComplete?: () => void
}

const activeAnimations = new Map<string, AnimationFrame>()

export function animate(
  id: string,
  startValue: number,
  endValue: number,
  duration: number,
  onFrame: (value: number) => void,
  onComplete?: () => void,
) {
  const startTime = performance.now()

  const animation: AnimationFrame = {
    startTime,
    duration,
    startValue,
    endValue,
    onFrame,
    onComplete,
  }

  activeAnimations.set(id, animation)

  const tick = (currentTime: number) => {
    const anim = activeAnimations.get(id)
    if (!anim) return

    const elapsed = currentTime - anim.startTime
    const progress = Math.min(elapsed / anim.duration, 1)

    const easeProgress = 1 - Math.pow(1 - progress, 3)

    const value = anim.startValue + (anim.endValue - anim.startValue) * easeProgress

    anim.onFrame(value)

    if (progress < 1) {
      requestAnimationFrame(tick)
    } else {
      anim.onComplete?.()
      activeAnimations.delete(id)
    }
  }

  requestAnimationFrame(tick)
}

export function cancelAnimation(id: string) {
  activeAnimations.delete(id)
}

export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

export function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
}
