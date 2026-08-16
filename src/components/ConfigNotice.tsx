import { KeyRound } from "lucide-react"

import { Card } from "@/components/ui/card"

/**
 * Shown in place of any networked screen while .env.local still holds
 * placeholders, so a missing config reads as a setup step rather than a bug.
 */
export function ConfigNotice() {
  return (
    <Card className="mx-auto max-w-lg overflow-hidden">
      <div className="flex items-start gap-4 p-6">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-warning/12 text-warning">
          <KeyRound className="size-5" />
        </span>
        <div className="space-y-2">
          <h2 className="font-semibold tracking-[-0.015em]">Connect Firebase to continue</h2>
          <p className="text-sm text-muted-foreground">
            Payloh needs your web app's Firebase keys before it can sign anyone in.
          </p>
          <ol className="ml-4 list-decimal space-y-1 text-sm text-muted-foreground marker:text-primary">
            <li>
              In the Firebase console open <strong className="text-foreground">Project settings → Your apps</strong> and
              register a Web app.
            </li>
            <li>Copy the <code className="rounded bg-muted px-1 py-0.5 text-xs">firebaseConfig</code> values.</li>
            <li>
              Paste them into <code className="rounded bg-muted px-1 py-0.5 text-xs">.env.local</code> in the project
              root, then restart <code className="rounded bg-muted px-1 py-0.5 text-xs">npm run dev</code>.
            </li>
          </ol>
          <p className="text-sm text-muted-foreground">
            The full walkthrough is in <code className="rounded bg-muted px-1 py-0.5 text-xs">SETUP.md</code>.
          </p>
        </div>
      </div>
    </Card>
  )
}
