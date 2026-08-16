import {
  ArrowLeft,
  CalendarClock,
  CircleCheck,
  Phone,
  Plus,
  Send,
  Users,
} from "lucide-react"
import { Link, useNavigate, useParams } from "react-router-dom"

import { DebtCard } from "@/components/DebtCard"
import { PersonAvatar } from "@/components/PersonAvatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/contexts/AuthContext"
import { useDebtActions } from "@/contexts/DebtActionsContext"
import { useDebts } from "@/hooks/useDebts"
import { usePerson } from "@/hooks/usePeople"
import { formatDueLabel, formatMoney } from "@/lib/format"
import { statusOf } from "@/lib/types"
import { cn } from "@/lib/utils"

export function PersonDetail() {
  const { personKey } = useParams<{ personKey: string }>()
  const navigate = useNavigate()
  const { currency } = useAuth()
  const { debts, loading } = useDebts()
  const person = usePerson(debts, personKey)
  const actions = useDebtActions()

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    )
  }

  if (!person) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-2xl font-semibold tracking-[-0.03em]">Person not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Every debt with them may have been deleted.
        </p>
        <Button className="mt-6" asChild>
          <Link to="/app/people">
            <ArrowLeft /> Back to people
          </Link>
        </Button>
      </div>
    )
  }

  const settled = person.activeCount === 0
  const progress = person.lent > 0 ? Math.min(100, (person.paidBack / person.lent) * 100) : 0
  const dueLabel = formatDueLabel(person.nextDue)

  // The debt a reminder should be about: the one falling due soonest, else the
  // largest still outstanding.
  const reminderTarget =
    person.debts
      .filter((debt) => statusOf(debt) !== "settled")
      .sort((a, b) => {
        const left = a.dueDate ?? Number.POSITIVE_INFINITY
        const right = b.dueDate ?? Number.POSITIVE_INFINITY
        return left - right || b.amount - a.amount
      })[0] ?? null

  const active = person.debts.filter((debt) => statusOf(debt) !== "settled")
  const done = person.debts.filter((debt) => statusOf(debt) === "settled")

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="-ml-2">
        <ArrowLeft /> Back
      </Button>

      <Card className="gap-0 p-6 sm:p-7">
        <div className="flex items-start gap-4">
          <PersonAvatar name={person.name} className="size-14 text-base" />
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-2xl font-semibold tracking-[-0.03em]">{person.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {person.debtCount} {person.debtCount === 1 ? "debt" : "debts"} logged
              {person.settledCount > 0 && ` · ${person.settledCount} settled`}
            </p>
            {person.phone && (
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                <Phone className="size-3.5 shrink-0" />
                {person.phone}
              </p>
            )}
          </div>
        </div>

        {/* The headline: what this person is worth to you, net. */}
        <p className="mt-6 text-[13px] font-medium text-muted-foreground">
          {settled ? "All square" : person.net >= 0 ? "They owe you, net" : "You owe them, net"}
        </p>
        <p
          className={cn(
            "mt-1 text-[clamp(2.25rem,7vw,3rem)] leading-none font-semibold tracking-[-0.04em]",
            settled && "text-muted-foreground",
          )}
        >
          {formatMoney(Math.abs(person.net), currency)}
        </p>

        {/* Both directions, when they exist, so the net isn't a black box. */}
        {person.owedToMe > 0 && person.iOwe > 0 && (
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <span className="text-muted-foreground">
              Owes you{" "}
              <span className="tabular font-medium text-foreground">
                {formatMoney(person.owedToMe, currency)}
              </span>
            </span>
            <span className="text-muted-foreground">
              You owe{" "}
              <span className="tabular font-medium text-foreground">
                {formatMoney(person.iOwe, currency)}
              </span>
            </span>
          </div>
        )}

        {person.lent > 0 && (
          <>
            <Progress
              value={progress}
              className="mt-5 h-1.5"
              indicatorClassName="bg-primary"
            />
            <div className="mt-2 flex justify-between text-[13px] text-muted-foreground">
              <span className="tabular">
                {formatMoney(person.paidBack, currency)} paid back
              </span>
              <span className="tabular">of {formatMoney(person.lent, currency)} lent</span>
            </div>
          </>
        )}

        <div className="mt-5 flex flex-wrap gap-2">
          {settled && (
            <Badge variant="success">
              <CircleCheck className="size-3" /> Nothing outstanding
            </Badge>
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
          {person.activeCount > 0 && (
            <Badge variant="outline">
              {person.activeCount} still open
            </Badge>
          )}
        </div>

        <Separator className="my-6" />

        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() =>
              actions.openCreate({ personName: person.name, personPhone: person.phone })
            }
          >
            <Plus /> New debt with {person.name.split(" ")[0]}
          </Button>
          {reminderTarget && (
            <Button variant="outline" onClick={() => actions.openReminder(reminderTarget)}>
              <Send /> Send a reminder
            </Button>
          )}
        </div>
      </Card>

      {active.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-[17px] font-semibold tracking-[-0.02em]">
            Open debts <span className="text-muted-foreground">· {active.length}</span>
          </h2>
          <div className="space-y-3">
            {active.map((debt) => (
              <DebtCard
                key={debt.id}
                debt={debt}
                onRecordPayment={actions.openPayment}
                onSettle={actions.markSettled}
                onEdit={actions.openEdit}
                onRemind={actions.openReminder}
                onDelete={actions.confirmDelete}
              />
            ))}
          </div>
        </section>
      )}

      {done.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-[17px] font-semibold tracking-[-0.02em]">
            Settled <span className="text-muted-foreground">· {done.length}</span>
          </h2>
          <div className="space-y-3">
            {done.map((debt) => (
              <DebtCard
                key={debt.id}
                debt={debt}
                onRecordPayment={actions.openPayment}
                onSettle={actions.markSettled}
                onEdit={actions.openEdit}
                onRemind={actions.openReminder}
                onDelete={actions.confirmDelete}
              />
            ))}
          </div>
        </section>
      )}

      <p className="flex items-center justify-center gap-1.5 pt-2 text-[13px] text-muted-foreground">
        <Users className="size-3.5" />
        <Link to="/app/people" className="hover:text-foreground">
          See everyone
        </Link>
      </p>
    </div>
  )
}
