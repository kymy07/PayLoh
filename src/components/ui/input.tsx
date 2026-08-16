import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-11 w-full min-w-0 rounded-xl border border-input bg-card px-4 py-2 text-[15px] shadow-xs transition-[color,box-shadow,border-color] outline-none",
        "placeholder:text-muted-foreground/70 selection:bg-primary selection:text-primary-foreground",
        "file:inline-flex file:border-0 file:bg-transparent file:text-sm file:font-medium",
        "focus-visible:border-primary/50 focus-visible:ring-[3px] focus-visible:ring-ring/25",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
        "disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      {...props}
    />
  )
}

export { Input }
