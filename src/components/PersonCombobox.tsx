import { Check, ChevronDown, UserPlus } from "lucide-react"
import { useEffect, useId, useMemo, useRef, useState } from "react"

import { PersonAvatar } from "@/components/PersonAvatar"
import { Input } from "@/components/ui/input"
import { formatMoney } from "@/lib/format"
import { cn } from "@/lib/utils"

export interface PersonSuggestion {
  key: string
  name: string
  phone?: string | null
  activeCount: number
  outstanding: number
}

interface PersonComboboxProps {
  id?: string
  value: string
  onChange: (value: string) => void
  /** Fires only when an existing person is picked, so their phone can be reused. */
  onSelect?: (person: PersonSuggestion) => void
  people: PersonSuggestion[]
  currency: string
  placeholder?: string
}

/**
 * Type a new name or pick someone already in the ledger.
 *
 * Deliberately not a plain <select>: most debts are with people you've lent to
 * before, but a brand-new name has to stay one keystroke away. So this is a
 * text field that suggests, never one that constrains.
 */
export function PersonCombobox({
  id,
  value,
  onChange,
  onSelect,
  people,
  currency,
  placeholder,
}: PersonComboboxProps) {
  const listId = useId()
  const wrapperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [highlighted, setHighlighted] = useState(0)

  const matches = useMemo(() => {
    const needle = value.trim().toLowerCase()
    if (!needle) return people
    return people.filter((person) => person.name.toLowerCase().includes(needle))
  }, [people, value])

  const exactMatch = people.some((person) => person.key === value.trim().toLowerCase())
  const showNewHint = value.trim().length > 0 && !exactMatch

  // Keep the highlight inside the list as it filters down.
  useEffect(() => {
    setHighlighted(0)
  }, [value])

  useEffect(() => {
    if (!open) return
    function onPointerDown(event: PointerEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener("pointerdown", onPointerDown)
    return () => document.removeEventListener("pointerdown", onPointerDown)
  }, [open])

  function pick(person: PersonSuggestion) {
    onChange(person.name)
    onSelect?.(person)
    setOpen(false)
    inputRef.current?.focus()
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      if (!open) {
        setOpen(true)
        return
      }
      if (matches.length === 0) return
      event.preventDefault()
      setHighlighted((current) => {
        const next = event.key === "ArrowDown" ? current + 1 : current - 1
        return (next + matches.length) % matches.length
      })
      return
    }

    if (event.key === "Enter" && open && matches[highlighted]) {
      // Don't submit the form — the first Enter commits the highlighted name.
      event.preventDefault()
      pick(matches[highlighted])
      return
    }

    if (event.key === "Escape" && open) {
      event.preventDefault()
      setOpen(false)
    }
  }

  return (
    <div ref={wrapperRef} className="relative">
      <Input
        id={id}
        ref={inputRef}
        value={value}
        onChange={(event) => {
          onChange(event.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className={cn(people.length > 0 && "pr-10")}
        autoComplete="off"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        required
      />

      {people.length > 0 && (
        <button
          type="button"
          tabIndex={-1}
          onClick={() => {
            setOpen((current) => !current)
            inputRef.current?.focus()
          }}
          className="absolute top-1/2 right-3 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
          aria-label={open ? "Hide saved people" : "Show saved people"}
        >
          <ChevronDown
            className={cn("size-4 transition-transform duration-200", open && "rotate-180")}
          />
        </button>
      )}

      {open && (matches.length > 0 || showNewHint) && (
        <div
          id={listId}
          role="listbox"
          className="absolute z-50 mt-1.5 max-h-64 w-full overflow-y-auto rounded-2xl border border-border/70 bg-popover p-1.5 shadow-xl shadow-black/10 animate-in fade-in-0 zoom-in-95"
        >
          {matches.map((person, index) => {
            const selected = person.key === value.trim().toLowerCase()
            return (
              <button
                key={person.key}
                type="button"
                role="option"
                aria-selected={selected}
                onMouseEnter={() => setHighlighted(index)}
                onClick={() => pick(person)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors",
                  index === highlighted && "bg-muted",
                )}
              >
                <PersonAvatar name={person.name} className="size-8 text-[11px]" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{person.name}</span>
                  <span className="block truncate text-[11px] text-muted-foreground">
                    {person.activeCount > 0
                      ? `${formatMoney(person.outstanding, currency)} outstanding`
                      : "All settled up"}
                  </span>
                </span>
                {selected && <Check className="size-4 shrink-0 text-primary" />}
              </button>
            )
          })}

          {showNewHint && (
            <div
              className={cn(
                "flex items-center gap-3 px-2.5 py-2 text-[13px] text-muted-foreground",
                matches.length > 0 && "mt-1 border-t border-border/60 pt-2.5",
              )}
            >
              <UserPlus className="size-4 shrink-0" />
              <span className="truncate">
                New person — <span className="text-foreground">{value.trim()}</span>
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
