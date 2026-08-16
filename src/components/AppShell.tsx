import {
  LayoutDashboard,
  LogOut,
  Monitor,
  Moon,
  Plus,
  Settings,
  Sun,
  Wallet,
} from "lucide-react"
import { NavLink, Outlet, useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { Logo, LogoMark } from "@/components/Logo"
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
  { to: "/app/settings", label: "Settings", icon: Settings, end: false },
] as const

const THEMES: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
]

export function AppShell() {
  const { user, profile, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const { openCreate } = useDebtActions()
  const navigate = useNavigate()

  const name = profile?.displayName ?? user?.displayName ?? user?.email ?? "Friend"

  async function handleLogout() {
    try {
      await logout()
      navigate("/", { replace: true })
    } catch {
      toast.error("Couldn't sign out. Try again.")
    }
  }

  return (
    <div className="min-h-dvh bg-background">
      <header className="glass sticky top-0 z-40 border-b">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
          <NavLink to="/app" className="shrink-0" aria-label="Payloh home">
            <Logo className="hidden sm:inline-flex" />
            <LogoMark className="sm:hidden" />
          </NavLink>

          <nav className="ml-4 hidden items-center gap-1 md:flex">
            {NAV.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2 rounded-full px-3.5 py-2 text-[13px] font-medium transition-colors duration-200",
                    isActive
                      ? "bg-accent/50 text-accent-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )
                }
              >
                <Icon className="size-4" />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <Button size="sm" onClick={openCreate} className="hidden sm:inline-flex">
              <Plus /> New debt
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="rounded-full outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40"
                  aria-label="Account menu"
                >
                  <Avatar className="size-9 border border-border/70">
                    {user?.photoURL && <AvatarImage src={user.photoURL} alt="" />}
                    <AvatarFallback className="bg-gradient-to-br from-blush to-pink text-white">
                      {initialsOf(name)}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-60">
                <div className="px-3 py-2">
                  <p className="truncate text-sm font-medium">{name}</p>
                  <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
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

      <main className="mx-auto max-w-6xl px-4 pt-8 pb-28 sm:px-6 md:pb-16">
        <Outlet />
      </main>

      {/* Mobile: an iOS-style tab bar plus a floating compose button. */}
      <Button
        size="icon"
        onClick={openCreate}
        className="fixed right-5 bottom-24 z-40 size-14 shadow-lg shadow-primary/30 md:hidden"
        aria-label="New debt"
      >
        <Plus className="size-6" />
      </Button>

      <nav className="glass fixed inset-x-0 bottom-0 z-40 border-t pb-[env(safe-area-inset-bottom)] md:hidden">
        <div className="flex items-stretch">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground",
                )
              }
            >
              <Icon className="size-5" />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
