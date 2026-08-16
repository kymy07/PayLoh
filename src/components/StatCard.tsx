import type { LucideIcon } from "lucide-react"

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatCardProps {
  label: string
  value: string
  hint?: string
  icon: LucideIcon
  tone?: "default" | "positive" | "negative" | "muted"
  className?: string
}

const TONES = {
  default: "bg-primary/12 text-primary",
  positive: "bg-success/12 text-success",
  negative: "bg-destructive/12 text-destructive",
  muted: "bg-muted text-muted-foreground",
} as const

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
  className,
}: StatCardProps) {
  return (
    <Card className={cn("gap-0 p-5", className)}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-[13px] font-medium text-muted-foreground">{label}</p>
        <span className={cn("grid size-8 shrink-0 place-items-center rounded-full", TONES[tone])}>
          <Icon className="size-4" />
        </span>
      </div>
      {/* Proportional figures — tabular-nums makes a standalone display number
          look loose. Tabular is reserved for the columns in the debt list. */}
      <p className="mt-3 text-[28px] leading-none font-semibold tracking-[-0.03em]">{value}</p>
      {hint && <p className="mt-2 text-xs text-muted-foreground">{hint}</p>}
    </Card>
  )
}
