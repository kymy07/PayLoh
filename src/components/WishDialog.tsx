import { useEffect, useState } from "react"
import { toast } from "sonner"

import { PriorityDots } from "@/components/WishCard"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/contexts/AuthContext"
import { createWish, updateWish } from "@/hooks/useWishlist"
import { CURRENCIES } from "@/lib/format"
import { WISH_PRIORITIES, type WishItem, type WishPriority } from "@/lib/types"
import { cn } from "@/lib/utils"

interface WishDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Passing an item switches the dialog into edit mode. */
  item?: WishItem | null
}

export function WishDialog({ open, onOpenChange, item }: WishDialogProps) {
  const { user, currency } = useAuth()
  const editing = Boolean(item)

  const [name, setName] = useState("")
  const [link, setLink] = useState("")
  const [price, setPrice] = useState("")
  const [priority, setPriority] = useState<WishPriority>("medium")
  const [note, setNote] = useState("")
  const [saving, setSaving] = useState(false)

  // Refill the form whenever the dialog opens, so a reopen never shows stale text.
  useEffect(() => {
    if (!open) return
    setName(item?.name ?? "")
    setLink(item?.link ?? "")
    setPrice(item ? String(item.price) : "")
    setPriority(item?.priority ?? "medium")
    setNote(item?.note ?? "")
    setSaving(false)
  }, [open, item])

  const symbol = CURRENCIES.find((c) => c.code === (item?.currency ?? currency))?.symbol ?? ""

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!user) return

    const trimmed = name.trim()
    const value = Number.parseFloat(price)

    if (!trimmed) {
      toast.error("What do you want to get?")
      return
    }
    if (!Number.isFinite(value) || value < 0) {
      toast.error("Enter a price of zero or more.")
      return
    }

    const draft = { name: trimmed, link, price: value, priority, note }

    setSaving(true)
    try {
      if (editing && item) {
        await updateWish(user.uid, item.id, draft)
        toast.success("Wish updated")
      } else {
        await createWish(user.uid, currency, draft)
        toast.success(`Added ${trimmed} to your wishlist`)
      }
      onOpenChange(false)
    } catch (error) {
      toast.error((error as Error).message || "Couldn't save that. Try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? "Edit wish" : "New wish"}</DialogTitle>
          <DialogDescription>
            Save something you want to buy, and how much it matters.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="wishName">Item</Label>
            <Input
              id="wishName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Noise-cancelling headphones"
              maxLength={100}
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="wishPrice">Price</Label>
              <div className="relative">
                <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-sm text-muted-foreground">
                  {symbol}
                </span>
                <Input
                  id="wishPrice"
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  className={cn("tabular", symbol && "pl-11")}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="wishLink">
                Link <span className="text-muted-foreground">· optional</span>
              </Label>
              <Input
                id="wishLink"
                type="text"
                inputMode="url"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="shopee.com.my/…"
                maxLength={2000}
                autoComplete="off"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label id="wishPriority">How important?</Label>
            <div
              role="radiogroup"
              aria-labelledby="wishPriority"
              className="grid grid-cols-3 gap-2"
            >
              {WISH_PRIORITIES.map(({ value, label }) => {
                const selected = priority === value
                return (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setPriority(value)}
                    className={cn(
                      "press flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-[13px] font-medium transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40",
                      selected
                        ? "border-primary bg-primary/8 text-foreground"
                        : "border-border text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <PriorityDots priority={value} />
                    {label}
                  </button>
                )
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              {WISH_PRIORITIES.find((p) => p.value === priority)?.hint}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="wishNote">
              Note <span className="text-muted-foreground">· optional</span>
            </Label>
            <Textarea
              id="wishNote"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Wait for the 11.11 sale"
              maxLength={200}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              {editing ? "Save changes" : "Add to wishlist"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
