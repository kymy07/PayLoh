import {
  ArrowRight,
  BellRing,
  ChartPie,
  Lock,
  MessageCircle,
  Smartphone,
  Wallet,
} from "lucide-react"
import { Link } from "react-router-dom"

import { LiveDemo } from "@/components/LiveDemo"
import { Logo } from "@/components/Logo"
import { Reveal } from "@/components/Reveal"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"

const FEATURES = [
  {
    icon: Wallet,
    title: "Every ringgit, one list",
    body: "Who, how much, what it was for. Both directions, so what you owe is tracked too.",
  },
  {
    icon: ChartPie,
    title: "Part-payments that add up",
    body: "RM100 lent, RM30 back today. The balance and the instalment history keep themselves straight.",
  },
  {
    icon: BellRing,
    title: "Due dates that speak up",
    body: "Set a date and Payloh counts down, then floats anything overdue to the top.",
  },
  {
    icon: MessageCircle,
    title: "The awkward text, written",
    body: "A friendly reminder with the amount and the reason, ready to open in WhatsApp.",
  },
  {
    icon: Lock,
    title: "Yours alone",
    body: "Security rules scope every record to your account. Nobody else can read your ledger.",
  },
  {
    icon: Smartphone,
    title: "Built for the phone in your hand",
    body: "A tab bar, big tap targets, and dark mode that follows your system.",
  },
] as const

const STEPS = [
  { n: "01", title: "Log the debt", body: "Name, amount, what it was for. A due date if you want one." },
  { n: "02", title: "Record what comes back", body: "Full or partial. The balance updates, the history stays." },
  { n: "03", title: "Nudge if you need to", body: "Payloh drafts the message. One tap opens WhatsApp." },
] as const

export function Landing() {
  const { user } = useAuth()

  return (
    <div className="min-h-dvh bg-background">
      <header className="material pinned sticky top-0 z-40 border-b border-[--material-border]">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <Logo markClassName="size-8" />
          <div className="flex items-center gap-1.5">
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

      {/* Hero. The reference sets a compact line of type against one very large
          visual, so the interface is the thing you actually look at. */}
      <section className="mx-auto max-w-3xl px-5 pt-16 pb-10 text-center sm:pt-20">
        <Reveal>
          <h1 className="text-[clamp(2.25rem,6vw,3.5rem)] leading-[1.05] font-bold tracking-[-0.035em] text-balance">
            Keep track of who owes you.
            <br />
            <span className="text-muted-foreground">Without the awkward.</span>
          </h1>
        </Reveal>

        <Reveal delay={90}>
          <div className="mt-7 flex flex-col items-center justify-center gap-2.5 sm:flex-row">
            <Button size="lg" asChild className="w-full sm:w-auto">
              <Link to={user ? "/app" : "/signup"}>
                {user ? "Open your ledger" : "Start tracking — it's free"}
              </Link>
            </Button>
            <Button size="lg" variant="ghost" asChild className="w-full sm:w-auto">
              <Link to="/login">I already have an account</Link>
            </Button>
          </div>
        </Reveal>
      </section>

      {/* The interface, running — the page's centrepiece. */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 sm:pb-24">
        <Reveal delay={120}>
          <LiveDemo />
        </Reveal>
        <Reveal delay={220}>
          <p className="text-subhead mx-auto mt-8 max-w-md text-center text-balance text-muted-foreground">
            A quiet ledger for the money that moves between friends. Log it, watch it come back
            in instalments, and let Payloh write the reminder.
          </p>
        </Reveal>
      </section>

      {/* Features */}
      <section className="border-t border-border py-24">
        <div className="mx-auto max-w-6xl px-5 sm:px-6">
          <Reveal className="mx-auto max-w-xl text-center">
            <h2 className="text-[clamp(1.75rem,4vw,2.5rem)] leading-[1.1] font-bold tracking-[-0.028em] text-balance">
              Small app. Serious about the details.
            </h2>
            <p className="text-body mt-4 text-balance text-muted-foreground">
              Everything you need to settle up, and nothing you don't.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-x-10 gap-y-11 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, body }, index) => (
              <Reveal key={title} delay={index * 70}>
                <Icon className="size-6 text-primary" strokeWidth={1.75} />
                <h3 className="text-headline mt-3.5">{title}</h3>
                <p className="text-subhead mt-1.5 leading-[1.45rem] text-muted-foreground">
                  {body}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border py-24">
        <div className="mx-auto max-w-3xl px-5 sm:px-6">
          <Reveal>
            <h2 className="text-center text-[clamp(1.75rem,4vw,2.5rem)] leading-[1.1] font-bold tracking-[-0.028em] text-balance">
              Three steps, then forget about it
            </h2>
          </Reveal>

          <ol className="mt-14 grid gap-10 sm:grid-cols-3">
            {STEPS.map(({ n, title, body }, index) => (
              <Reveal as="li" key={n} delay={index * 90}>
                <span className="text-footnote tabular font-semibold tracking-[0.08em] text-primary">
                  {n}
                </span>
                <h3 className="text-headline mt-2.5">{title}</h3>
                <p className="text-subhead mt-1.5 leading-[1.45rem] text-muted-foreground">
                  {body}
                </p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* Closing */}
      <section className="border-t border-border px-5 py-28 text-center">
        <Reveal className="mx-auto max-w-xl">
          <h2 className="text-[clamp(1.75rem,4vw,2.5rem)] leading-[1.1] font-bold tracking-[-0.028em] text-balance">
            Stop keeping score in your head
          </h2>
          <p className="text-body mt-4 text-muted-foreground">
            Get your whole ledger in one place tonight.
          </p>
          <Button size="lg" asChild className="mt-8">
            <Link to={user ? "/app" : "/signup"}>
              {user ? "Open Payloh" : "Create your free account"}
            </Link>
          </Button>
        </Reveal>
      </section>

      <footer className="border-t border-border py-9">
        <div className="flex flex-col items-center justify-between gap-3 px-5 sm:flex-row sm:px-6 lg:px-8">
          <Logo markClassName="size-6" />
          <p className="text-footnote text-muted-foreground">
            Made for friends who keep forgetting.
          </p>
        </div>
      </footer>
    </div>
  )
}
