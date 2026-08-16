import { useEffect, useRef, useState } from "react"

import { cn } from "@/lib/utils"

interface RevealProps extends React.ComponentProps<"div"> {
  /** Milliseconds to hold before this element starts, for staggered groups. */
  delay?: number
  /** How far into the viewport the element must come before it fires. */
  amount?: number
  as?: "div" | "section" | "li" | "article"
}

/**
 * Fades and lifts an element into place the first time it scrolls into view.
 *
 * IntersectionObserver rather than a scroll listener so it costs nothing while
 * idle, and it disconnects after firing — content that has arrived should stay
 * arrived, not re-animate every time it passes the fold.
 */
export function Reveal({
  delay = 0,
  amount = 0.15,
  as = "div",
  className,
  children,
  ...props
}: RevealProps) {
  // Widening to ElementType keeps the ref and prop types from being narrowed to
  // one specific tag while the component can render several.
  const Tag = as as React.ElementType
  const ref = useRef<HTMLElement>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    // Anything already on screen at mount should not wait for a scroll.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShown(true)
          observer.disconnect()
        }
      },
      { threshold: amount, rootMargin: "0px 0px -8% 0px" },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [amount])

  return (
    <Tag
      ref={ref}
      className={cn("reveal", shown && "reveal-in", className)}
      style={{ "--reveal-delay": `${delay}ms` } as React.CSSProperties}
      {...props}
    >
      {children}
    </Tag>
  )
}
