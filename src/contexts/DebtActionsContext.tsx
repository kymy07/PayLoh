import { createContext, useCallback, useContext, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { ConfirmDialog } from "@/components/ConfirmDialog"
import { DebtDialog } from "@/components/DebtDialog"
import { PaymentDialog } from "@/components/PaymentDialog"
import { ReminderDialog } from "@/components/ReminderDialog"
import { useAuth } from "@/contexts/AuthContext"
import { deleteDebt, settleDebt } from "@/hooks/useDebts"
import { formatMoney } from "@/lib/format"
import { remaining, type Debt } from "@/lib/types"

interface DebtActionsValue {
  openCreate: () => void
  openEdit: (debt: Debt) => void
  openPayment: (debt: Debt) => void
  openReminder: (debt: Debt) => void
  confirmDelete: (debt: Debt) => void
  markSettled: (debt: Debt) => Promise<void>
}

const DebtActionsContext = createContext<DebtActionsValue | null>(null)

/**
 * Owns every debt dialog in one place so each screen can trigger the same
 * flows without re-declaring the state.
 */
export function DebtActionsProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [editing, setEditing] = useState<Debt | null>(null)
  const [debtOpen, setDebtOpen] = useState(false)
  const [paying, setPaying] = useState<Debt | null>(null)
  const [reminding, setReminding] = useState<Debt | null>(null)
  const [deleting, setDeleting] = useState<Debt | null>(null)

  const openCreate = useCallback(() => {
    setEditing(null)
    setDebtOpen(true)
  }, [])

  const openEdit = useCallback((debt: Debt) => {
    setEditing(debt)
    setDebtOpen(true)
  }, [])

  const markSettled = useCallback(
    async (debt: Debt) => {
      if (!user) return
      const outstanding = remaining(debt)
      try {
        await settleDebt(user.uid, debt)
        toast.success(`${debt.personName} settled`, {
          description: `${formatMoney(outstanding, debt.currency)} recorded as paid in full.`,
        })
      } catch (error) {
        toast.error((error as Error).message || "Couldn't settle that debt.")
      }
    },
    [user],
  )

  const handleDelete = useCallback(async () => {
    if (!deleting || !user) return
    try {
      // Payments are nested inside the debt node, so this takes them with it.
      await deleteDebt(user.uid, deleting.id)
      toast.success(`Deleted ${deleting.personName}`)
      navigate("/app/debts", { replace: true })
    } catch (error) {
      toast.error((error as Error).message || "Couldn't delete that debt.")
    }
  }, [deleting, user, navigate])

  const value = useMemo<DebtActionsValue>(
    () => ({
      openCreate,
      openEdit,
      openPayment: setPaying,
      openReminder: setReminding,
      confirmDelete: setDeleting,
      markSettled,
    }),
    [openCreate, openEdit, markSettled],
  )

  return (
    <DebtActionsContext.Provider value={value}>
      {children}

      <DebtDialog open={debtOpen} onOpenChange={setDebtOpen} debt={editing} />
      <PaymentDialog
        open={Boolean(paying)}
        onOpenChange={(open) => !open && setPaying(null)}
        debt={paying}
      />
      <ReminderDialog
        open={Boolean(reminding)}
        onOpenChange={(open) => !open && setReminding(null)}
        debt={reminding}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`Delete ${deleting?.personName ?? "this debt"}?`}
        description="The debt and its payment history are removed for good. This can't be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
      />
    </DebtActionsContext.Provider>
  )
}

export function useDebtActions() {
  const context = useContext(DebtActionsContext)
  if (!context) throw new Error("useDebtActions must be used inside a DebtActionsProvider")
  return context
}
