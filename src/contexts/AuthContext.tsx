import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth"
import { get, onValue, ref, serverTimestamp, update } from "firebase/database"
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"

import { auth, db, googleProvider, isFirebaseConfigured } from "@/lib/firebase"
import type { UserProfile } from "@/lib/types"

interface AuthContextValue {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  currency: string
  signUp: (name: string, email: string, password: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updateCurrency: (currency: string) => Promise<void>
  updateDisplayName: (name: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

/** Creates the user's profile node the first time they land. */
async function ensureProfile(user: User) {
  const profileRef = ref(db, `users/${user.uid}`)
  const snapshot = await get(profileRef)
  if (snapshot.exists()) return

  await update(profileRef, {
    uid: user.uid,
    displayName: user.displayName ?? user.email?.split("@")[0] ?? "Friend",
    email: user.email ?? "",
    photoURL: user.photoURL ?? null,
    currency: "MYR",
    createdAt: serverTimestamp(),
  })
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  // Without a config there is no auth listener to wait for, so start resolved.
  const [loading, setLoading] = useState(isFirebaseConfigured)

  useEffect(() => {
    if (!isFirebaseConfigured) return

    return onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser)
      setLoading(false)
      if (!nextUser) setProfile(null)
    })
  }, [])

  // Keep the profile node live so a currency change anywhere reflects here.
  useEffect(() => {
    if (!user) return

    void ensureProfile(user).catch(() => {
      /* rules or offline — the listener below will simply stay empty */
    })

    return onValue(
      ref(db, `users/${user.uid}`),
      (snapshot) => setProfile(snapshot.val() as UserProfile | null),
      () => setProfile(null),
    )
  }, [user])

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    const credential = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(credential.user, { displayName: name })
    await ensureProfile(credential.user)
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password)
  }, [])

  const signInWithGoogle = useCallback(async () => {
    const credential = await signInWithPopup(auth, googleProvider)
    await ensureProfile(credential.user)
  }, [])

  const resetPassword = useCallback(async (email: string) => {
    await sendPasswordResetEmail(auth, email)
  }, [])

  const updateCurrency = useCallback(
    async (currency: string) => {
      if (!user) return
      await update(ref(db, `users/${user.uid}`), { currency })
    },
    [user],
  )

  const updateDisplayName = useCallback(
    async (name: string) => {
      if (!user) return
      await updateProfile(user, { displayName: name })
      // The profile listener pushes the new name back into the UI; don't clone
      // the Firebase User here, since spreading it drops its prototype methods.
      await update(ref(db, `users/${user.uid}`), { displayName: name })
    },
    [user],
  )

  const logout = useCallback(async () => {
    await signOut(auth)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      loading,
      currency: profile?.currency ?? "MYR",
      signUp,
      signIn,
      signInWithGoogle,
      resetPassword,
      updateCurrency,
      updateDisplayName,
      logout,
    }),
    [
      user,
      profile,
      loading,
      signUp,
      signIn,
      signInWithGoogle,
      resetPassword,
      updateCurrency,
      updateDisplayName,
      logout,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used inside an AuthProvider")
  return context
}

/** Turns Firebase's error codes into something worth showing a person. */
export function authErrorMessage(error: unknown): string {
  const code = (error as { code?: string })?.code ?? ""
  switch (code) {
    case "auth/invalid-email":
      return "That email address doesn't look right."
    case "auth/user-disabled":
      return "This account has been disabled."
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Email or password is incorrect."
    case "auth/email-already-in-use":
      return "An account already exists with this email."
    case "auth/weak-password":
      return "Password needs to be at least 6 characters."
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return "Sign-in window was closed before finishing."
    case "auth/popup-blocked":
      return "Your browser blocked the sign-in window. Allow popups and try again."
    case "auth/too-many-requests":
      return "Too many attempts. Wait a moment and try again."
    case "auth/network-request-failed":
      return "Network problem. Check your connection and try again."
    case "auth/operation-not-allowed":
      return "This sign-in method isn't enabled in the Firebase console yet."
    case "auth/unauthorized-domain":
      return "This domain isn't authorised in Firebase Authentication settings."
    default:
      return (error as { message?: string })?.message ?? "Something went wrong. Try again."
  }
}
