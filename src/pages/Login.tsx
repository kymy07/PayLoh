import { Eye, EyeOff } from "lucide-react"
import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { AuthLayout, GoogleIcon } from "@/components/AuthLayout"
import { ConfigNotice } from "@/components/ConfigNotice"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authErrorMessage, useAuth } from "@/contexts/AuthContext"
import { isFirebaseConfigured } from "@/lib/firebase"

export function Login() {
  const { signIn, signInWithGoogle, resetPassword } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? "/app"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [googleBusy, setGoogleBusy] = useState(false)

  if (!isFirebaseConfigured) {
    return (
      <AuthLayout
        title="Almost there"
        subtitle="One config file stands between you and your ledger."
        footer={<Link to="/" className="text-primary hover:underline">Back to home</Link>}
      >
        <ConfigNotice />
      </AuthLayout>
    )
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    try {
      await signIn(email.trim(), password)
      navigate(from, { replace: true })
    } catch (error) {
      toast.error(authErrorMessage(error))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleGoogle() {
    setGoogleBusy(true)
    try {
      await signInWithGoogle()
      navigate(from, { replace: true })
    } catch (error) {
      toast.error(authErrorMessage(error))
    } finally {
      setGoogleBusy(false)
    }
  }

  async function handleReset() {
    const address = email.trim()
    if (!address) {
      toast.error("Type your email above first, then tap reset.")
      return
    }
    try {
      await resetPassword(address)
      toast.success("Reset link sent", { description: `Check the inbox for ${address}.` })
    } catch (error) {
      toast.error(authErrorMessage(error))
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to pick up where your ledger left off."
      footer={
        <>
          New to Payloh?{" "}
          <Link to="/signup" className="font-medium text-primary hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <button
              type="button"
              onClick={handleReset}
              className="text-[13px] text-primary hover:underline"
            >
              Forgot?
            </button>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              className="pr-11"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute top-1/2 right-3 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>

        <Button type="submit" className="w-full" size="lg" loading={submitting}>
          Sign in
        </Button>
      </form>

      <div className="my-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">or</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <Button
        type="button"
        variant="outline"
        size="lg"
        className="w-full"
        onClick={handleGoogle}
        loading={googleBusy}
      >
        <GoogleIcon className="size-4" /> Continue with Google
      </Button>
    </AuthLayout>
  )
}
