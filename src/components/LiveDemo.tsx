import { Check } from "lucide-react"
import { useEffect, useState } from "react"

import { AnimatedNumber } from "@/components/AnimatedNumber"
import { LogoMark } from "@/components/Logo"
import { cn } from "@/lib/utils"

interface Row {
  initials: string
  name: string
  note: string
  amount: number
  paid: number
}

/** Two states of the same ledger: a payment lands on the middle row. */
const BEFORE: Row[] = [
  { initials: "AI", name: "Aiman", note: "Concert ticket", amount: 120, paid: 0 },
  { initials: "SR", name: "Sofea", note: "Dinner, split three ways", amount: 120, paid: 74.5 },
  { initials: "DN", name: "Danish", note: "Petrol money", amount: 60, paid: 60 },
]

const AFTER: Row[] = [
  { initials: "AI", name: "Aiman", note: "Concert ticket", amount: 120, paid: 0 },
  { initials: "SR", name: "Sofea", note: "Dinner, split three ways", amount: 120, paid: 120 },
  { initials: "DN", name: "Danish", note: "Petrol money", amount: 60, paid: 60 },
]

const money = (n: number) =>
  `RM ${n.toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

/**
 * The product shot, except it runs.
 *
 * A still image of an interface says "here is a screenshot"; the interface
 * actually settling a debt in front of you says what the app is for. Everything
 * here is the real type scale and the real row layout, just on invented data.
 */
export function LiveDemo() {
  const [settled, setSettled] = useState(false)

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const id = window.setInterval(() => setSettled((v) => !v), 3600)
    return () => window.clearInterval(id)
  }, [])

  const rows = settled ? AFTER : BEFORE
  const outstanding = rows.reduce((sum, r) => sum + (r.amount - r.paid), 0)

  return (
    <div className="rounded-[1.75rem] border border-border bg-card p-2 shadow-[0_24px_70px_-24px_rgb(28_26_23/0.28)]">
      <div className="overflow-hidden rounded-[1.375rem] bg-background">
        <div className="flex items-center gap-2 border-b border-separator px-4 py-3">
          <LogoMark className="size-5" />
          <span className="text-footnote font-semibold">Payloh</span>
          <span className="text-caption-2 ml-auto text-muted-foreground">Dashboard</span>
        </div>

        <div className="p-5 sm:p-6">
          <p className="text-footnote text-muted-foreground">Owed to you</p>
          <AnimatedNumber
            value={outstanding}
            format={money}
            durationMs={900}
            className="mt-1 block text-[clamp(2rem,6vw,2.75rem)] leading-none font-bold tracking-[-0.03em]"
          />

          <div className="mt-5 overflow-hidden rounded-xl border border-border">
            {rows.map((row, index) => {
              const left = row.amount - row.paid
              const done = left <= 0.005
              const progress = (row.paid / row.amount) * 100
              const justSettled = settled && index === 1

              return (
                <div
                  key={row.name}
                  className={cn(
                    "flex items-center gap-3 bg-card px-3.5 py-3 transition-colors duration-700",
                    index > 0 && "border-t border-separator",
                    justSettled && "bg-success/8",
                  )}
                >
                  <span
                    className={cn(
                      "text-caption grid size-9 shrink-0 place-items-center rounded-full font-semibold transition-all duration-500",
                      done
                        ? "bg-success/12 text-success"
                        : index === 0
                          ? "bg-linen text-[#5f4a2c]"
                          : "bg-blush text-[#7a3448]",
                    )}
                  >
                    {done ? <Check className="size-4" strokeWidth={2.5} /> : row.initials}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="text-subhead truncate font-medium">{row.name}</p>
                    <p className="text-caption truncate text-muted-foreground">{row.note}</p>
                    {!done && row.paid > 0 && (
                      <div className="mt-1.5 h-[3px] w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary transition-[width] duration-[900ms] ease-[cubic-bezier(0.32,0.72,0,1)]"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    )}
                  </div>

                  <p
                    className={cn(
                      "tabular text-subhead shrink-0 font-semibold transition-colors duration-500",
                      done && "text-muted-foreground line-through",
                    )}
                  >
                    {money(left)}
                  </p>
                </div>
              )
            })}
          </div>

          <p className="text-caption mt-3 flex items-center gap-1.5 text-muted-foreground">
            <span
              className={cn(
                "size-1.5 rounded-full transition-colors duration-500",
                settled ? "bg-success" : "bg-muted-foreground/40",
              )}
            />
            {settled ? "Sofea just settled up" : "Waiting on two payments"}
          </p>
        </div>
      </div>
    </div>
  )
}
