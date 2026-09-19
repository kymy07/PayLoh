import { Gift, Plus, ShoppingBag, Star } from "lucide-react"
import { useMemo, useState } from "react"
import { toast } from "sonner"

import { ConfirmDialog } from "@/components/ConfirmDialog"
import { EmptyState } from "@/components/EmptyState"
import { LargeTitle } from "@/components/PageTitle"
import { Reveal } from "@/components/Reveal"
import { StatCard } from "@/components/StatCard"
import { WishCard } from "@/components/WishCard"
import { WishDialog } from "@/components/WishDialog"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/AuthContext"
import { deleteWish, setWishBought, useWishlist } from "@/hooks/useWishlist"
import { formatMoney } from "@/lib/format"
import { round2, type WishItem, type WishPriority } from "@/lib/types"

type Filter = "all" | WishPriority | "bought"

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "high", label: "Must have" },
  { value: "medium", label: "Want" },
  { value: "low", label: "Nice to have" },
  { value: "bought", label: "Bought" },
]

export function Wishlist() {
  const { user, currency } = useAuth()
  const { items, loading } = useWishlist()

  const [filter, setFilter] = useState<Filter>("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<WishItem | null>(null)
  const [deleting, setDeleting] = useState<WishItem | null>(null)

  const visible = useMemo(
    () =>
      items.filter((item) => {
        if (filter === "all") return true
        if (filter === "bought") return Boolean(item.boughtAt)
        return !item.boughtAt && item.priority === filter
      }),
    [items, filter],
  )

  const wanted = items.filter((item) => !item.boughtAt)
  const wantedTotal = round2(wanted.reduce((sum, item) => sum + item.price, 0))
  const mustHave = wanted.filter((item) => item.priority === "high")
  const mustHaveTotal = round2(mustHave.reduce((sum, item) => sum + item.price, 0))
  const boughtCount = items.length - wanted.length

  function openCreate() {
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(item: WishItem) {
    setEditing(item)
    setDialogOpen(true)
  }

  async function handleToggleBought(item: WishItem) {
    if (!user) return
    const bought = !item.boughtAt
    try {
      await setWishBought(user.uid, item.id, bought)
      toast.success(bought ? `Ticked off ${item.name}` : `${item.name} is back on the list`)
    } catch {
      toast.error("Couldn't update that. Try again.")
    }
  }

  async function handleDelete() {
    if (!user || !deleting) return
    try {
      await deleteWish(user.uid, deleting.id)
      toast.success(`Removed ${deleting.name}`)
    } catch {
      toast.error("Couldn't delete that. Try again.")
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-40" />
        <div className="grid gap-3 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-24 rounded-xl" />
          ))}
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-36 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <LargeTitle
        title="Wishlist"
        description="Things you want to buy, ranked by how much they matter."
        className="pb-0"
        action={
          <Button onClick={openCreate}>
            <Plus /> New wish
          </Button>
        }
      />

      {items.length === 0 ? (
        <EmptyState
          icon={Gift}
          title="Nothing on your wishlist"
          description="Save something you want with its link and price, and mark how important it is."
          action={
            <Button onClick={openCreate}>
              <Plus /> Add a wish
            </Button>
          }
        />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard
              label="Still wanted"
              value={formatMoney(wantedTotal, currency)}
              icon={ShoppingBag}
              tone="default"
              hint={`${wanted.length} ${wanted.length === 1 ? "item" : "items"}`}
            />
            <StatCard
              label="Must haves"
              value={formatMoney(mustHaveTotal, currency)}
              icon={Star}
              tone="negative"
              hint={`${mustHave.length} ${mustHave.length === 1 ? "item" : "items"} to buy first`}
            />
            <StatCard
              label="Bought"
              value={String(boughtCount)}
              icon={Gift}
              tone="positive"
              hint="Ticked off the list"
            />
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
            <EmptyState
              icon={Gift}
              title="Nothing here"
              description="No wishes fit this filter yet."
              action={
                <Button variant="outline" onClick={() => setFilter("all")}>
                  Show all
                </Button>
              }
            />
          ) : (
            <div className="grid gap-3 xl:grid-cols-2">
              {visible.map((item, index) => (
                <Reveal key={item.id} delay={Math.min(index, 6) * 45}>
                  <WishCard
                    item={item}
                    onToggleBought={handleToggleBought}
                    onEdit={openEdit}
                    onDelete={setDeleting}
                  />
                </Reveal>
              ))}
            </div>
          )}
        </>
      )}

      <WishDialog open={dialogOpen} onOpenChange={setDialogOpen} item={editing} />

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete this wish?"
        description={deleting ? `${deleting.name} will be removed from your wishlist.` : ""}
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
      />
    </div>
  )
}
