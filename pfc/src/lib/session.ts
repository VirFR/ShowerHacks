import { createContext, useContext } from 'react'
import type { Joueur, Objet } from '@/types'

/**
 * Mock session: the "signed-in" player is simply one of the test accounts,
 * remembered in localStorage. To be replaced by Supabase Auth later.
 * The provider lives in `components/SessionProvider.tsx`.
 */

export const CLE_STOCKAGE_SESSION = 'pfc.joueurId'
/** Items won from boosters, on top of each account's starting inventory. */
export const CLE_STOCKAGE_INVENTAIRE_EXTRA = 'pfc.inventaireExtra'

export interface Session {
  /** Signed-in player, or null if nobody is. */
  joueur: Joueur | null
  /** Every available account (sign-in screen, opponent picker). */
  comptes: Joueur[]
  connecter: (joueurId: string) => void
  deconnecter: () => void
  /** Adds items (e.g. from an opened booster) to the signed-in player's inventory. */
  ajouterObjets: (objets: Objet[]) => void
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

/** Extra items won from boosters, keyed by player id. */
export function lireInventairesExtra(): Record<string, Objet[]> {
  try {
    const brut = window.localStorage.getItem(CLE_STOCKAGE_INVENTAIRE_EXTRA)
    if (!brut) return {}
    const valeur = JSON.parse(brut)
    return valeur && typeof valeur === 'object' ? valeur : {}
  } catch {
    return {}
  }
}

export function ecrireInventairesExtra(inventaires: Record<string, Objet[]>) {
  try {
    window.localStorage.setItem(CLE_STOCKAGE_INVENTAIRE_EXTRA, JSON.stringify(inventaires))
  } catch {
    // Storage unavailable (private browsing…): the extra items stay in memory.
  }
}

export function useSession(): Session {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSession must be used under <SessionProvider>')
  return ctx
}
