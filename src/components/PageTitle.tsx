import { createContext, useContext, useEffect, useMemo, useState } from "react"

import { cn } from "@/lib/utils"

interface PageTitleValue {
  title: string | null
  setTitle: (title: string | null) => void
}

const PageTitleContext = createContext<PageTitleValue | null>(null)

export function PageTitleProvider({ children }: { children: React.ReactNode }) {
  const [title, setTitle] = useState<string | null>(null)
  const value = useMemo(() => ({ title, setTitle }), [title])
  return <PageTitleContext.Provider value={value}>{children}</PageTitleContext.Provider>
}

export function usePageTitle() {
  const context = useContext(PageTitleContext)
  if (!context) throw new Error("usePageTitle must be used inside a PageTitleProvider")
  return context
}

interface LargeTitleProps {
  title: string
  eyebrow?: string
  description?: string
  action?: React.ReactNode
  className?: string
}

/**
 * The iOS large title: it sits at the top of the content, and as the page
 * scrolls it shrinks away while the same words fade into the navigation bar.
 * The shell drives both halves from one `--title-collapse` value, so they stay
 * in step no matter how fast you flick.
 */
export function LargeTitle({
  title,
  eyebrow,
  description,
  action,
  className,
}: LargeTitleProps) {
  const { setTitle } = usePageTitle()

  useEffect(() => {
    setTitle(title)
    return () => setTitle(null)
  }, [title, setTitle])

  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-4 pb-6", className)}>
      <div className="title-collapse min-w-0">
        {eyebrow && <p className="text-subhead text-muted-foreground">{eyebrow}</p>}
        <h1 className="text-large-title mt-0.5">{title}</h1>
        {description && (
          <p className="text-subhead mt-1.5 text-muted-foreground">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0 pb-1">{action}</div>}
    </div>
  )
}
