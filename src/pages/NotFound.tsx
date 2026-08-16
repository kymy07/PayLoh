import { ArrowLeft } from "lucide-react"
import { Link } from "react-router-dom"

import { Logo } from "@/components/Logo"
import { Button } from "@/components/ui/button"

export function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center">
      <Logo />
      <div>
        <h1 className="text-[clamp(2.5rem,8vw,4rem)] leading-none font-bold tracking-[-0.035em]">
          404
        </h1>
        <p className="text-body mt-3 text-balance text-muted-foreground">
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
