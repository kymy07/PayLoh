import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-20 w-full rounded-xl border border-input bg-card px-4 py-3 text-[15px] shadow-xs transition-[color,box-shadow,border-color] outline-none",
        "placeholder:text-muted-foreground/70 field-sizing-content resize-none",
        "focus-visible:border-primary/50 focus-visible:ring-[3px] focus-visible:ring-ring/25",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
        "disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
