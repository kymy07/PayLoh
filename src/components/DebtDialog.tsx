import { ArrowDownLeft, ArrowUpRight } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

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
import { createDebt, updateDebt } from "@/hooks/useDebts"
import { CURRENCIES } from "@/lib/format"
import type { Debt, DebtDirection } from "@/lib/types"
import { cn } from "@/lib/utils"

interface DebtDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Passing a debt switches the dialog into edit mode. */
  debt?: Debt | null
}

/** `<input type="date">` wants yyyy-MM-dd in local time, not an ISO instant. */
function toDateInput(date: Date | null): string {
  if (!date) return ""
  const offset = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offset).toISOString().slice(0, 10)
}

export function DebtDialog({ open, onOpenChange, debt }: DebtDialogProps) {
  const { user, currency } = useAuth()
  const editing = Boolean(debt)

  const [direction, setDirection] = useState<DebtDirection>("owed_to_me")
  const [personName, setPersonName] = useState("")
  const [personPhone, setPersonPhone] = useState("")
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [saving, setSaving] = useState(false)

  // Refill the form whenever the dialog opens, so a reopen never shows stale text.
  useEffect(() => {
    if (!open) return
    setDirection(debt?.direction ?? "owed_to_me")
    setPersonName(debt?.personName ?? "")
    setPersonPhone(debt?.personPhone ?? "")
    setAmount(debt ? String(debt.amount) : "")
    setDescription(debt?.description ?? "")
    setDueDate(toDateInput(debt?.dueDate ? new Date(debt.dueDate) : null))
    setSaving(false)
  }, [open, debt])

  const symbol = CURRENCIES.find((c) => c.code === (debt?.currency ?? currency))?.symbol ?? ""

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!user) return

    const name = personName.trim()
    const value = Number.parseFloat(amount)

    if (!name) {
      toast.error("Who is this debt with?")
      return
    }
    if (!Number.isFinite(value) || value <= 0) {
      toast.error("Enter an amount greater than zero.")
      return
    }
    if (editing && debt && value < debt.paid) {
      toast.error(`Already paid ${debt.paid.toFixed(2)} — the total can't be lower than that.`)
      return
    }

    const draft = {
      personName: name,
      personPhone: personPhone.trim() || undefined,
      direction,
      amount: value,
      description: description.trim() || undefined,
      dueDate: dueDate ? new Date(`${dueDate}T12:00:00`) : null,
    }

    setSaving(true)
    try {
      if (editing && debt) {
        await updateDebt(user.uid, debt.id, draft)
        toast.success("Debt updated")
      } else {
        await createDebt(user.uid, currency, draft)
        toast.success(`Added ${name}`)
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
          <DialogTitle>{editing ? "Edit debt" : "New debt"}</DialogTitle>
          <DialogDescription>
            {editing
              ? "Update the details. Recorded payments stay as they are."
              : "Log what's owed. You can record part-payments against it later."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-2 rounded-2xl bg-muted p-1">
            <DirectionOption
              active={direction === "owed_to_me"}
              onClick={() => setDirection("owed_to_me")}
              icon={<ArrowDownLeft className="size-4" />}
              label="They owe me"
            />
            <DirectionOption
              active={direction === "i_owe"}
              onClick={() => setDirection("i_owe")}
              icon={<ArrowUpRight className="size-4" />}
              label="I owe them"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="personName">Name</Label>
            <Input
              id="personName"
              value={personName}
              onChange={(e) => setPersonName(e.target.value)}
              placeholder="Aiman"
              autoComplete="off"
              autoFocus
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <div className="relative">
                <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-sm text-muted-foreground">
                  {symbol}
                </span>
                <Input
                  id="amount"
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className={cn("tabular", symbol && "pl-11")}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">
                Due date <span className="text-muted-foreground">· optional</span>
              </Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="personPhone">
              WhatsApp number <span className="text-muted-foreground">· optional</span>
            </Label>
            <Input
              id="personPhone"
              type="tel"
              value={personPhone}
              onChange={(e) => setPersonPhone(e.target.value)}
              placeholder="012-345 6789"
              autoComplete="off"
            />
            <p className="text-xs text-muted-foreground">
              Adding this lets Payloh open a ready-written reminder in WhatsApp.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              What for <span className="text-muted-foreground">· optional</span>
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Dinner at Nasi Kandar, split three ways"
              maxLength={200}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              {editing ? "Save changes" : "Add debt"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function DirectionOption({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200 ease-spring",
        active
          ? "bg-card text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {icon}
      {label}
    </button>
  )
}
