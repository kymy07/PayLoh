import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { initialsOf, tintFor } from "@/lib/format"
import { cn } from "@/lib/utils"

export function PersonAvatar({ name, className }: { name: string; className?: string }) {
  return (
    <Avatar className={cn("size-11", className)}>
      <AvatarFallback className={tintFor(name)}>{initialsOf(name)}</AvatarFallback>
    </Avatar>
  )
}
