import {
  ArrowRight,
  BellRing,
  ChartPie,
  Check,
  Lock,
  MessageCircle,
  Smartphone,
  Wallet,
} from "lucide-react"
import { Link } from "react-router-dom"

import { Logo, LogoMark } from "@/components/Logo"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/contexts/AuthContext"
import { cn } from "@/lib/utils"

const FEATURES = [
  {
    icon: Wallet,
    title: "Every ringgit, one list",
    body: "Log a debt in seconds — who, how much, and what it was for. Both directions, so you can track what you owe too.",
  },
  {
    icon: ChartPie,
    title: "Part-payments that add up",
    body: "RM100 lent, RM30 back today. Payloh keeps the running balance and the full instalment history for you.",
  },
  {
    icon: BellRing,
    title: "Due dates that speak up",
    body: "Set a date and Payloh counts down, then flags anything overdue at the top of your dashboard.",
  },
  {
    icon: MessageCircle,
    title: "The awkward text, written",
    body: "A friendly reminder drafted with the amount and the reason, ready to open straight in WhatsApp.",
  },
  {
    icon: Lock,
    title: "Yours alone",
    body: "Security rules scope every record to your account. Nobody else can read your ledger — not even other Payloh users.",
  },
  {
    icon: Smartphone,
    title: "Built for the phone in your hand",
    body: "A tab bar, big tap targets, and dark mode that follows your system. It feels native before you install a thing.",
  },
] as const

