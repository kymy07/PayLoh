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
import { useAuth } from "@/contexts/AuthContext"
import { addPayment } from "@/hooks/useDebts"
import { CURRENCIES, formatMoney } from "@/lib/format"
import { remaining, round2, type Debt } from "@/lib/types"
import { cn } from "@/lib/utils"

interface PaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  debt: Debt | null
}

function todayInput(): string {
  const now = new Date()
  const offset = now.getTimezoneOffset() * 60_000
  return new Date(now.getTime() - offset).toISOString().slice(0, 10)
}

export function PaymentDialog({ open, onOpenChange, debt }: PaymentDialogProps) {
  const { user } = useAuth()
  const [amount, setAmount] = useState("")
  const [note, setNote] = useState("")
  const [paidOn, setPaidOn] = useState(todayInput)
  const [saving, setSaving] = useState(false)

  const outstanding = debt ? remaining(debt) : 0
  const symbol = CURRENCIES.find((c) => c.code === debt?.currency)?.symbol ?? ""

  useEffect(() => {
    if (!open) return
    setAmount("")
    setNote("")
    setPaidOn(todayInput())
    setSaving(false)
  }, [open, debt])

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!debt || !user) return

    const value = Number.parseFloat(amount)
    if (!Number.isFinite(value) || value <= 0) {
      toast.error("Enter an amount greater than zero.")
      return
    }
    if (value > outstanding + 0.005) {
      toast.error(`Only ${formatMoney(outstanding, debt.currency)} is still outstanding.`)
      return
    }

    setSaving(true)
    try {
      await addPayment(user.uid, debt.id, value, note, new Date(`${paidOn}T12:00:00`))
      const left = round2(outstanding - value)
      toast.success(
        left <= 0.005
          ? `${debt.personName} is all settled`
          : `Recorded ${formatMoney(value, debt.currency)} — ${formatMoney(left, debt.currency)} to go`,
      )
      onOpenChange(false)
    } catch (error) {
      toast.error((error as Error).message || "Couldn't record that payment.")
    } finally {
      setSaving(false)
    }
  }

  const quickAmounts = debt
    ? [round2(outstanding / 2), round2(outstanding)].filter(
        (value, index, all) => value > 0 && all.indexOf(value) === index,
      )
    : []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Record a payment</DialogTitle>
          <DialogDescription>
            {debt && (
              <>
                {formatMoney(outstanding, debt.currency)} still outstanding with{" "}
                <span className="text-foreground">{debt.personName}</span>.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="paymentAmount">Amount received</Label>
            <div className="relative">
              <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-sm text-muted-foreground">
                {symbol}
              </span>
              <Input
                id="paymentAmount"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0.01"
                max={outstanding}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className={cn("tabular", symbol && "pl-11")}
                autoFocus
                required
              />
            </div>

            {quickAmounts.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {quickAmounts.map((value, index) => (
                  <Button
                    key={value}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setAmount(String(value))}
                  >
                    {index === 0 && quickAmounts.length > 1 ? "Half" : "Full"} ·{" "}
                    {formatMoney(value, debt?.currency)}
                  </Button>
                ))}
              </div>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="paidOn">Paid on</Label>
              <Input
                id="paidOn"
                type="date"
                value={paidOn}
                max={todayInput()}
                onChange={(e) => setPaidOn(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentNote">
                Note <span className="text-muted-foreground">· optional</span>
              </Label>
              <Input
                id="paymentNote"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Cash / DuitNow"
                maxLength={80}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              Record payment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
