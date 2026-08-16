import { useMemo } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCompactMoney, formatMoney } from "@/lib/format"
import { remaining, statusOf, type Debt } from "@/lib/types"

interface Row {
  name: string
  value: number
  debts: number
}

/**
 * Ranked outstanding balance per person — a magnitude comparison, so: horizontal
 * bars, one series, identity carried by the axis. One series means one hue and
 * no legend; the title says what is plotted.
 */
export function TopPeopleChart({ debts, currency }: { debts: Debt[]; currency: string }) {
  const rows = useMemo<Row[]>(() => {
    const byPerson = new Map<string, Row>()

    for (const debt of debts) {
      if (debt.direction !== "owed_to_me" || statusOf(debt) === "settled") continue
      const key = debt.personName.trim()
      const existing = byPerson.get(key)
      if (existing) {
        existing.value += remaining(debt)
        existing.debts += 1
      } else {
        byPerson.set(key, { name: key, value: remaining(debt), debts: 1 })
      }
    }

    return [...byPerson.values()].sort((a, b) => b.value - a.value).slice(0, 5)
  }, [debts])

  if (rows.length === 0) return null

  // Leave room at the right for the direct value labels so they never clip.
  const max = Math.max(...rows.map((r) => r.value))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Who owes you the most</CardTitle>
        <CardDescription>Outstanding balance per person, top {rows.length}.</CardDescription>
      </CardHeader>

      <div className="px-3 pt-2 pb-5">
        <ResponsiveContainer width="100%" height={rows.length * 46 + 34}>
          <BarChart
            layout="vertical"
            data={rows}
            margin={{ top: 0, right: 76, bottom: 0, left: 4 }}
            barCategoryGap={10}
          >
            <CartesianGrid
              horizontal={false}
              stroke="var(--chart-grid)"
              strokeWidth={1}
            />
            <XAxis
              type="number"
              domain={[0, max * 1.02]}
              tickFormatter={(value: number) => formatCompactMoney(value, currency)}
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickCount={4}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={96}
              tick={{ fill: "var(--foreground)", fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              cursor={{ fill: "var(--muted)", opacity: 0.6 }}
              content={<PersonTooltip currency={currency} />}
            />
            <Bar
              dataKey="value"
              fill="var(--chart-bar)"
              barSize={20}
              /* Rounded at the data end, square where it meets the baseline. */
              radius={[0, 4, 4, 0]}
              isAnimationActive={false}
            >
              <LabelList
                dataKey="value"
                position="right"
                offset={10}
                fill="var(--foreground)"
                fontSize={12}
                formatter={(value) => formatMoney(Number(value ?? 0), currency)}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}

function PersonTooltip({
  active,
  payload,
  currency,
}: {
  active?: boolean
  payload?: { payload: Row }[]
  currency: string
}) {
  const row = payload?.[0]?.payload
  if (!active || !row) return null

  return (
    <div className="rounded-xl border border-border/70 bg-popover px-3 py-2 shadow-lg shadow-black/10">
      <p className="text-[13px] font-medium">{row.name}</p>
      <p className="mt-0.5 text-sm font-semibold">{formatMoney(row.value, currency)}</p>
      <p className="mt-0.5 text-[11px] text-muted-foreground">
        across {row.debts} {row.debts === 1 ? "debt" : "debts"}
      </p>
    </div>
  )
}
