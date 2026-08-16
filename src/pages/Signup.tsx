import { Check, Eye, EyeOff } from "lucide-react"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { AuthLayout, GoogleIcon } from "@/components/AuthLayout"
import { ConfigNotice } from "@/components/ConfigNotice"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authErrorMessage, useAuth } from "@/contexts/AuthContext"
import { isFirebaseConfigured } from "@/lib/firebase"
import { cn } from "@/lib/utils"

const RULES = [
  { label: "At least 8 characters", test: (v: string) => v.length >= 8 },
  { label: "One letter", test: (v: string) => /[a-zA-Z]/.test(v) },
  { label: "One number", test: (v: string) => /\d/.test(v) },
]

export function Signup() {
  const { signUp, signInWithGoogle } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState("")
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

  const passed = RULES.filter((rule) => rule.test(password)).length
  const strongEnough = passed === RULES.length

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!name.trim()) {
      toast.error("What should we call you?")
      return
    }
    if (!strongEnough) {
      toast.error("Give your password a bit more strength first.")
      return
    }

    setSubmitting(true)
    try {
      await signUp(name.trim(), email.trim(), password)
      toast.success(`Welcome to Payloh, ${name.trim().split(" ")[0]}`)
      navigate("/app", { replace: true })
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
      navigate("/app", { replace: true })
    } catch (error) {
      toast.error(authErrorMessage(error))
    } finally {
      setGoogleBusy(false)
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Free, and your ledger stays private to you."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Your name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Adlishah"
            autoComplete="name"
            required
          />
        </div>

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
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
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

          {password.length > 0 && (
            <ul className="space-y-1 pt-1">
              {RULES.map((rule) => {
                const ok = rule.test(password)
                return (
                  <li
                    key={rule.label}
                    className={cn(
                      "flex items-center gap-1.5 text-xs transition-colors",
                      ok ? "text-success" : "text-muted-foreground",
                    )}
                  >
                    <Check className={cn("size-3.5", !ok && "opacity-30")} />
                    {rule.label}
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <Button type="submit" className="w-full" size="lg" loading={submitting}>
          Create account
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
