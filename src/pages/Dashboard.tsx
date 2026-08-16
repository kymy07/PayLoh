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

import { AnimatedNumber } from "@/components/AnimatedNumber"
import { DebtCard } from "@/components/DebtCard"
import { EmptyState } from "@/components/EmptyState"
import { LargeTitle } from "@/components/PageTitle"
import { Reveal } from "@/components/Reveal"
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
    <div>
      <LargeTitle title="Dashboard" eyebrow={`${greeting()}, ${firstName}`} />

      {debts.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="Your ledger is empty"
          description="Add the first debt and Payloh keeps track of the rest — balances, due dates, and all."
          action={
            <Button onClick={() => actions.openCreate()}>
              <Plus /> Add your first debt
            </Button>
          }
        />
      ) : (
        <div className="space-y-7">
          {/* The one figure this screen is about. */}
          <Reveal>
            <Card className="gap-0 p-6 sm:p-7">
              <p className="text-footnote text-muted-foreground">Owed to you</p>
              <AnimatedNumber
                value={totals.owedToMe}
                format={(v) => formatMoney(v, currency)}
                className="mt-1.5 block text-[clamp(2.5rem,8vw,3.25rem)] leading-none font-bold tracking-[-0.035em]"
              />

              <div className="mt-4 flex flex-wrap items-center gap-1.5">
                {totals.overdueCount > 0 && (
                  <Badge variant="destructive">
                    <CalendarClock className="size-3" /> {totals.overdueCount} overdue
                  </Badge>
                )}
                <Badge variant="secondary">
                  {totals.activeCount} active {totals.activeCount === 1 ? "debt" : "debts"}
                </Badge>
                {totals.settledCount > 0 && (
                  <Badge variant="success">{totals.settledCount} settled</Badge>
                )}
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                <Button onClick={() => actions.openCreate()}>
                  <Plus /> New debt
                </Button>
                <Button variant="secondary" asChild>
                  <Link to="/app/debts">
                    See all debts <ArrowRight />
                  </Link>
                </Button>
              </div>
            </Card>
          </Reveal>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                label: "You owe",
                value: formatMoney(totals.iOwe, currency),
                icon: ArrowUpRight,
                tone: totals.iOwe > 0 ? ("negative" as const) : ("muted" as const),
                hint: totals.iOwe > 0 ? "Outstanding to others" : "Nothing outstanding",
              },
              {
                label: "Net position",
                value: formatMoney(totals.net, currency),
                icon: TrendingUp,
                tone: totals.net >= 0 ? ("positive" as const) : ("negative" as const),
                hint: totals.net >= 0 ? "In your favour" : "You're behind overall",
              },
              {
                label: "Collected so far",
                value: formatMoney(totals.collected, currency),
                icon: CircleCheck,
                tone: "positive" as const,
                hint: "Across every payment recorded",
              },
              {
                label: "People",
                value: String(totals.peopleCount),
                icon: Users,
                tone: "muted" as const,
                hint: `${totals.activeCount} still open`,
              },
            ].map((stat, index) => (
              <Reveal key={stat.label} delay={index * 60}>
                <StatCard {...stat} />
              </Reveal>
            ))}
          </div>

          {overdue.length > 0 && (
            <Reveal as="section">
              <div className="mb-3 flex items-center gap-2">
                <h2 className="text-title-3">Needs a nudge</h2>
                <Badge variant="destructive">{overdue.length}</Badge>
              </div>
              <div className="grid gap-3 lg:grid-cols-2 2xl:grid-cols-3">
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
            </Reveal>
          )}

          <Reveal>
            <TopPeopleChart debts={debts} currency={currency} />
          </Reveal>

          {active.length > 0 && (
            <Reveal as="section">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="text-title-3">Recently added</h2>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/app/debts">
                    View all <ArrowRight />
                  </Link>
                </Button>
              </div>
              <div className="grid gap-3 lg:grid-cols-2 2xl:grid-cols-3">
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
            </Reveal>
          )}

          {totals.activeCount === 0 && (
            <EmptyState
              icon={CircleCheck}
              title="Everyone's square"
              description={`All ${debts.length} debts are settled. Nothing to chase today.`}
              action={
                <Button variant="secondary" onClick={() => actions.openCreate()}>
                  <Plus /> Add a new debt
                </Button>
              }
            />
          )}
        </div>
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
    <div className="space-y-7">
      <div className="space-y-2 pb-6">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-9 w-52" />
      </div>
      <Skeleton className="h-56 w-full rounded-xl" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-28 rounded-xl" />
        ))}
      </div>
    </div>
  )
}
