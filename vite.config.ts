import path from "node:path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  // Firebase Hosting serves from the root; GitHub Pages serves from /PayLoh/.
  // The Pages workflow sets VITE_BASE_PATH so one build config covers both.
  base: process.env.VITE_BASE_PATH ?? "/",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Firebase and Recharts dominate the bundle and change far less often
        // than app code, so give each its own long-lived chunk.
        manualChunks: {
          firebase: ["firebase/app", "firebase/auth", "firebase/database"],
          charts: ["recharts"],
          react: ["react", "react-dom", "react-router-dom"],
        },
      },
    },
  },
  server: {
    port: 5173,
    open: true,
  },
})
