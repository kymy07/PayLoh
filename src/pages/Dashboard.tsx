import {
  ArrowRight,
  ArrowUpRight,
  CalendarClock,
  CircleCheck,
  Plus,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react"
import { Link } from "react-router-dom"

import { DebtCard } from "@/components/DebtCard"
import { EmptyState } from "@/components/EmptyState"
import { StatCard } from "@/components/StatCard"
import { TopPeopleChart } from "@/components/TopPeopleChart"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/contexts/AuthContext"
import { useDebtActions } from "@/contexts/DebtActionsContext"
import { useDebts, useDebtTotals } from "@/hooks/useDebts"
import { formatMoney } from "@/lib/format"
import { isOverdue, statusOf } from "@/lib/types"

export function Dashboard() {
  const { user, profile, currency } = useAuth()
  const { debts, loading } = useDebts()
  const totals = useDebtTotals(debts)
  const actions = useDebtActions()

  const firstName = (profile?.displayName ?? user?.displayName ?? "there").split(" ")[0]

  const overdue = debts
    .filter((debt) => isOverdue(debt))
    .sort((a, b) => (a.dueDate ?? 0) - (b.dueDate ?? 0))

  const active = debts.filter((debt) => statusOf(debt) !== "settled").slice(0, 4)

  if (loading) return <DashboardSkeleton />

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-muted-foreground">
          {greeting()}, {firstName}
        </p>
        <h1 className="mt-1 text-[28px] leading-tight font-semibold tracking-[-0.03em]">
          Here's where things stand
        </h1>
      </div>

      {debts.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="Your ledger is empty"
          description="Add the first debt and Payloh will keep track of the rest — balances, due dates, and all."
          action={
            <Button onClick={actions.openCreate}>
              <Plus /> Add your first debt
            </Button>
          }
        />
      ) : (
        <>
          {/* Hero figure — the one number this view leads with. */}
          <Card className="relative gap-0 overflow-hidden p-6 sm:p-8">
            <div className="aurora pointer-events-none absolute inset-0 -z-10" />
            <p className="text-[13px] font-medium text-muted-foreground">Owed to you</p>
            <p className="mt-2 text-[clamp(2.75rem,8vw,3.75rem)] leading-none font-semibold tracking-[-0.04em]">
              {formatMoney(totals.owedToMe, currency)}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              {totals.overdueCount > 0 && (
                <Badge variant="destructive">
                  <CalendarClock className="size-3" /> {totals.overdueCount} overdue
                </Badge>
              )}
              <Badge variant="secondary">
                {totals.activeCount} active {totals.activeCount === 1 ? "debt" : "debts"}
              </Badge>
              {totals.settledCount > 0 && (
                <Badge variant="success">
                  <CircleCheck className="size-3" /> {totals.settledCount} settled
                </Badge>
              )}
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <Button onClick={actions.openCreate}>
                <Plus /> New debt
              </Button>
              <Button variant="outline" asChild>
                <Link to="/app/debts">
                  See all debts <ArrowRight />
                </Link>
              </Button>
            </div>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="You owe"
              value={formatMoney(totals.iOwe, currency)}
              icon={ArrowUpRight}
              tone={totals.iOwe > 0 ? "negative" : "muted"}
              hint={totals.iOwe > 0 ? "Outstanding to others" : "Nothing outstanding"}
            />
            <StatCard
              label="Net position"
              value={formatMoney(totals.net, currency)}
              icon={TrendingUp}
              tone={totals.net >= 0 ? "positive" : "negative"}
              hint={totals.net >= 0 ? "In your favour" : "You're behind overall"}
            />
            <StatCard
              label="Collected so far"
              value={formatMoney(totals.collected, currency)}
              icon={CircleCheck}
              tone="positive"
              hint="Across every payment recorded"
            />
            <StatCard
              label="People"
              value={String(totals.peopleCount)}
              icon={Users}
              tone="muted"
              hint={`${totals.activeCount} debt${totals.activeCount === 1 ? "" : "s"} still open`}
            />
          </div>

          {overdue.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <h2 className="text-[17px] font-semibold tracking-[-0.02em]">Needs a nudge</h2>
                <Badge variant="destructive">{overdue.length}</Badge>
              </div>
              <div className="grid gap-3 lg:grid-cols-2">
                {overdue.slice(0, 4).map((debt) => (
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

          <TopPeopleChart debts={debts} currency={currency} />

          {active.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-[17px] font-semibold tracking-[-0.02em]">Recently added</h2>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/app/debts">
                    View all <ArrowRight />
                  </Link>
                </Button>
              </div>
              <div className="grid gap-3 lg:grid-cols-2">
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

          {totals.activeCount === 0 && debts.length > 0 && (
            <EmptyState
              icon={CircleCheck}
              title="Everyone's square"
              description={`All ${debts.length} debts are settled. Nothing to chase today.`}
              action={
                <Button variant="outline" onClick={actions.openCreate}>
                  <Plus /> Add a new debt
                </Button>
              }
            />
          )}
        </>
      )}
    </div>
  )
}

function greeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 18) return "Good afternoon"
  return "Good evening"
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-64" />
      </div>
      <Skeleton className="h-52 w-full rounded-2xl" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-32 rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <Skeleton key={index} className="h-40 rounded-2xl" />
        ))}
      </div>
    </div>
  )
}
