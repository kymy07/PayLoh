import { cn } from "@/lib/utils"

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "grid size-8 shrink-0 place-items-center rounded-[0.6rem] bg-gradient-to-br from-blush via-pink to-rose text-white shadow-sm shadow-rose/30",
        className,
      )}
      aria-hidden
    >
      <svg viewBox="0 0 24 24" className="size-[60%]" fill="currentColor">
        <path d="M7 19V5h5.4c3.1 0 5.2 2 5.2 5s-2.1 5-5.2 5H10v4H7Zm3-7h2.2c1.4 0 2.3-.8 2.3-2s-.9-2-2.3-2H10v4Z" />
      </svg>
    </span>
  )
}

export function Logo({ className, markClassName }: { className?: string; markClassName?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark className={markClassName} />
      <span className="text-[17px] font-semibold tracking-[-0.02em]">Payloh</span>
    </span>
  )
}
