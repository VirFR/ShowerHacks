import { useEffect, useState } from 'react'
import { useSession, type ModeSession } from '@/lib/session'
import { getSupabase } from '@/lib/supabase'
import type { Recette } from '@/types'

/**
 * Crafting backend. Recipes are secret: in supabase mode they live in the
 * `recipes` table (no read policy) and only reach the client through
 * `craft()` and `recipe_book()` (see supabase/migrations/0003_crafting.sql).
 * Mock mode loads `mocks/recettes.ts` on demand, as a separate chunk that is
 * never fetched in supabase mode.
 */

export const chargerRecettesMock = () => import('@/mocks/recettes')

/**
 * What the player may see of the recipes: every recipe of the cards they
 * discovered, and how many craftable cards exist (a card can have several recipes).
 */
export interface LivreRecettes {
  total: number
  recettes: Recette[]
}

const MESSAGES_ERREUR: Record<string, string> = {
  no_recipe: 'Nothing happens: these two cards don’t combine.',
  two_cards_needed: 'Pick two cards.',
  card_not_owned: 'One of these cards is no longer in your inventory.',
}

/** Turns a `craft()` exception into a player-facing message. */
export function messageErreurCraft(e: unknown): string {
  const brut = e && typeof e === 'object' && 'message' in e ? String(e.message) : ''
  const code = Object.keys(MESSAGES_ERREUR).find((c) => brut.includes(c))
  return code ? MESSAGES_ERREUR[code] : 'Crafting failed, try again.'
}

export interface CraftDistant {
  inventaireId: string
  itemId: string
  nouvelleDecouverte: boolean
}

/** Supabase mode: consumes both copies and returns the new one. Throws `no_recipe` etc. */
export async function crafterDistant(inventaireA: string, inventaireB: string): Promise<CraftDistant> {
  const { data, error } = await getSupabase().rpc('craft', { p_a: inventaireA, p_b: inventaireB })
  if (error) throw error
  const ligne = (Array.isArray(data) ? data[0] : data) as
    | { inventory_id: string; item_id: string; new_discovery: boolean }
    | undefined
  if (!ligne) throw new Error('craft returned nothing')
  return { inventaireId: ligne.inventory_id, itemId: ligne.item_id, nouvelleDecouverte: ligne.new_discovery }
}

/** Supabase mode: catalog ids the player has discovered. */
export async function chargerDecouvertes(userId: string): Promise<string[]> {
  const { data, error } = await getSupabase().from('discoveries').select('item_id').eq('owner', userId)
  if (error) throw error
  return (data ?? []).map((d) => (d as { item_id: string }).item_id)
}

export async function chargerLivre(mode: ModeSession, decouvertes: string[]): Promise<LivreRecettes> {
  if (mode === 'mock') {
    const { RECETTES } = await chargerRecettesMock()
    const connues = new Set(decouvertes)
    const total = new Set(RECETTES.map((r) => r.resultatId)).size
    return { total, recettes: RECETTES.filter((r) => connues.has(r.resultatId)) }
  }
  const { data, error } = await getSupabase().rpc('recipe_book')
  if (error) throw error
  const livre = data as { total: number; recipes: { result: string; item_a: string; item_b: string }[] }
  return {
    total: livre.total,
    recettes: livre.recipes.map((r) => ({ resultatId: r.result, ingredients: [r.item_a, r.item_b] })),
  }
}

/** The signed-in player's recipe book, reloaded whenever they discover something. Null while loading. */
export function useLivreRecettes(): LivreRecettes | null {
  const { mode, joueur, decouvertes } = useSession()
  const [livre, setLivre] = useState<LivreRecettes | null>(null)
  const cle = decouvertes.toSorted().join(',')

  useEffect(() => {
    if (!joueur) return
    let actif = true
    chargerLivre(mode, cle ? cle.split(',') : [])
      .then((l) => actif && setLivre(l))
      .catch((e) => console.error('[RPS] recipe book load failed', e))
    return () => {
      actif = false
    }
  }, [mode, joueur?.id, cle]) // eslint-disable-line react-hooks/exhaustive-deps

  return livre
}
