import { Check, Copy, MessageCircle } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/contexts/AuthContext"
import { buildReminderMessage, normalisePhone, whatsappLink } from "@/lib/reminder"
import type { Debt } from "@/lib/types"

interface ReminderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  debt: Debt | null
}

export function ReminderDialog({ open, onOpenChange, debt }: ReminderDialogProps) {
  const { user, profile } = useAuth()
  const senderName = profile?.displayName ?? user?.displayName ?? undefined

  const suggested = useMemo(
    () => (debt ? buildReminderMessage(debt, senderName) : ""),
    [debt, senderName],
  )
  const [message, setMessage] = useState(suggested)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!open) return
    setMessage(suggested)
    setCopied(false)
  }, [open, suggested])

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(message)
      setCopied(true)
      toast.success("Message copied")
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Couldn't reach the clipboard — select the text and copy it manually.")
    }
  }

  const hasPhone = Boolean(normalisePhone(debt?.personPhone))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Send a reminder</DialogTitle>
          <DialogDescription>
            Payloh drafts it — edit anything before you send.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="reminderMessage">Message</Label>
          <Textarea
            id="reminderMessage"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-40 text-sm"
          />
          {!hasPhone && (
            <p className="text-xs text-muted-foreground">
              No WhatsApp number saved for {debt?.personName} — WhatsApp will ask you to pick a
              contact.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleCopy}>
            {copied ? <Check /> : <Copy />}
            {copied ? "Copied" : "Copy text"}
          </Button>
          <Button asChild>
            <a
              href={debt ? whatsappLink(debt, message) : "#"}
              target="_blank"
              rel="noreferrer noopener"
              onClick={() => onOpenChange(false)}
            >
              <MessageCircle /> Open in WhatsApp
            </a>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
