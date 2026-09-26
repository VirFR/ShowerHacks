import { getSupabase } from '@/lib/supabase'
import type { Recette } from '@/types'

/**
 * Crafting, supabase mode. Two RPCs own the whole feature (see
 * `supabase/migrations/0003_crafting.sql`):
 * - `recipe_book()`: total recipe count + full ingredients of the recipes
 *   *this* player has discovered (the `discoveries` table, filled by a
 *   trigger on every inventory insert — booster pull or craft result alike).
 *   Undiscovered pairs are never sent to the client.
 * - `craft(p_a, p_b)`: takes two owned **inventory row ids**, consumes them
 *   and inserts the result if a recipe matches; raises a plain-text error
 *   code otherwise (see `ErreurCraft`).
 */

interface RecipeBookRow {
  result: string
  item_a: string
  item_b: string
}

interface RecipeBookPayload {
  total: number
  recipes: RecipeBookRow[]
}

function versRecette(row: RecipeBookRow): Recette {
  return { resultatId: row.result, ingredients: [row.item_a, row.item_b] }
}

export async function chargerLivreRecettes(): Promise<{ total: number; decouvertes: Recette[] }> {
  const { data, error } = await getSupabase().rpc('recipe_book')
  if (error) throw error
  const payload = data as RecipeBookPayload
  return { total: payload.total, decouvertes: (payload.recipes ?? []).map(versRecette) }
}

export type ErreurCraft = 'not_authenticated' | 'two_cards_needed' | 'card_not_owned' | 'no_recipe'

const CODES_CRAFT: ErreurCraft[] = ['not_authenticated', 'two_cards_needed', 'card_not_owned', 'no_recipe']

/** Narrows a thrown RPC error down to one of the codes `craft()` raises, if it matches. */
export function codeErreurCraft(e: unknown): ErreurCraft | undefined {
  const message = e instanceof Error ? e.message : typeof e === 'string' ? e : undefined
  return CODES_CRAFT.find((code) => code === message)
}

/** Combines two owned inventory rows through the `craft` RPC. Throws on failure (see `codeErreurCraft`). */
export async function combinerDistant(
  inventaireIdA: string,
  inventaireIdB: string,
): Promise<{ resultatId: string; nouvelleDecouverte: boolean }> {
  const { data, error } = await getSupabase().rpc('craft', { p_a: inventaireIdA, p_b: inventaireIdB })
  if (error) throw error
  const ligne = (data as { inventory_id: string; item_id: string; new_discovery: boolean }[] | null)?.[0]
  if (!ligne) throw new Error('craft_no_result')
  return { resultatId: ligne.item_id, nouvelleDecouverte: ligne.new_discovery }
}
