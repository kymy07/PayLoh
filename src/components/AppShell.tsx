import {
  LayoutDashboard,
  LogOut,
  Monitor,
  Moon,
  Plus,
  Settings,
  Sun,
  Users,
  Wallet,
} from "lucide-react"
import { useEffect, useRef } from "react"
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { Logo, LogoMark } from "@/components/Logo"
import { PageTitleProvider, usePageTitle } from "@/components/PageTitle"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/AuthContext"
import { useDebtActions } from "@/contexts/DebtActionsContext"
import { useTheme, type Theme } from "@/contexts/ThemeContext"
import { initialsOf } from "@/lib/format"
import { cn } from "@/lib/utils"

const NAV = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/app/debts", label: "Debts", icon: Wallet, end: false },
  { to: "/app/people", label: "People", icon: Users, end: false },
  { to: "/app/settings", label: "Settings", icon: Settings, end: false },
] as const

const THEMES: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
]

/** How far the page scrolls before the large title has fully folded away. */
const COLLAPSE_DISTANCE = 52

export function AppShell() {
  return (
    <PageTitleProvider>
      <Shell />
    </PageTitleProvider>
  )
}

function Shell() {
  const { user, profile, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const { openCreate } = useDebtActions()
  const { title } = usePageTitle()
  const navigate = useNavigate()
  const location = useLocation()
  const rootRef = useRef<HTMLDivElement>(null)

  const name = profile?.displayName ?? user?.displayName ?? user?.email ?? "Friend"

  // Drive the title collapse from one custom property, written straight to the
  // DOM. Going through React state here would re-render the whole shell on
  // every scroll frame for a value only CSS consumes.
  useEffect(() => {
    const node = rootRef.current
    if (!node) return

    let frame = 0
    const apply = () => {
      frame = 0
      const t = Math.min(1, Math.max(0, window.scrollY / COLLAPSE_DISTANCE))
      node.style.setProperty("--title-collapse", t.toFixed(3))
    }

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(apply)
    }

    apply()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  // A new screen starts at its own top, with its large title open.
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [location.pathname])

  async function handleLogout() {
    try {
      await logout()
      navigate("/", { replace: true })
    } catch {
      toast.error("Couldn't sign out. Try again.")
    }
  }

  return (
    <div ref={rootRef} className="min-h-dvh bg-background">
      <header className="material pinned sticky top-0 z-40 border-b border-[--material-border]">
        {/* Full-bleed bar: the logo sits against the left edge and the account
            against the right, the way a web app's chrome normally does. */}
        <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
          <NavLink to="/app" className="shrink-0" aria-label="Payloh home">
            <Logo className="hidden sm:inline-flex" markClassName="size-8" />
            <LogoMark className="size-8 sm:hidden" />
          </NavLink>

          {/* The page title, arriving as the large one above it folds away. */}
          <span
            className="title-inline text-headline pointer-events-none min-w-0 flex-1 truncate text-center md:hidden"
            aria-hidden
          >
            {title}
          </span>

          <nav className="ml-4 hidden items-center gap-0.5 md:flex">
            {NAV.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    "text-subhead press flex items-center gap-1.5 rounded-lg px-3 py-2 font-medium",
                    isActive
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )
                }
              >
                <Icon className="size-4" />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-2">
            <Button size="sm" onClick={() => openCreate()} className="hidden sm:inline-flex">
              <Plus /> New debt
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="press rounded-full outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40"
                  aria-label="Account menu"
                >
                  <Avatar className="size-9 ring-1 ring-border">
                    {user?.photoURL && <AvatarImage src={user.photoURL} alt="" />}
                    <AvatarFallback className="bg-secondary text-secondary-foreground text-caption">
                      {initialsOf(name)}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-60">
                <div className="px-3 py-2">
                  <p className="text-subhead truncate font-medium">{name}</p>
                  <p className="text-caption truncate text-muted-foreground">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />

                <DropdownMenuLabel>Appearance</DropdownMenuLabel>
                {THEMES.map(({ value, label, icon: Icon }) => (
                  <DropdownMenuItem key={value} onSelect={() => setTheme(value)}>
                    <Icon />
                    <span className="flex-1">{label}</span>
                    {theme === value && <span className="size-1.5 rounded-full bg-primary" />}
                  </DropdownMenuItem>
                ))}

                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => navigate("/app/settings")}>
                  <Settings /> Settings
                </DropdownMenuItem>
                <DropdownMenuItem variant="destructive" onSelect={handleLogout}>
                  <LogOut /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Content uses the width it is given, stopping only where a line would
          get too long to scan on a very wide display. */}
      <main className="mx-auto w-full max-w-[1600px] px-4 pt-8 pb-[calc(7.5rem+env(safe-area-inset-bottom))] sm:px-6 md:pb-20 lg:px-8">
        <Outlet />
      </main>

      <Button
        size="icon"
        onClick={() => openCreate()}
        className="pinned press fixed right-5 bottom-[calc(6rem+env(safe-area-inset-bottom))] z-40 size-14 shadow-lg shadow-black/15 md:hidden"
        aria-label="New debt"
      >
        <Plus className="size-6" />
      </Button>

      <nav className="material pinned fixed inset-x-0 bottom-0 z-40 border-t border-[--material-border] pb-[env(safe-area-inset-bottom)] md:hidden">
        <div className="flex items-stretch">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "press flex flex-1 flex-col items-center gap-1 py-2",
                  isActive ? "text-primary" : "text-muted-foreground",
                )
              }
            >
              <Icon className="size-[22px]" strokeWidth={2} />
              <span className="text-caption-2 font-medium">{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
