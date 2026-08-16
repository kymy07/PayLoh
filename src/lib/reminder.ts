import { formatDueLabel, formatMoney } from "@/lib/format"
import { remaining, type Debt } from "@/lib/types"

/**
 * A nudge you would actually be willing to send — friendly, specific about the
 * amount, and never guilt-tripping.
 */
export function buildReminderMessage(debt: Debt, senderName?: string): string {
  const outstanding = formatMoney(remaining(debt), debt.currency)
  const lines: string[] = []

  if (debt.direction === "owed_to_me") {
    lines.push(`Hey ${debt.personName.split(" ")[0]}! Just a friendly reminder about ${outstanding}.`)
  } else {
    lines.push(`Hey ${debt.personName.split(" ")[0]}! Just confirming I still owe you ${outstanding}.`)
  }

  if (debt.description) lines.push(`For: ${debt.description}`)

  const due = formatDueLabel(debt.dueDate)
  if (due) lines.push(due.startsWith("Due") ? due : `Heads up — ${due.toLowerCase()}.`)

  if (debt.paid > 0) {
    lines.push(`(${formatMoney(debt.paid, debt.currency)} of ${formatMoney(debt.amount, debt.currency)} already paid.)`)
  }

  lines.push("")
  lines.push(senderName ? `— ${senderName}, via Payloh` : "— sent with Payloh")

  return lines.join("\n")
}

/** Strips spaces, dashes and a leading 0/+ so wa.me accepts the number. */
export function normalisePhone(phone: string | undefined | null): string | null {
  if (!phone) return null
  const digits = phone.replace(/[^\d+]/g, "")
  if (!digits) return null
  if (digits.startsWith("+")) return digits.slice(1)
  // A local Malaysian number like 012-345 6789 needs the country code added.
  if (digits.startsWith("0")) return `60${digits.slice(1)}`
  return digits
}

export function whatsappLink(debt: Debt, message: string): string {
  const phone = normalisePhone(debt.personPhone)
  const text = encodeURIComponent(message)
  return phone ? `https://wa.me/${phone}?text=${text}` : `https://wa.me/?text=${text}`
}
