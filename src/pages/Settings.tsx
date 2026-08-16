import { Check, LogOut, Monitor, Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { LargeTitle } from "@/components/PageTitle"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAuth } from "@/contexts/AuthContext"
import { useTheme, type Theme } from "@/contexts/ThemeContext"
import { useDebts, useDebtTotals } from "@/hooks/useDebts"
import { CURRENCIES, formatMoney } from "@/lib/format"
import { cn } from "@/lib/utils"

const THEMES: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
]

export function Settings() {
  const { user, profile, currency, updateCurrency, updateDisplayName, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const { debts } = useDebts()
  const totals = useDebtTotals(debts)
  const navigate = useNavigate()

  const [name, setName] = useState(profile?.displayName ?? "")
  const [savingName, setSavingName] = useState(false)

  // The profile arrives a tick after the auth user does.
  useEffect(() => {
    if (profile?.displayName) setName(profile.displayName)
  }, [profile?.displayName])

  const nameChanged = name.trim().length > 0 && name.trim() !== profile?.displayName

  async function handleSaveName() {
    setSavingName(true)
    try {
      await updateDisplayName(name.trim())
      toast.success("Name updated")
    } catch {
      toast.error("Couldn't update your name. Try again.")
    } finally {
      setSavingName(false)
    }
  }

  async function handleCurrency(next: string) {
    try {
      await updateCurrency(next)
      toast.success(`Currency set to ${next}`, {
        description: "New debts use this. Existing ones keep the currency they were logged in.",
      })
    } catch {
      toast.error("Couldn't change the currency. Try again.")
    }
  }

  async function handleLogout() {
    try {
      await logout()
      navigate("/", { replace: true })
    } catch {
      toast.error("Couldn't sign out. Try again.")
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <LargeTitle
        title="Settings"
        description="Your account, your defaults, your ledger."
        className="pb-0"
      />

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>How Payloh addresses you and signs your reminders.</CardDescription>
        </CardHeader>

        <div className="space-y-4 px-6 pb-6">
          <div className="space-y-2">
            <Label htmlFor="displayName">Display name</Label>
            <div className="flex gap-2">
              <Input
                id="displayName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
              <Button onClick={handleSaveName} disabled={!nameChanged} loading={savingName}>
                Save
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountEmail">Email</Label>
            <Input id="accountEmail" value={user?.email ?? ""} disabled readOnly />
            <p className="text-xs text-muted-foreground">
              Sign-in email can't be changed from here.
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Currency</CardTitle>
          <CardDescription>Used for every new debt you log.</CardDescription>
        </CardHeader>

        <div className="px-6 pb-6">
          <Select value={currency} onValueChange={handleCurrency}>
            <SelectTrigger aria-label="Default currency">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map(({ code, label, symbol }) => (
                <SelectItem key={code} value={code}>
                  {symbol} · {label} ({code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Follows your system unless you pick a side.</CardDescription>
        </CardHeader>

        <div className="px-6 pb-6">
          <div className="grid grid-cols-3 gap-2">
            {THEMES.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setTheme(value)}
                aria-pressed={theme === value}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-2xl border px-3 py-4 text-[13px] font-medium transition-all duration-200 ease-spring",
                  theme === value
                    ? "border-primary/40 bg-accent/40 text-accent-foreground"
                    : "border-border text-muted-foreground hover:border-primary/25 hover:text-foreground",
                )}
              >
                <Icon className="size-5" />
                {label}
                {theme === value && <Check className="size-3.5 text-primary" />}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your ledger</CardTitle>
          <CardDescription>A quick count of everything Payloh is holding.</CardDescription>
        </CardHeader>

        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-b-2xl bg-border sm:grid-cols-4">
          {[
            { label: "Owed to you", value: formatMoney(totals.owedToMe, currency) },
            { label: "You owe", value: formatMoney(totals.iOwe, currency) },
            { label: "Active", value: String(totals.activeCount) },
            { label: "Settled", value: String(totals.settledCount) },
          ].map(({ label, value }) => (
            <div key={label} className="bg-card px-4 py-5">
              <dt className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                {label}
              </dt>
              <dd className="mt-1.5 text-lg font-semibold tracking-[-0.02em]">{value}</dd>
            </div>
          ))}
        </dl>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Session</CardTitle>
          <CardDescription>
            Signed in as {profile?.displayName ?? user?.email}.
          </CardDescription>
        </CardHeader>

        <div className="px-6 pb-6">
          <Button variant="outline" onClick={handleLogout}>
            <LogOut /> Sign out
          </Button>
        </div>
      </Card>
    </div>
  )
}
