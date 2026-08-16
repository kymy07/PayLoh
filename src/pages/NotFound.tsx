import { ArrowLeft } from "lucide-react"
import { Link } from "react-router-dom"

import { Logo } from "@/components/Logo"
import { Button } from "@/components/ui/button"

export function NotFound() {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center gap-6 overflow-hidden px-6 text-center">
      <div className="aurora pointer-events-none absolute inset-0 -z-10" />
      <Logo />
      <div>
        <h1 className="text-[clamp(2.5rem,8vw,4rem)] leading-none font-semibold tracking-[-0.04em]">
          404
        </h1>
        <p className="mt-3 text-[17px] text-balance text-muted-foreground">
          This page doesn't exist — but your ledger still does.
        </p>
      </div>
      <Button asChild>
        <Link to="/">
          <ArrowLeft /> Back to home
        </Link>
      </Button>
    </div>
  )
}
