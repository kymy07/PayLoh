import { onValue, push, ref, remove, serverTimestamp, update } from "firebase/database"
import { useEffect, useState } from "react"

import { useAuth } from "@/contexts/AuthContext"
import { db, isFirebaseConfigured } from "@/lib/firebase"
import { round2, type WishDraft, type WishItem, type WishPriority } from "@/lib/types"

const wishlistPath = (uid: string) => `wishlist/${uid}`
const wishPath = (uid: string, wishId: string) => `wishlist/${uid}/${wishId}`

const PRIORITY_RANK: Record<WishPriority, number> = { high: 0, medium: 1, low: 2 }

/**
 * Still-wanted items first, then by how much you want them, then newest.
 * Bought items sink to the bottom so the list reads as a shopping order.
 */
export function compareWishes(a: WishItem, b: WishItem): number {
  const boughtA = a.boughtAt ? 1 : 0
  const boughtB = b.boughtAt ? 1 : 0
  return (
    boughtA - boughtB ||
    PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] ||
    (b.createdAt ?? 0) - (a.createdAt ?? 0)
  )
}

/** People paste links without a scheme; give them one so the anchor works. */
export function normalizeLink(input: string | undefined): string | null {
  const value = input?.trim()
  if (!value) return null
  // Lowercase the scheme too — the database rules only accept "http(s)://".
  const scheme = /^https?:\/\//i.exec(value)
  return scheme ? scheme[0].toLowerCase() + value.slice(scheme[0].length) : `https://${value}`
}

/** "shopee.com.my" from a full product URL — enough to recognise the shop. */
export function linkHost(link: string): string {
  try {
    return new URL(link).hostname.replace(/^www\./, "")
  } catch {
    return link
  }
}

/** Live list of the signed-in user's wishlist, in shopping order. */
export function useWishlist() {
  const { user } = useAuth()
  const [items, setItems] = useState<WishItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isFirebaseConfigured || !user) {
      setItems([])
      setLoading(false)
      return
    }

    setLoading(true)
    return onValue(
      ref(db, wishlistPath(user.uid)),
      (snapshot) => {
        const value = (snapshot.val() ?? {}) as Record<string, Omit<WishItem, "id">>
        const rows = Object.entries(value).map(([id, item]) => ({ id, ...item }))
        setItems(rows.sort(compareWishes))
        setLoading(false)
      },
      () => setLoading(false),
    )
  }, [user])

  return { items, loading }
}

export async function createWish(ownerId: string, currency: string, draft: WishDraft) {
  const wishRef = push(ref(db, wishlistPath(ownerId)))
  await update(wishRef, {
    name: draft.name.trim(),
    link: normalizeLink(draft.link),
    price: round2(draft.price),
    currency,
    priority: draft.priority,
    note: draft.note?.trim() || null,
    boughtAt: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return wishRef.key!
}

export async function updateWish(ownerId: string, wishId: string, draft: WishDraft) {
  await update(ref(db, wishPath(ownerId, wishId)), {
    name: draft.name.trim(),
    link: normalizeLink(draft.link),
    price: round2(draft.price),
    priority: draft.priority,
    note: draft.note?.trim() || null,
    updatedAt: serverTimestamp(),
  })
}

/** Ticks an item off (or puts it back) without losing it. */
export async function setWishBought(ownerId: string, wishId: string, bought: boolean) {
  await update(ref(db, wishPath(ownerId, wishId)), {
    boughtAt: bought ? Date.now() : null,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteWish(ownerId: string, wishId: string) {
  await remove(ref(db, wishPath(ownerId, wishId)))
}
