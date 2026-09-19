/** Which way the money is owed, from the signed-in user's point of view. */
export type DebtDirection = "owed_to_me" | "i_owe"

export type DebtStatus = "unpaid" | "partial" | "settled"

/** Realtime Database has no timestamp type — everything is epoch milliseconds. */
export type Millis = number

export interface Payment {
  id: string
  amount: number
  note?: string | null
  paidAt: Millis
  createdAt: Millis
}

/**
 * One debt = one person + one amount. `paid` is a running total kept on the
 * debt itself, and payments are nested underneath so a single Realtime Database
 * transaction can update both without them ever drifting apart.
 */
export interface Debt {
  id: string
  ownerId: string
  personName: string
  personPhone?: string | null
  direction: DebtDirection
  amount: number
  paid: number
  currency: string
  description?: string | null
  dueDate?: Millis | null
  settledAt?: Millis | null
  createdAt: Millis
  updatedAt: Millis
  payments?: Record<string, Omit<Payment, "id">>
}

export type DebtDraft = {
  personName: string
  personPhone?: string
  direction: DebtDirection
  amount: number
  description?: string
  dueDate?: Date | null
}

export interface UserProfile {
  uid: string
  displayName: string
  email: string
  photoURL?: string | null
  currency: string
  createdAt: Millis
}

export function remaining(debt: Debt): number {
  return Math.max(0, round2(debt.amount - debt.paid))
}

export function statusOf(debt: Debt): DebtStatus {
  if (remaining(debt) <= 0.005) return "settled"
  return debt.paid > 0 ? "partial" : "unpaid"
}

export function isOverdue(debt: Debt): boolean {
  if (!debt.dueDate || statusOf(debt) === "settled") return false
  return debt.dueDate < Date.now()
}

/** The nested payments map as a list, newest first. */
export function paymentsOf(debt: Debt | null | undefined): Payment[] {
  if (!debt?.payments) return []
  return Object.entries(debt.payments)
    .map(([id, payment]) => ({ id, ...payment }))
    .sort((a, b) => b.paidAt - a.paidAt)
}

/** Money maths in floats drifts; snap every result back to two decimals. */
export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100
}

/** How badly you want it — three levels, highest first. */
export type WishPriority = "high" | "medium" | "low"

export const WISH_PRIORITIES: { value: WishPriority; label: string; hint: string }[] = [
  { value: "high", label: "Must have", hint: "Genuinely needed, buy first" },
  { value: "medium", label: "Want", hint: "Would be nice soon" },
  { value: "low", label: "Nice to have", hint: "Only if there's spare cash" },
]

export interface WishItem {
  id: string
  name: string
  link?: string | null
  price: number
  currency: string
  priority: WishPriority
  note?: string | null
  boughtAt?: Millis | null
  createdAt: Millis
  updatedAt: Millis
}

export type WishDraft = {
  name: string
  link?: string
  price: number
  priority: WishPriority
  note?: string
}
