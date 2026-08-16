import { useEffect, useRef, useState } from "react"

interface AnimatedNumberProps {
  value: number
  /** Receives the interpolated value; return the string to render. */
  format: (value: number) => string
  durationMs?: number
  className?: string
}

/** Decelerating curve — fast out of the gate, settling softly, like iOS. */
function easeOutExpo(t: number) {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
}

/**
 * Counts a figure up to its value instead of snapping to it.
 *
 * Used only for the one hero number on a screen. Applied to every figure it
 * would be noise; applied to the number the screen is *about*, it reads as the
 * total assembling itself.
 */
export function AnimatedNumber({
  value,
  format,
  durationMs = 900,
  className,
}: AnimatedNumberProps) {
  const [shown, setShown] = useState(value)
  const fromRef = useRef(value)
  const frameRef = useRef(0)
  const startedRef = useRef(false)

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(value)
      return
    }

    // First paint counts up from zero; later changes tween from wherever the
    // display currently sits, so a correction never jumps.
    const from = startedRef.current ? fromRef.current : 0
    startedRef.current = true

    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs)
      const current = from + (value - from) * easeOutExpo(t)
      fromRef.current = current
      setShown(current)
      if (t < 1) frameRef.current = requestAnimationFrame(tick)
    }

    frameRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameRef.current)
  }, [value, durationMs])

  return <span className={className}>{format(shown)}</span>
}
