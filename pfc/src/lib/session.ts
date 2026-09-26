import { createContext, useContext } from 'react'
import type { Joueur, Objet } from '@/types'

/**
 * Mock session: the "signed-in" player is simply one of the test accounts,
 * remembered in localStorage. To be replaced by Supabase Auth later.
 * The provider lives in `components/SessionProvider.tsx`.
 */

export const CLE_STOCKAGE_SESSION = 'pfc.joueurId'
/** Each account's current inventory (starting items + boosters - crafted-away items). */
export const CLE_STOCKAGE_INVENTAIRES = 'pfc.inventaires'
/** Recipe ids (result item id) each account has discovered, for the recipe book. */
export const CLE_STOCKAGE_RECETTES = 'pfc.recettesConnues'

export interface Session {
  /** Signed-in player, or null if nobody is. */
  joueur: Joueur | null
  /** Every available account (sign-in screen, opponent picker). */
  comptes: Joueur[]
  connecter: (joueurId: string) => void
  deconnecter: () => void
  /** Adds items (e.g. from an opened booster or a successful craft) to the signed-in player's inventory. */
  ajouterObjets: (objets: Objet[]) => void
  /** Removes one owned instance per given id (e.g. the two ingredients consumed by a craft). */
  retirerObjets: (ids: string[]) => void
  /** Result item ids of the recipes the signed-in player has discovered. */
  recettesConnues: string[]
}

export const SessionContext = createContext<Session | null>(null)

export function lireJoueurId(): string | null {
  try {
    return window.localStorage.getItem(CLE_STOCKAGE_SESSION)
  } catch {
    return null
  }
}

export function ecrireJoueurId(id: string | null) {
  try {
    if (id) window.localStorage.setItem(CLE_STOCKAGE_SESSION, id)
    else window.localStorage.removeItem(CLE_STOCKAGE_SESSION)
  } catch {
    // Storage unavailable (private browsing…): the session stays in memory.
  }
}

/** Each account's current inventory, keyed by player id. */
export function lireInventaires(): Record<string, Objet[]> {
  try {
    const brut = window.localStorage.getItem(CLE_STOCKAGE_INVENTAIRES)
    if (!brut) return {}
    const valeur = JSON.parse(brut)
    return valeur && typeof valeur === 'object' ? valeur : {}
  } catch {
    return {}
  }
}

export function ecrireInventaires(inventaires: Record<string, Objet[]>) {
  try {
    window.localStorage.setItem(CLE_STOCKAGE_INVENTAIRES, JSON.stringify(inventaires))
  } catch {
    // Storage unavailable (private browsing…): the inventory stays in memory.
  }
}

/** Known recipes (by result item id), keyed by player id. */
export function lireRecettesConnues(): Record<string, string[]> {
  try {
    const brut = window.localStorage.getItem(CLE_STOCKAGE_RECETTES)
    if (!brut) return {}
    const valeur = JSON.parse(brut)
    return valeur && typeof valeur === 'object' ? valeur : {}
  } catch {
    return {}
  }
}

export function ecrireRecettesConnues(recettes: Record<string, string[]>) {
  try {
    window.localStorage.setItem(CLE_STOCKAGE_RECETTES, JSON.stringify(recettes))
  } catch {
    // Storage unavailable (private browsing…): the recipe book stays in memory.
  }
}

export function useSession(): Session {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSession must be used under <SessionProvider>')
  return ctx
}
