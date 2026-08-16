import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all duration-200 ease-spring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40 active:scale-[0.97]",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-sm shadow-primary/25 hover:brightness-105 hover:shadow-md hover:shadow-primary/30",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border/60",
        outline:
          "border border-border bg-card/60 backdrop-blur-sm hover:bg-accent/40 hover:border-primary/30",
        ghost: "hover:bg-muted text-foreground/80 hover:text-foreground",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:brightness-110",
        success: "bg-success text-success-foreground shadow-sm hover:brightness-110",
        link: "text-primary underline-offset-4 hover:underline active:scale-100",
      },
      size: {
        default: "h-10 px-5 has-[>svg]:px-4",
        sm: "h-8 px-3.5 text-[13px] has-[>svg]:px-3",
        lg: "h-12 px-7 text-base has-[>svg]:px-6",
        icon: "size-10",
        "icon-sm": "size-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export interface ButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

function Button({
  className,
  variant,
  size,
  asChild = false,
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="animate-spin" />
          {children}
        </>
      ) : (
        children
      )}
    </Comp>
  )
}

export { Button, buttonVariants }
