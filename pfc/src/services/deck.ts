import { DECK_SIZE } from '@/lib/engine'
import { supabase } from '@/lib/supabase'
import type { Joueur, Objet } from '@/types'

/**
 * The player's active deck: five inventory copy ids. Stored in the `decks`
 * table in supabase mode, in localStorage in mock mode.
 */

const CLE = 'pfc.deck'

function cleLocale(joueurId: string) {
  return `${CLE}.${joueurId}`
}

export async function chargerDeckIds(joueurId: string): Promise<string[]> {
  if (supabase) {
    const { data, error } = await supabase.from('decks').select('inventory_ids').eq('owner', joueurId).maybeSingle()
    if (error) throw error
    return (data?.inventory_ids as string[] | undefined) ?? []
  }
  try {
    const brut = window.localStorage.getItem(cleLocale(joueurId))
    return brut ? (JSON.parse(brut) as string[]) : []
  } catch {
    return []
  }
}

export async function sauverDeckIds(joueurId: string, ids: string[]): Promise<void> {
  if (ids.length !== DECK_SIZE) throw new Error(`A deck holds exactly ${DECK_SIZE} cards.`)
  if (supabase) {
    const { error } = await supabase
      .from('decks')
      .upsert({ owner: joueurId, inventory_ids: ids, updated_at: new Date().toISOString() })
    if (error) throw error
    return
  }
  try {
    window.localStorage.setItem(cleLocale(joueurId), JSON.stringify(ids))
  } catch {
    // ignore
  }
}

/** Resolves saved ids against the inventory; only complete decks are valid. */
export function resoudreDeck(joueur: Joueur, ids: string[]): Objet[] | null {
  const parId = new Map(joueur.inventaire.map((o) => [o.inventaireId ?? o.id, o]))
  const cartes = ids.map((id) => parId.get(id)).filter((o): o is Objet => Boolean(o))
  return cartes.length === DECK_SIZE ? cartes : null
}

/** Loads and resolves the active deck in one go. */
export async function chargerDeck(joueur: Joueur): Promise<Objet[] | null> {
  return resoudreDeck(joueur, await chargerDeckIds(joueur.id))
}
