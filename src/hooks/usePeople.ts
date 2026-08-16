import { useMemo } from "react"

import { isOverdue, remaining, round2, statusOf, type Debt } from "@/lib/types"

export interface Person {
  /** Lowercased name — the identity two spellings of "Aiman" collapse onto. */
  key: string
  name: string
  phone?: string | null
  /** Still outstanding, in each direction. */
  owedToMe: number
  iOwe: number
  /** Positive means they owe you overall. */
  net: number
  lent: number
  paidBack: number
  debtCount: number
  activeCount: number
  settledCount: number
  overdueCount: number
  nextDue: number | null
  lastActivity: number
  debts: Debt[]
}

/**
 * Rolls the ledger up per person.
 *
 * Names are matched case-insensitively so "aiman" and "Aiman" stay one person;
 * the display name and phone come from the most recent debt, which is the
 * spelling and number you last confirmed.
 */
export function usePeople(debts: Debt[]): Person[] {
  return useMemo(() => {
    const byKey = new Map<string, Person>()

    for (const debt of debts) {
      const name = debt.personName.trim()
      const key = name.toLowerCase()

      let person = byKey.get(key)
      if (!person) {
        person = {
          key,
          name,
          phone: debt.personPhone ?? null,
          owedToMe: 0,
          iOwe: 0,
          net: 0,
          lent: 0,
          paidBack: 0,
          debtCount: 0,
          activeCount: 0,
          settledCount: 0,
          overdueCount: 0,
          nextDue: null,
          lastActivity: 0,
          debts: [],
        }
        byKey.set(key, person)
      }

      person.debts.push(debt)
      person.debtCount++

      const left = remaining(debt)
      if (statusOf(debt) === "settled") {
        person.settledCount++
      } else {
        person.activeCount++
        if (debt.direction === "owed_to_me") person.owedToMe += left
        else person.iOwe += left

        if (isOverdue(debt)) person.overdueCount++
        if (debt.dueDate && (person.nextDue === null || debt.dueDate < person.nextDue)) {
          person.nextDue = debt.dueDate
        }
      }

      if (debt.direction === "owed_to_me") {
        person.lent += debt.amount
        person.paidBack += debt.paid
      }

      // Debts arrive newest-first, so the first phone seen is the freshest.
      if (!person.phone && debt.personPhone) person.phone = debt.personPhone
      person.lastActivity = Math.max(person.lastActivity, debt.updatedAt ?? debt.createdAt ?? 0)
    }

    const people = [...byKey.values()]
    for (const person of people) {
      person.owedToMe = round2(person.owedToMe)
      person.iOwe = round2(person.iOwe)
      person.net = round2(person.owedToMe - person.iOwe)
      person.lent = round2(person.lent)
      person.paidBack = round2(person.paidBack)
    }

    // Biggest outstanding first; settled-up people sink to the bottom.
    return people.sort(
      (a, b) => Math.abs(b.net) - Math.abs(a.net) || b.lastActivity - a.lastActivity,
    )
  }, [debts])
}

/** One person by their key, for the person detail route. */
export function usePerson(debts: Debt[], key: string | undefined): Person | null {
  const people = usePeople(debts)
  return useMemo(() => {
    if (!key) return null
    const needle = decodeURIComponent(key).trim().toLowerCase()
    return people.find((person) => person.key === needle) ?? null
  }, [people, key])
}

/** Just the names and numbers, for the picker in the new-debt dialog. */
export function usePersonSuggestions(debts: Debt[]) {
  const people = usePeople(debts)
  return useMemo(
    () =>
      [...people]
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(({ key, name, phone, activeCount, owedToMe, iOwe }) => ({
          key,
          name,
          phone,
          activeCount,
          outstanding: round2(owedToMe + iOwe),
        })),
    [people],
  )
}
