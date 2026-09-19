import { Navigate, Route, BrowserRouter as Router, Routes, useLocation } from "react-router-dom"

import { AppShell } from "@/components/AppShell"
import { LogoMark } from "@/components/Logo"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AuthProvider, useAuth } from "@/contexts/AuthContext"
import { DebtActionsProvider } from "@/contexts/DebtActionsContext"
import { ThemeProvider } from "@/contexts/ThemeContext"
import { Dashboard } from "@/pages/Dashboard"
import { DebtDetail } from "@/pages/DebtDetail"
import { Debts } from "@/pages/Debts"
import { Landing } from "@/pages/Landing"
import { Login } from "@/pages/Login"
import { NotFound } from "@/pages/NotFound"
import { People } from "@/pages/People"
import { PersonDetail } from "@/pages/PersonDetail"
import { Settings } from "@/pages/Settings"
import { Signup } from "@/pages/Signup"
import { Wishlist } from "@/pages/Wishlist"

/** Shown while Firebase decides whether there's a session to restore. */
function Splash() {
  return (
    <div className="grid min-h-dvh place-items-center bg-background">
      <LogoMark className="size-12 animate-pulse rounded-2xl" />
      <span className="sr-only">Loading Payloh</span>
    </div>
  )
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <Splash />
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return <>{children}</>
}

/** Signed-in users skip the marketing and auth pages. */
function RedirectIfAuthed({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) return <Splash />
  if (user) return <Navigate to="/app" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          {/* BASE_URL is "/" on Firebase Hosting and "/PayLoh/" on GitHub
              Pages, so routes resolve correctly under either deployment. */}
          <Router basename={import.meta.env.BASE_URL}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route
                path="/login"
                element={
                  <RedirectIfAuthed>
                    <Login />
                  </RedirectIfAuthed>
                }
              />
              <Route
                path="/signup"
                element={
                  <RedirectIfAuthed>
                    <Signup />
                  </RedirectIfAuthed>
                }
              />

              <Route
                path="/app"
                element={
                  <RequireAuth>
                    <DebtActionsProvider>
                      <AppShell />
                    </DebtActionsProvider>
                  </RequireAuth>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="debts" element={<Debts />} />
                <Route path="debts/:debtId" element={<DebtDetail />} />
                <Route path="people" element={<People />} />
                <Route path="people/:personKey" element={<PersonDetail />} />
                <Route path="wishlist" element={<Wishlist />} />
                <Route path="settings" element={<Settings />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
