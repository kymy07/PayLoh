import { Plus, Search, SearchX, Users, X } from "lucide-react"
import { useMemo, useState } from "react"

import { EmptyState } from "@/components/EmptyState"
import { PersonRow } from "@/components/PersonRow"
import { StatCard } from "@/components/StatCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/AuthContext"
import { useDebtActions } from "@/contexts/DebtActionsContext"
import { useDebts } from "@/hooks/useDebts"
import { usePeople } from "@/hooks/usePeople"
import { formatMoney } from "@/lib/format"

type Filter = "all" | "owing" | "settled"

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "Everyone" },
  { value: "owing", label: "Still owing" },
  { value: "settled", label: "All square" },
]

export function People() {
  const { currency } = useAuth()
  const { debts, loading } = useDebts()
  const people = usePeople(debts)
  const actions = useDebtActions()

  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<Filter>("all")

  const visible = useMemo(() => {
    const needle = search.trim().toLowerCase()
    return people.filter((person) => {
      if (needle && !person.name.toLowerCase().includes(needle)) return false
      if (filter === "owing") return person.activeCount > 0
      if (filter === "settled") return person.activeCount === 0
      return true
    })
  }, [people, search, filter])

  const owedToMe = people.reduce((sum, person) => sum + person.owedToMe, 0)
  const stillOwing = people.filter((person) => person.activeCount > 0).length

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-11 w-full rounded-xl" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-28 rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[28px] leading-tight font-semibold tracking-[-0.03em]">People</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Everyone in your ledger, and where each of you stands.
          </p>
        </div>
        <Button onClick={() => actions.openCreate()} className="hidden sm:inline-flex">
          <Plus /> New debt
        </Button>
      </div>

      {people.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Nobody here yet"
          description="Add a debt and the person you added it against shows up here, with their running total."
          action={
            <Button onClick={() => actions.openCreate()}>
              <Plus /> Add a debt
            </Button>
          }
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              label="People tracked"
              value={String(people.length)}
              icon={Users}
              tone="muted"
              hint={`${stillOwing} still owing you`}
            />
            <StatCard
              label="Owed to you"
              value={formatMoney(owedToMe, currency)}
              icon={Search}
              tone="default"
              hint="Across everyone"
            />
            <StatCard
              label="Biggest balance"
              value={people[0] ? formatMoney(Math.abs(people[0].net), currency) : "—"}
              icon={Users}
              tone={people[0] && people[0].net >= 0 ? "positive" : "negative"}
              hint={people[0]?.name ?? "—"}
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search a name"
                className="pl-11"
                aria-label="Search people"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute top-1/2 right-3 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label="Clear search"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>

            <Tabs value={filter} onValueChange={(value) => setFilter(value as Filter)}>
              <TabsList className="w-full sm:w-fit">
                {FILTERS.map(({ value, label }) => (
                  <TabsTrigger key={value} value={value}>
                    {label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {visible.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="No matches"
              description="Nobody fits that search and filter. Try widening one of them."
              action={
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearch("")
                    setFilter("all")
                  }}
                >
                  Clear filters
                </Button>
              }
            />
          ) : (
            <div className="space-y-3">
              {visible.map((person) => (
                <PersonRow key={person.key} person={person} currency={currency} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
