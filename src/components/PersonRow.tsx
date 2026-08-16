import { CalendarClock, ChevronRight } from "lucide-react"
import { Link } from "react-router-dom"

import { PersonAvatar } from "@/components/PersonAvatar"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { formatDueLabel, formatMoney } from "@/lib/format"
import type { Person } from "@/hooks/usePeople"
import { cn } from "@/lib/utils"

/** One person in the People list — their whole standing at a glance. */
export function PersonRow({ person, currency }: { person: Person; currency: string }) {
  const settled = person.activeCount === 0
  const progress = person.lent > 0 ? Math.min(100, (person.paidBack / person.lent) * 100) : 0
  const dueLabel = formatDueLabel(person.nextDue)

  return (
    <Card className="group gap-0 p-0 transition-all duration-300 ease-spring hover:-translate-y-0.5 hover:shadow-md hover:shadow-black/[0.06]">
      <Link
        to={`/app/people/${encodeURIComponent(person.key)}`}
        className="flex items-center gap-3 rounded-2xl p-4 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40 sm:gap-4 sm:p-5"
      >
        <PersonAvatar name={person.name} className="size-11 sm:size-12" />

        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold tracking-[-0.015em]">{person.name}</p>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            {person.debtCount} {person.debtCount === 1 ? "debt" : "debts"}
            {person.settledCount > 0 && ` · ${person.settledCount} settled`}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {settled ? (
              <Badge variant="success">All square</Badge>
            ) : (
              <>
                {person.owedToMe > 0 && (
                  <Badge variant="default">
                    Owes you {formatMoney(person.owedToMe, currency)}
                  </Badge>
                )}
                {person.iOwe > 0 && (
                  <Badge variant="warning">
                    You owe {formatMoney(person.iOwe, currency)}
                  </Badge>
                )}
              </>
            )}
            {person.overdueCount > 0 && (
              <Badge variant="destructive">
                <CalendarClock className="size-3" /> {person.overdueCount} overdue
              </Badge>
            )}
            {person.overdueCount === 0 && dueLabel && (
              <Badge variant="secondary">
                <CalendarClock className="size-3" /> {dueLabel}
              </Badge>
            )}
          </div>

          {person.paidBack > 0 && person.lent > 0 && (
            <Progress
              value={progress}
              className="mt-3 h-1"
              indicatorClassName="bg-gradient-to-r from-blush to-rose"
            />
          )}
        </div>

        <div className="shrink-0 text-right">
          <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase sm:text-[11px]">
            Net
          </p>
          <p
            className={cn(
              "tabular mt-1 text-[17px] leading-none font-semibold tracking-[-0.02em] sm:text-[19px]",
              settled && "text-muted-foreground",
              !settled && person.net > 0 && "text-success",
              !settled && person.net < 0 && "text-warning",
            )}
          >
            {person.net > 0 && "+"}
            {formatMoney(person.net, currency)}
          </p>
        </div>

        {/* Purely decorative affordance — the whole row is the tap target, and
            on a phone the space is better spent on the balance. */}
        <ChevronRight className="hidden size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 sm:block" />
      </Link>
    </Card>
  )
}
