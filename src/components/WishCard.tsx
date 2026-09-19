import { Check, ExternalLink, MoreHorizontal, Pencil, RotateCcw, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { linkHost } from "@/hooks/useWishlist"
import { formatMoney, relativeDate } from "@/lib/format"
import { WISH_PRIORITIES, type WishItem, type WishPriority } from "@/lib/types"
import { cn } from "@/lib/utils"

const PRIORITY_STYLE: Record<
  WishPriority,
  { badge: "destructive" | "warning" | "secondary"; dot: string; filled: number }
> = {
  high: { badge: "destructive", dot: "bg-destructive", filled: 3 },
  medium: { badge: "warning", dot: "bg-warning", filled: 2 },
  low: { badge: "secondary", dot: "bg-muted-foreground", filled: 1 },
}

export function priorityLabel(priority: WishPriority): string {
  return WISH_PRIORITIES.find((p) => p.value === priority)?.label ?? priority
}

/** Three dots filled to the level, so the priority reads without colour alone. */
export function PriorityDots({
  priority,
  className,
}: {
  priority: WishPriority
  className?: string
}) {
  const { dot, filled } = PRIORITY_STYLE[priority]
  return (
    <span className={cn("flex items-center gap-0.5", className)} aria-hidden>
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          className={cn("size-1.5 rounded-full", index < filled ? dot : "bg-border")}
        />
      ))}
    </span>
  )
}

interface WishCardProps {
  item: WishItem
  onToggleBought: (item: WishItem) => void
  onEdit: (item: WishItem) => void
  onDelete: (item: WishItem) => void
}

export function WishCard({ item, onToggleBought, onEdit, onDelete }: WishCardProps) {
  const bought = Boolean(item.boughtAt)

  return (
    <Card className={cn("gap-0 overflow-hidden p-0", bought && "opacity-70 hover:opacity-100")}>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p
              className={cn(
                "truncate font-semibold tracking-[-0.015em]",
                bought && "text-muted-foreground line-through",
              )}
            >
              {item.name}
            </p>
            {item.link ? (
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-0.5 flex items-center gap-1 text-[13px] text-primary hover:underline"
              >
                <span className="truncate">{linkHost(item.link)}</span>
                <ExternalLink className="size-3 shrink-0" />
              </a>
            ) : (
              <p className="mt-0.5 text-[13px] text-muted-foreground">No link saved</p>
            )}
          </div>

          <p
            className={cn(
              "tabular shrink-0 text-[19px] leading-none font-semibold tracking-[-0.02em]",
              bought && "text-muted-foreground",
            )}
          >
            {formatMoney(item.price, item.currency)}
          </p>
        </div>

        {item.note && (
          <p className="mt-2 line-clamp-2 text-[13px] text-muted-foreground">{item.note}</p>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {bought ? (
            <Badge variant="success">
              <Check className="size-3" /> Bought {relativeDate(item.boughtAt)}
            </Badge>
          ) : (
            <Badge variant={PRIORITY_STYLE[item.priority].badge}>
              <PriorityDots priority={item.priority} /> {priorityLabel(item.priority)}
            </Badge>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 border-t border-border/60 bg-muted/30 px-5 py-3">
        <Button
          variant={bought ? "ghost" : "secondary"}
          size="sm"
          onClick={() => onToggleBought(item)}
        >
          {bought ? (
            <>
              <RotateCcw /> Still want it
            </>
          ) : (
            <>
              <Check /> Mark bought
            </>
          )}
        </Button>
        {item.link && !bought && (
          <Button variant="ghost" size="sm" asChild>
            <a href={item.link} target="_blank" rel="noopener noreferrer">
              <ExternalLink /> Open link
            </a>
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" className="ml-auto" aria-label="More actions">
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => onEdit(item)}>
              <Pencil /> Edit details
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onSelect={() => onDelete(item)}>
              <Trash2 /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  )
}
