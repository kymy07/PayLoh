import { differenceInCalendarDays, format, isToday, isTomorrow, isYesterday } from "date-fns"
import type { Millis } from "@/lib/types"

export const CURRENCIES = [
  { code: "MYR", label: "Malaysian Ringgit", symbol: "RM" },
  { code: "SGD", label: "Singapore Dollar", symbol: "S$" },
  { code: "USD", label: "US Dollar", symbol: "$" },
  { code: "IDR", label: "Indonesian Rupiah", symbol: "Rp" },
  { code: "GBP", label: "Pound Sterling", symbol: "£" },
  { code: "EUR", label: "Euro", symbol: "€" },
  { code: "AUD", label: "Australian Dollar", symbol: "A$" },
] as const

export function formatMoney(amount: number, currency = "MYR"): string {
  try {
    return new Intl.NumberFormat("en-MY", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    return `${currency} ${amount.toFixed(2)}`
  }
}

/** Compact form for stat tiles, where a long number would wrap. */
export function formatCompactMoney(amount: number, currency = "MYR"): string {
  if (Math.abs(amount) < 10_000) return formatMoney(amount, currency)
  try {
    return new Intl.NumberFormat("en-MY", {
      style: "currency",
      currency,
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(amount)
  } catch {
    return `${currency} ${amount.toFixed(0)}`
  }
}

export function toDate(value: Millis | Date | null | undefined): Date | null {
  if (!value) return null
  return value instanceof Date ? value : new Date(value)
}

export function formatDate(value: Millis | Date | null | undefined): string {
  const date = toDate(value)
  return date ? format(date, "d MMM yyyy") : "—"
}

/** "Due today" / "3 days left" / "5 days overdue" — the phrasing on cards. */
export function formatDueLabel(value: Millis | Date | null | undefined): string | null {
  const date = toDate(value)
  if (!date) return null
  if (isToday(date)) return "Due today"
  if (isTomorrow(date)) return "Due tomorrow"
  if (isYesterday(date)) return "1 day overdue"

  const days = differenceInCalendarDays(date, new Date())
  if (days < 0) return `${Math.abs(days)} days overdue`
  if (days <= 30) return `${days} days left`
  return `Due ${format(date, "d MMM")}`
}

export function relativeDate(value: Millis | Date | null | undefined): string {
  const date = toDate(value)
  if (!date) return "—"
  if (isToday(date)) return "Today"
  if (isYesterday(date)) return "Yesterday"
  return format(date, "d MMM yyyy")
}

export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase()
}

/**
 * Names get a stable colour so the same friend always looks the same, drawn
 * from the Payloh swatch rather than a random hue.
 */
const AVATAR_TINTS = [
  "bg-blush text-[#7a3448]",
  "bg-cream text-[#5a5330]",
  "bg-linen text-[#5f4a2c]",
  "bg-pink text-white",
  "bg-sand text-[#3d3018]",
  "bg-rose text-white",
] as const

export function tintFor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0
  return AVATAR_TINTS[hash % AVATAR_TINTS.length]!
}
