import { initializeApp, type FirebaseOptions } from "firebase/app"
import { getAuth, GoogleAuthProvider } from "firebase/auth"
import { getDatabase } from "firebase/database"

const firebaseConfig: FirebaseOptions = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

/**
 * True once .env.local holds a real web-app config. Until then the app still
 * renders, but every screen that needs the network shows a setup notice
 * instead of an unexplained auth error.
 */
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.databaseURL &&
    !firebaseConfig.apiKey.startsWith("PASTE_"),
)

/**
 * The Realtime Database SDK throws without a databaseURL, which would take the
 * marketing page down too. Stand-in values keep it constructible; nothing ever
 * reaches the network because every caller checks the flag above first.
 */
const app = initializeApp(
  isFirebaseConfigured
    ? firebaseConfig
    : {
        ...firebaseConfig,
        apiKey: "unconfigured",
        projectId: "unconfigured",
        databaseURL: "https://unconfigured.firebaseio.com",
      },
)

export const auth = getAuth(app)
export const db = getDatabase(app)
export const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: "select_account" })

export default app
