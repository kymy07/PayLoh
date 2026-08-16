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
  default: "text-primary",
  positive: "text-success",
  negative: "text-destructive",
  muted: "text-muted-foreground",
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
    <Card className={cn("gap-0 p-4", className)}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-footnote text-muted-foreground">{label}</p>
        <Icon className={cn("size-4 shrink-0", TONES[tone])} strokeWidth={1.75} />
      </div>
      {/* Proportional figures — tabular digits look loose at display sizes and
          these tiles do not need to align vertically with each other. */}
      <p className="text-title-2 mt-2.5">{value}</p>
      {hint && <p className="text-caption mt-1.5 text-muted-foreground">{hint}</p>}
    </Card>
  )
}
