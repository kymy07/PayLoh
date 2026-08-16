import { Link } from "react-router-dom"

import { Logo } from "@/components/Logo"

interface AuthLayoutProps {
  title: string
  subtitle: string
  children: React.ReactNode
  footer: React.ReactNode
}

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-background">
      <div className="aurora pointer-events-none absolute inset-0 -z-10" />

      <header className="px-6 py-6">
        <Link to="/" aria-label="Back to the Payloh home page">
          <Logo />
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 pb-16">
        <div className="w-full max-w-[400px]">
          <div className="mb-8 text-center">
            <h1 className="text-[32px] leading-tight font-semibold tracking-[-0.03em]">{title}</h1>
            <p className="mt-2 text-[15px] text-balance text-muted-foreground">{subtitle}</p>
          </div>

          <div className="rounded-[1.75rem] border border-border/70 bg-card/80 p-6 shadow-xl shadow-black/[0.04] backdrop-blur-xl sm:p-7">
            {children}
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">{footer}</p>
        </div>
      </main>
    </div>
  )
}

export function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill="#4285F4"
        d="M23.5 12.3c0-.9-.1-1.7-.2-2.5H12v4.8h6.5a5.6 5.6 0 0 1-2.4 3.7v3h3.9c2.3-2.1 3.5-5.2 3.5-9Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.9-3c-1.1.7-2.4 1.2-4 1.2-3.1 0-5.7-2.1-6.6-4.9H1.4v3.1A12 12 0 0 0 12 24Z"
      />
      <path fill="#FBBC05" d="M5.4 14.4a7.2 7.2 0 0 1 0-4.6V6.7H1.4a12 12 0 0 0 0 10.8l4-3.1Z" />
      <path
        fill="#EA4335"
        d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.4 6.7l4 3.1C6.3 6.9 8.9 4.8 12 4.8Z"
      />
    </svg>
  )
}
