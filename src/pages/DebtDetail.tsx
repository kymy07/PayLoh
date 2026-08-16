import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpRight,
  CalendarClock,
  Check,
  Pencil,
  RotateCcw,
  Send,
  Trash2,
  Undo2,
  Wallet,
} from "lucide-react"
import { useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"

import { ConfirmDialog } from "@/components/ConfirmDialog"
import { PersonAvatar } from "@/components/PersonAvatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/contexts/AuthContext"
import { useDebtActions } from "@/contexts/DebtActionsContext"
import { deletePayment, reopenDebt, useDebt } from "@/hooks/useDebts"
import { formatDate, formatDueLabel, formatMoney, relativeDate } from "@/lib/format"
import { isOverdue, paymentsOf, remaining, statusOf, type Payment } from "@/lib/types"
import { cn } from "@/lib/utils"

export function DebtDetail() {
  const { debtId } = useParams<{ debtId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { debt, loading } = useDebt(debtId)
  const actions = useDebtActions()

  // Payments ride along inside the debt node, so there's no second listener.
  const payments = paymentsOf(debt)

  const [reopening, setReopening] = useState(false)
  const [removing, setRemoving] = useState<Payment | null>(null)

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-56 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    )
  }

  if (!debt) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-2xl font-semibold tracking-[-0.03em]">Debt not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          It may have been deleted, or the link is wrong.
        </p>
        <Button className="mt-6" asChild>
          <Link to="/app/debts">
            <ArrowLeft /> Back to debts
          </Link>
        </Button>
      </div>
    )
  }

  const status = statusOf(debt)
  const left = remaining(debt)
  const overdue = isOverdue(debt)
  const dueLabel = formatDueLabel(debt.dueDate)
  const progress = debt.amount > 0 ? Math.min(100, (debt.paid / debt.amount) * 100) : 0
  const incoming = debt.direction === "owed_to_me"

  async function handleReopen() {
    if (!debt || !user) return
    try {
      await reopenDebt(user.uid, debt.id)
      toast.success("Debt reopened", { description: "Payment history cleared." })
    } catch (error) {
      toast.error((error as Error).message || "Couldn't reopen that debt.")
    }
  }

  async function handleRemovePayment() {
    if (!debt || !user || !removing) return
    try {
      await deletePayment(user.uid, debt.id, removing.id)
      toast.success("Payment removed")
    } catch (error) {
      toast.error((error as Error).message || "Couldn't remove that payment.")
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="-ml-2">
        <ArrowLeft /> Back
      </Button>

      <Card className="gap-0 p-6 sm:p-7">
        <div className="flex items-start gap-4">
          <PersonAvatar name={debt.personName} className="size-14 text-base" />

          <div className="min-w-0 flex-1">
            <h1 className="truncate text-2xl font-semibold tracking-[-0.03em]">
              {debt.personName}
            </h1>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              {incoming ? (
                <ArrowDownLeft className="size-4 shrink-0 text-success" />
              ) : (
                <ArrowUpRight className="size-4 shrink-0 text-warning" />
              )}
              {incoming ? "Owes you" : "You owe them"}
              {debt.personPhone && <> · {debt.personPhone}</>}
            </p>
          </div>
        </div>

        {debt.description && (
          <p className="mt-5 rounded-xl bg-muted/60 px-4 py-3 text-[15px] leading-relaxed">
            {debt.description}
          </p>
        )}

        <div className="mt-6 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-[13px] font-medium text-muted-foreground">
            {status === "settled" ? "Fully settled" : "Still outstanding"}
          </span>
        </div>
        <p
          className={cn(
            "mt-1 text-[clamp(2.25rem,7vw,3rem)] leading-none font-semibold tracking-[-0.04em]",
            status === "settled" && "text-muted-foreground",
          )}
        >
          {formatMoney(left, debt.currency)}
        </p>

        {debt.paid > 0 && (
          <>
            <Progress
              value={progress}
              className="mt-5 h-1.5"
              indicatorClassName="bg-gradient-to-r from-blush to-rose"
            />
            <div className="mt-2 flex justify-between text-[13px] text-muted-foreground">
              <span className="tabular">{formatMoney(debt.paid, debt.currency)} paid</span>
              <span className="tabular">of {formatMoney(debt.amount, debt.currency)}</span>
            </div>
          </>
        )}

        <div className="mt-5 flex flex-wrap gap-2">
          {status === "settled" && (
            <Badge variant="success">
              <Check className="size-3" /> Settled {relativeDate(debt.settledAt)}
            </Badge>
          )}
          {status === "partial" && <Badge>{Math.round(progress)}% paid</Badge>}
          {status === "unpaid" && <Badge variant="outline">Nothing paid yet</Badge>}
          {dueLabel && status !== "settled" && (
            <Badge variant={overdue ? "destructive" : "secondary"}>
              <CalendarClock className="size-3" /> {dueLabel}
            </Badge>
          )}
          <Badge variant="outline">Added {relativeDate(debt.createdAt)}</Badge>
        </div>

        <Separator className="my-6" />

        <div className="flex flex-wrap gap-2">
          {status === "settled" ? (
            <Button variant="outline" onClick={() => setReopening(true)}>
              <RotateCcw /> Reopen debt
            </Button>
          ) : (
            <>
              <Button onClick={() => actions.openPayment(debt)}>
                <Wallet /> Record payment
              </Button>
              <Button variant="secondary" onClick={() => actions.markSettled(debt)}>
                <Check /> Mark fully paid
              </Button>
            </>
          )}
          <Button variant="outline" onClick={() => actions.openReminder(debt)}>
            <Send /> Remind
          </Button>
          <Button variant="ghost" onClick={() => actions.openEdit(debt)}>
            <Pencil /> Edit
          </Button>
          <Button
            variant="ghost"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => actions.confirmDelete(debt)}
          >
            <Trash2 /> Delete
          </Button>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment history</CardTitle>
          <CardDescription>
            {payments.length === 0
              ? "No instalments recorded yet."
              : `${payments.length} ${payments.length === 1 ? "payment" : "payments"} totalling ${formatMoney(debt.paid, debt.currency)}.`}
          </CardDescription>
        </CardHeader>

        <div className="px-6 pb-6">
          {payments.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
              Record a payment and it'll appear here with its date and note.
            </p>
          ) : (
            <ol className="space-y-2">
              {payments.map((payment) => (
                <li
                  key={payment.id}
                  className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/30 px-4 py-3"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-success/12 text-success">
                    <Check className="size-4" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="tabular text-[15px] font-medium">
                      {formatMoney(payment.amount, debt.currency)}
                    </p>
                    <p className="truncate text-[13px] text-muted-foreground">
                      {formatDate(payment.paidAt)}
                      {payment.note && ` · ${payment.note}`}
                    </p>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setRemoving(payment)}
                    aria-label={`Remove payment of ${formatMoney(payment.amount, debt.currency)}`}
                  >
                    <Undo2 />
                  </Button>
                </li>
              ))}
            </ol>
          )}
        </div>
      </Card>

      <ConfirmDialog
        open={reopening}
        onOpenChange={setReopening}
        title="Reopen this debt?"
        description="The balance goes back to the full amount and every recorded payment is cleared."
        confirmLabel="Reopen"
        onConfirm={handleReopen}
      />

      <ConfirmDialog
        open={Boolean(removing)}
        onOpenChange={(open) => !open && setRemoving(null)}
        title="Remove this payment?"
        description={
          removing
            ? `${formatMoney(removing.amount, debt.currency)} goes back onto the outstanding balance.`
            : ""
        }
        confirmLabel="Remove"
        destructive
        onConfirm={handleRemovePayment}
      />
    </div>
  )
}
