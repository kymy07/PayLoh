import { Toaster as Sonner, type ToasterProps } from "sonner"

import { useTheme } from "@/contexts/ThemeContext"

function Toaster(props: ToasterProps) {
  const { resolvedTheme } = useTheme()

  return (
    <Sonner
      theme={resolvedTheme}
      position="top-center"
      offset={16}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast !rounded-2xl !border-border/70 !bg-popover !text-popover-foreground !shadow-xl !shadow-black/10",
          description: "!text-muted-foreground",
          actionButton: "!bg-primary !text-primary-foreground !rounded-full",
          cancelButton: "!bg-muted !text-muted-foreground !rounded-full",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
