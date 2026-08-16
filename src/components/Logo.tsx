import { cn } from "@/lib/utils"

// Lives in public/ rather than src/assets so index.html can point the favicon at
// the same file. BASE_URL keeps it resolving under the /PayLoh/ subpath too.
const MARK = `${import.meta.env.BASE_URL}logo-mark.png`

export function LogoMark({ className }: { className?: string }) {
  return (
    <img
      src={MARK}
      alt=""
      aria-hidden
      draggable={false}
      className={cn("size-8 shrink-0 select-none object-contain", className)}
    />
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