export function Landing() {
  const { user } = useAuth()

  return (
    <div className="relative min-h-dvh overflow-hidden bg-background">
      <div className="aurora pointer-events-none absolute inset-x-0 top-0 -z-10 h-[900px]" />

      <header className="glass sticky top-0 z-40 border-b">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <div className="flex items-center gap-2">
            {user ? (
              <Button size="sm" asChild>
                <Link to="/app">
                  Open Payloh <ArrowRight />
                </Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login">Sign in</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/signup">Get started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-4 pt-20 pb-16 text-center sm:px-6 sm:pt-28">
        <Badge variant="secondary" className="mb-6 px-3 py-1 text-xs">
          Free · No ads · Your data stays yours
        </Badge>

        <h1 className="text-[clamp(2.5rem,7vw,4.5rem)] leading-[1.05] font-semibold tracking-[-0.035em] text-balance">
          Keep track of who
          <br />
          owes you{" "}
          <span className="bg-gradient-to-r from-sand via-pink to-rose bg-clip-text text-transparent">
            without the awkward
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-[17px] leading-relaxed text-balance text-muted-foreground sm:text-[19px]">
          Payloh is a quiet little ledger for the money that moves between friends. Log it, watch
          it come back in instalments, and let Payloh write the reminder for you.
        </p>

        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button size="lg" asChild className="w-full sm:w-auto">
            <Link to={user ? "/app" : "/signup"}>
              {user ? "Open your ledger" : "Start tracking — it's free"} <ArrowRight />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="w-full sm:w-auto">
            <Link to="/login">I already have an account</Link>
          </Button>
        </div>

        <p className="mt-5 text-[13px] text-muted-foreground">
          Takes about 30 seconds. No card, no catch.
        </p>
      </section>

      {/* Product shot */}
      <section className="mx-auto max-w-4xl px-4 pb-24 sm:px-6">
        <PreviewCard />
      </section>

      {/* Features */}
      <section className="border-t border-border/60 bg-card/30 py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-[clamp(1.85rem,4vw,2.75rem)] leading-tight font-semibold tracking-[-0.03em] text-balance">
              Small app. Serious about the details.
            </h2>
            <p className="mt-4 text-[17px] text-balance text-muted-foreground">
              Everything you need to settle up, and nothing you don't.
            </p>
          </div>

          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <Card
                key={title}
                className="gap-0 p-6 transition-all duration-300 ease-spring hover:-translate-y-1 hover:shadow-lg hover:shadow-black/[0.05]"
              >
                <span className="grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-cream to-blush text-[#7a3448]">
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-5 text-[17px] font-semibold tracking-[-0.015em]">{title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{body}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <h2 className="text-center text-[clamp(1.85rem,4vw,2.75rem)] leading-tight font-semibold tracking-[-0.03em] text-balance">
            Three steps, then forget about it
          </h2>

          <ol className="mt-14 grid gap-8 sm:grid-cols-3">
            {[
              { step: "01", title: "Log the debt", body: "Name, amount, and what it was for. A due date if you want one." },
              { step: "02", title: "Record what comes back", body: "Full or partial — the balance updates itself and the history stays." },
              { step: "03", title: "Nudge if you need to", body: "Payloh drafts a friendly message. One tap opens it in WhatsApp." },
            ].map(({ step, title, body }) => (
              <li key={step} className="text-center sm:text-left">
                <span className="tabular text-[13px] font-semibold tracking-widest text-primary">
                  {step}
                </span>
                <h3 className="mt-3 text-[17px] font-semibold tracking-[-0.015em]">{title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="px-4 pb-24 sm:px-6">
        <div className="relative mx-auto max-w-4xl overflow-hidden rounded-[2rem] border border-border/60 bg-gradient-to-br from-cream via-blush to-pink px-6 py-16 text-center sm:px-12">
          <h2 className="text-[clamp(1.75rem,4vw,2.5rem)] leading-tight font-semibold tracking-[-0.03em] text-balance text-[#4a2731]">
            Stop keeping score in your head
          </h2>
          <p className="mx-auto mt-4 max-w-md text-[17px] text-balance text-[#4a2731]/75">
            Get your whole ledger in one place tonight.
          </p>
          <Button size="lg" asChild className="mt-8 bg-[#4a2731] text-white hover:bg-[#3a1e26]">
            <Link to={user ? "/app" : "/signup"}>
              {user ? "Open Payloh" : "Create your free account"} <ArrowRight />
            </Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-border/60 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
          <Logo />
          <p className="text-[13px] text-muted-foreground">
            Payloh — made for friends who keep forgetting.
          </p>
        </div>
      </footer>
    </div>
  )
}

/** A static mock of the real dashboard — same components, invented numbers. */
function PreviewCard() {
  const rows = [
    { name: "Aiman", note: "Concert ticket", left: "RM 120.00", progress: 0, tone: "unpaid" },
    { name: "Sofea Rahman", note: "Dinner, split 3 ways", left: "RM 45.50", progress: 62, tone: "partial" },
    { name: "Danish", note: "Petrol money", left: "RM 0.00", progress: 100, tone: "settled" },
  ] as const

  return (
    <div className="rounded-[2rem] border border-border/70 bg-card p-2.5 shadow-2xl shadow-black/[0.08]">
      <div className="overflow-hidden rounded-[1.6rem] bg-background">
        <div className="flex items-center gap-2 border-b border-border/60 px-5 py-3.5">
          <LogoMark className="size-6 rounded-lg" />
          <span className="text-[13px] font-semibold tracking-[-0.01em]">Payloh</span>
          <div className="ml-auto flex gap-1.5">
            <span className="size-2.5 rounded-full bg-linen" />
            <span className="size-2.5 rounded-full bg-blush" />
            <span className="size-2.5 rounded-full bg-pink" />
          </div>
        </div>

        <div className="p-5 sm:p-7">
          <p className="text-[13px] text-muted-foreground">Owed to you</p>
          <p className="tabular mt-1 text-[40px] leading-none font-semibold tracking-[-0.035em]">
            RM 165.50
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="success">
              <Check className="size-3" /> 1 settled this week
            </Badge>
            <Badge variant="warning">1 due in 3 days</Badge>
          </div>

          <div className="mt-6 space-y-2.5">
            {rows.map((row) => (
              <div
                key={row.name}
                className="flex items-center gap-3.5 rounded-2xl border border-border/60 bg-card px-4 py-3.5"
              >
                <span
                  className={cn(
                    "grid size-9 shrink-0 place-items-center rounded-full text-[12px] font-semibold",
                    row.tone === "settled"
                      ? "bg-cream text-[#5a5330]"
                      : row.tone === "partial"
                        ? "bg-blush text-[#7a3448]"
                        : "bg-linen text-[#5f4a2c]",
                  )}
                >
                  {row.name.slice(0, 2).toUpperCase()}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-medium">{row.name}</p>
                  <p className="truncate text-[12px] text-muted-foreground">{row.note}</p>
                  {row.tone === "partial" && (
                    <Progress
                      value={row.progress}
                      className="mt-2 h-1"
                      indicatorClassName="bg-gradient-to-r from-blush to-rose"
                    />
                  )}
                </div>

                <p
                  className={cn(
                    "tabular shrink-0 text-[15px] font-semibold tracking-[-0.015em]",
                    row.tone === "settled" && "text-muted-foreground line-through",
                  )}
                >
                  {row.left}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
