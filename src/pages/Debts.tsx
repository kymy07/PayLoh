import { ArrowDownWideNarrow, Plus, Search, SearchX, Wallet, X } from "lucide-react"
import { useMemo, useState } from "react"

import { DebtCard } from "@/components/DebtCard"
import { EmptyState } from "@/components/EmptyState"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/AuthContext"
import { useDebtActions } from "@/contexts/DebtActionsContext"
import { useDebts } from "@/hooks/useDebts"
import { formatMoney } from "@/lib/format"
import { isOverdue, remaining, statusOf, type Debt } from "@/lib/types"

type Filter = "all" | "unpaid" | "overdue" | "settled" | "i_owe"
type Sort = "recent" | "amount" | "due" | "name"

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "unpaid", label: "Outstanding" },
  { value: "overdue", label: "Overdue" },
  { value: "i_owe", label: "I owe" },
  { value: "settled", label: "Settled" },
]

const SORTS: { value: Sort; label: string }[] = [
  { value: "recent", label: "Newest first" },
  { value: "amount", label: "Largest balance" },
  { value: "due", label: "Due soonest" },
  { value: "name", label: "Name A–Z" },
]

export function Debts() {
  const { currency } = useAuth()
  const { debts, loading } = useDebts()
  const actions = useDebtActions()

  const [filter, setFilter] = useState<Filter>("all")
  const [sort, setSort] = useState<Sort>("recent")
  const [search, setSearch] = useState("")

  const visible = useMemo(() => {
    const needle = search.trim().toLowerCase()

    const matched = debts.filter((debt) => {
      if (needle) {
        const haystack = `${debt.personName} ${debt.description ?? ""}`.toLowerCase()
        if (!haystack.includes(needle)) return false
      }

      switch (filter) {
        case "unpaid":
          return statusOf(debt) !== "settled" && debt.direction === "owed_to_me"
        case "overdue":
          return isOverdue(debt)
        case "settled":
          return statusOf(debt) === "settled"
        case "i_owe":
          return debt.direction === "i_owe" && statusOf(debt) !== "settled"
        default:
          return true
      }
    })

    return sortDebts(matched, sort)
  }, [debts, filter, sort, search])

  const outstanding = visible.reduce(
    (sum, debt) => (statusOf(debt) === "settled" ? sum : sum + remaining(debt)),
    0,
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-11 w-full rounded-xl" />
        <div className="grid gap-3 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-40 rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[28px] leading-tight font-semibold tracking-[-0.03em]">Debts</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {visible.length} {visible.length === 1 ? "record" : "records"}
            {outstanding > 0 && ` · ${formatMoney(outstanding, currency)} outstanding`}
          </p>
        </div>
        <Button onClick={actions.openCreate} className="hidden sm:inline-flex">
          <Plus /> New debt
        </Button>
      </div>

      {/* Filters sit in one row above the list. */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search a name or what it was for"
            className="pl-11"
            aria-label="Search debts"
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

        <Select value={sort} onValueChange={(value) => setSort(value as Sort)}>
          <SelectTrigger className="sm:w-52" aria-label="Sort debts">
            <ArrowDownWideNarrow className="size-4 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            {SORTS.map(({ value, label }) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs value={filter} onValueChange={(value) => setFilter(value as Filter)}>
        <TabsList className="w-full overflow-x-auto sm:w-fit">
          {FILTERS.map(({ value, label }) => (
            <TabsTrigger key={value} value={value}>
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {visible.length === 0 ? (
        debts.length === 0 ? (
          <EmptyState
            icon={Wallet}
            title="Nothing logged yet"
            description="Add your first debt and it'll show up here with its balance and due date."
            action={
              <Button onClick={actions.openCreate}>
                <Plus /> Add a debt
              </Button>
            }
          />
        ) : (
          <EmptyState
            icon={SearchX}
            title="No matches"
            description="Nothing fits that search and filter. Try widening one of them."
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
        )
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {visible.map((debt) => (
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
      )}
    </div>
  )
}

function sortDebts(debts: Debt[], sort: Sort): Debt[] {
  const rows = [...debts]

  switch (sort) {
    case "amount":
      return rows.sort((a, b) => remaining(b) - remaining(a))
    case "name":
      return rows.sort((a, b) => a.personName.localeCompare(b.personName))
    case "due":
      // Debts without a due date sink to the bottom rather than sorting as "now".
      return rows.sort((a, b) => {
        const left = a.dueDate ?? Number.POSITIVE_INFINITY
        const right = b.dueDate ?? Number.POSITIVE_INFINITY
        return left - right
      })
    default:
      return rows.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0))
  }
}
