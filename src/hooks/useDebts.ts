import {
  onValue,
  push,
  ref,
  remove,
  runTransaction,
  serverTimestamp,
  update,
} from "firebase/database"
import { useEffect, useMemo, useState } from "react"

import { useAuth } from "@/contexts/AuthContext"
import { db, isFirebaseConfigured } from "@/lib/firebase"
import {
  isOverdue,
  paymentsOf,
  remaining,
  round2,
  statusOf,
  type Debt,
  type DebtDraft,
} from "@/lib/types"

const debtsPath = (uid: string) => `debts/${uid}`
const debtPath = (uid: string, debtId: string) => `debts/${uid}/${debtId}`

/**
 * Live list of the signed-in user's debts.
 *
 * Debts are stored under the owner's uid, so there is no query to filter — the
 * subtree *is* the user's ledger. Ordering happens in memory, which keeps the
 * sort controls on the list page free.
 */
export function useDebts() {
  const { user } = useAuth()
  const [debts, setDebts] = useState<Debt[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isFirebaseConfigured || !user) {
      setDebts([])
      setLoading(false)
      return
    }

    setLoading(true)
    return onValue(
      ref(db, debtsPath(user.uid)),
      (snapshot) => {
        const value = (snapshot.val() ?? {}) as Record<string, Omit<Debt, "id">>
        const rows = Object.entries(value).map(([id, debt]) => ({ id, ...debt }))
        rows.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0))
        setDebts(rows)
        setLoading(false)
        setError(null)
      },
      (err) => {
        setError(err.message)
        setLoading(false)
      },
    )
  }, [user])

  return { debts, loading, error }
}

/** A single debt, live — used by the detail screen after a deep link. */
export function useDebt(debtId: string | undefined) {
  const { user } = useAuth()
  const [debt, setDebt] = useState<Debt | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isFirebaseConfigured || !user || !debtId) {
      setDebt(null)
      setLoading(false)
      return
    }

    setLoading(true)
    return onValue(
      ref(db, debtPath(user.uid, debtId)),
      (snapshot) => {
        const value = snapshot.val() as Omit<Debt, "id"> | null
        setDebt(value ? { id: snapshot.key!, ...value } : null)
        setLoading(false)
      },
      () => setLoading(false),
    )
  }, [user, debtId])

  return { debt, loading }
}

