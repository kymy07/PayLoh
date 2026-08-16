import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/40 px-6 py-16 text-center",
        className,
      )}
    >
      <span className="grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-cream to-blush text-[#7a3448] shadow-sm">
        <Icon className="size-6" />
      </span>
      <h3 className="mt-4 font-semibold tracking-[-0.015em]">{title}</h3>
      <p className="mt-1.5 max-w-xs text-sm text-balance text-muted-foreground">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
