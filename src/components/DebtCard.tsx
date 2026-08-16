import {
  ArrowDownLeft,
  ArrowUpRight,
  CalendarClock,
  Check,
  MoreHorizontal,
  Pencil,
  Send,
  Trash2,
  Wallet,
} from "lucide-react"
import { Link } from "react-router-dom"

import { PersonAvatar } from "@/components/PersonAvatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import { formatDueLabel, formatMoney } from "@/lib/format"
import { isOverdue, remaining, statusOf, type Debt } from "@/lib/types"
import { cn } from "@/lib/utils"

interface DebtCardProps {
  debt: Debt
  onRecordPayment: (debt: Debt) => void
  onSettle: (debt: Debt) => void
  onEdit: (debt: Debt) => void
  onRemind: (debt: Debt) => void
  onDelete: (debt: Debt) => void
}

export function DebtCard({
  debt,
  onRecordPayment,
  onSettle,
  onEdit,
  onRemind,
  onDelete,
}: DebtCardProps) {
  const status = statusOf(debt)
  const left = remaining(debt)
  const overdue = isOverdue(debt)
  const dueLabel = formatDueLabel(debt.dueDate)
  const progress = debt.amount > 0 ? Math.min(100, (debt.paid / debt.amount) * 100) : 0
  const incoming = debt.direction === "owed_to_me"

  return (
    <Card
      className={cn(
        // Nothing floats on hover — the card stays put and the row it contains
        // responds to the press instead.
        "group gap-0 overflow-hidden p-0",
        status === "settled" && "opacity-70 hover:opacity-100",
      )}
    >
      <div className="flex items-start gap-4 p-5">
        <PersonAvatar name={debt.personName} />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <Link
                to={`/app/debts/${debt.id}`}
                className="block truncate font-semibold tracking-[-0.015em] hover:text-primary"
              >
                {debt.personName}
              </Link>
              <p className="mt-0.5 flex items-center gap-1.5 text-[13px] text-muted-foreground">
                {incoming ? (
                  <ArrowDownLeft className="size-3.5 shrink-0 text-success" />
                ) : (
                  <ArrowUpRight className="size-3.5 shrink-0 text-warning" />
                )}
                <span className="truncate">
                  {debt.description || (incoming ? "Owes you" : "You owe")}
                </span>
              </p>
            </div>

            <div className="shrink-0 text-right">
              <p
                className={cn(
                  "tabular text-[19px] leading-none font-semibold tracking-[-0.02em]",
                  status === "settled" && "text-muted-foreground line-through",
                )}
              >
                {formatMoney(left, debt.currency)}
              </p>
              {debt.paid > 0 && status !== "settled" && (
                <p className="tabular mt-1 text-[11px] text-muted-foreground">
                  of {formatMoney(debt.amount, debt.currency)}
                </p>
              )}
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {status === "settled" && (
              <Badge variant="success">
                <Check className="size-3" /> Settled
              </Badge>
            )}
            {status === "partial" && (
              <Badge variant="default">{Math.round(progress)}% paid</Badge>
            )}
            {status === "unpaid" && <Badge variant="outline">Unpaid</Badge>}
            {overdue && (
              <Badge variant="destructive">
                <CalendarClock className="size-3" /> {dueLabel}
              </Badge>
            )}
            {!overdue && dueLabel && status !== "settled" && (
              <Badge variant="secondary">
                <CalendarClock className="size-3" /> {dueLabel}
              </Badge>
            )}
          </div>

          {status === "partial" && (
            <Progress
              value={progress}
              className="mt-3 h-1"
              indicatorClassName="bg-primary"
            />
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 border-t border-border/60 bg-muted/30 px-5 py-3">
        {status === "settled" ? (
          <Button variant="ghost" size="sm" asChild>
            <Link to={`/app/debts/${debt.id}`}>View history</Link>
          </Button>
        ) : (
          <>
            <Button variant="secondary" size="sm" onClick={() => onRecordPayment(debt)}>
              <Wallet /> Record payment
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onSettle(debt)}>
              <Check /> Pay Full
            </Button>
          </>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" className="ml-auto" aria-label="More actions">
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => onRemind(debt)}>
              <Send /> Send a reminder
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onEdit(debt)}>
              <Pencil /> Edit details
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onSelect={() => onDelete(debt)}>
              <Trash2 /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  )
}