export async function createDebt(ownerId: string, currency: string, draft: DebtDraft) {
  const debtRef = push(ref(db, debtsPath(ownerId)))

  // Realtime Database strips null children rather than storing them, so an
  // omitted phone or due date simply leaves the key absent.
  await update(debtRef, {
    ownerId,
    personName: draft.personName.trim(),
    personPhone: draft.personPhone?.trim() || null,
    direction: draft.direction,
    amount: round2(draft.amount),
    paid: 0,
    currency,
    description: draft.description?.trim() || null,
    dueDate: draft.dueDate ? draft.dueDate.getTime() : null,
    settledAt: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  return debtRef.key!
}

export async function updateDebt(ownerId: string, debtId: string, draft: DebtDraft) {
  await update(ref(db, debtPath(ownerId, debtId)), {
    personName: draft.personName.trim(),
    personPhone: draft.personPhone?.trim() || null,
    direction: draft.direction,
    amount: round2(draft.amount),
    description: draft.description?.trim() || null,
    dueDate: draft.dueDate ? draft.dueDate.getTime() : null,
    updatedAt: serverTimestamp(),
  })
}

/**
 * Records an instalment.
 *
 * Payments live *inside* the debt node, so one transaction covers both the new
 * instalment and the running total — they can never disagree, even with the
 * same debt open in two tabs. Transactions run the callback locally, so these
 * timestamps are client clock rather than `serverTimestamp()`.
 */
export async function addPayment(
  ownerId: string,
  debtId: string,
  amount: number,
  note?: string,
  paidAt?: Date,
) {
  const value = round2(amount)
  if (value <= 0) throw new Error("Payment must be more than zero.")

  let failure: string | null = null

  const result = await runTransaction(ref(db, debtPath(ownerId, debtId)), (current) => {
    const debt = current as Omit<Debt, "id"> | null
    if (!debt) {
      failure = "This debt no longer exists."
      return // abort
    }

    const outstanding = round2(debt.amount - debt.paid)
    if (value > outstanding + 0.005) {
      failure = `That's more than the ${outstanding.toFixed(2)} still outstanding.`
      return // abort
    }

    const now = Date.now()
    const nextPaid = round2(debt.paid + value)
    const paymentId = `p_${now}_${Math.random().toString(36).slice(2, 8)}`

    return {
      ...debt,
      paid: nextPaid,
      settledAt: nextPaid >= round2(debt.amount) - 0.005 ? now : null,
      updatedAt: now,
      payments: {
        ...(debt.payments ?? {}),
        [paymentId]: {
          amount: value,
          note: note?.trim() || null,
          paidAt: paidAt ? paidAt.getTime() : now,
          createdAt: now,
        },
      },
    }
  })

  if (failure) throw new Error(failure)
  if (!result.committed) throw new Error("Couldn't record that payment. Try again.")
}

/** Removes an instalment and gives the balance back. */
export async function deletePayment(ownerId: string, debtId: string, paymentId: string) {
  let failure: string | null = null

  const result = await runTransaction(ref(db, debtPath(ownerId, debtId)), (current) => {
    const debt = current as Omit<Debt, "id"> | null
    if (!debt) {
      failure = "This debt no longer exists."
      return
    }

    const payment = debt.payments?.[paymentId]
    if (!payment) {
      failure = "That payment has already been removed."
      return
    }

    const payments = { ...debt.payments }
    delete payments[paymentId]

    return {
      ...debt,
      payments: Object.keys(payments).length > 0 ? payments : null,
      paid: Math.max(0, round2(debt.paid - payment.amount)),
      settledAt: null,
      updatedAt: Date.now(),
    }
  })

  if (failure) throw new Error(failure)
  if (!result.committed) throw new Error("Couldn't remove that payment. Try again.")
}

/** "Pay Full" — logs whatever is left as one final instalment. */
export async function settleDebt(ownerId: string, debt: Debt) {
  const outstanding = remaining(debt)
  if (outstanding <= 0.005) return
  await addPayment(ownerId, debt.id, outstanding, "Settled in full")
}

/** Reopens a settled debt by clearing its payment history. */
export async function reopenDebt(ownerId: string, debtId: string) {
  await update(ref(db, debtPath(ownerId, debtId)), {
    payments: null,
    paid: 0,
    settledAt: null,
    updatedAt: serverTimestamp(),
  })
}

/** Payments are nested, so removing the debt takes its history with it. */
export async function deleteDebt(ownerId: string, debtId: string) {
  await remove(ref(db, debtPath(ownerId, debtId)))
}

export interface DebtTotals {
  owedToMe: number
  iOwe: number
  net: number
  collected: number
  overdueCount: number
  activeCount: number
  settledCount: number
  peopleCount: number
}

/** Everything the dashboard tiles need, derived in one pass. */
export function useDebtTotals(debts: Debt[]): DebtTotals {
  return useMemo(() => {
    let owedToMe = 0
    let iOwe = 0
    let collected = 0
    let overdueCount = 0
    let activeCount = 0
    let settledCount = 0
    const people = new Set<string>()

    for (const debt of debts) {
      people.add(debt.personName.trim().toLowerCase())
      const left = remaining(debt)

      if (statusOf(debt) === "settled") {
        settledCount++
      } else {
        activeCount++
        if (debt.direction === "owed_to_me") owedToMe += left
        else iOwe += left
        if (isOverdue(debt)) overdueCount++
      }

      if (debt.direction === "owed_to_me") collected += debt.paid
    }

    return {
      owedToMe: round2(owedToMe),
      iOwe: round2(iOwe),
      net: round2(owedToMe - iOwe),
      collected: round2(collected),
      overdueCount,
      activeCount,
      settledCount,
      peopleCount: people.size,
    }
  }, [debts])
}

export { paymentsOf }
