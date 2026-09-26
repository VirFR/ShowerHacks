import { createContext, useContext } from 'react'
import type { Chart } from '@/lib/engine'
import type { Joueur, Objet, Recette, ResultatAssemblage } from '@/types'

/**
 * Session shared by every page.
 *
 * Two modes, picked at start-up from the env variables (see `lib/supabase.ts`):
 * - `supabase`: Google sign-in through Supabase Auth, profile and inventory
 *   loaded from the database;
 * - `mock`: no env variables, the test accounts of `src/mocks` and
 *   localStorage. Everything, including battles against the bot, works
 *   offline in this mode.
 *
 * The provider lives in `components/SessionProvider.tsx`.
 */

export const CLE_STOCKAGE_SESSION = 'pfc.joueurId'
export const CLE_STOCKAGE_ONBOARDING = 'pfc.onboarded'
/** Mock mode: items won from boosters, on top of each account's starting inventory. */
export const CLE_STOCKAGE_INVENTAIRE_EXTRA = 'pfc.inventaireExtra'
/** Mock mode: starting-item ids crafted away (consumed as recipe ingredients), per account. */
export const CLE_STOCKAGE_RETRAITS = 'pfc.retraits'
/** Recipe ids (result item id) each account has discovered, for the recipe book. Both modes. */
export const CLE_STOCKAGE_RECETTES = 'pfc.recettesConnues'

export type ModeSession = 'mock' | 'supabase'

export interface Session {
  mode: ModeSession
  /** True while the initial session / profile is being resolved. */
  chargement: boolean
  /** Signed-in player, or null if nobody is. */
  joueur: Joueur | null
  /** Mock accounts (sign-in screen in mock mode). Empty in supabase mode. */
  comptes: Joueur[]
  /** Mock mode only: sign in as a test account. */
  connecter: (joueurId: string) => void
  /** Starts the Google OAuth flow (mock mode: signs in as the first account). */
  connecterGoogle: () => Promise<void>
  deconnecter: () => Promise<void>
  /** Adds items (e.g. from an opened booster or a successful craft) to the signed-in player's inventory. */
  ajouterObjets: (objets: Objet[]) => void
  /**
   * Removes one owned copy per given catalog id (e.g. the two ingredients a
   * craft consumes). Mock mode: persisted (including starting items).
   * Supabase mode: local-only until a matching backend mutation exists.
   */
  retirerObjets: (ids: string[]) => void
  /**
   * Combines two owned cards into a recipe's result, consuming both.
   * Mock mode: resolved against `mocks/recettes.ts`, persisted to
   * localStorage. Supabase mode: the `craft` RPC (`services/craft.ts`),
   * which owns ingredient ownership and the recipe match server-side.
   */
  combiner: (a: Objet, b: Objet) => Promise<ResultatAssemblage>
  /** Recipe book: total recipe count + full ingredients of the ones discovered so far. */
  livreRecettes: { total: number; decouvertes: Recette[] }
  /** Category chart (who beats whom), loaded from the DB or the default one. */
  chart: Chart
  /** Marks the first-login tutorial as done. */
  terminerOnboarding: () => Promise<void>
  /** Reloads profile and inventory (after a battle, a booster…). */
  rafraichir: () => Promise<void>
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

export function lireOnboarding(id: string): string | null {
  try {
    return window.localStorage.getItem(`${CLE_STOCKAGE_ONBOARDING}.${id}`)
  } catch {
    return null
  }
}

export function ecrireOnboarding(id: string, iso: string) {
  try {
    window.localStorage.setItem(`${CLE_STOCKAGE_ONBOARDING}.${id}`, iso)
  } catch {
    // ignore
  }
}

/** Extra items won from boosters, keyed by player id (mock mode). */
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

/** Starting-item ids crafted away, keyed by player id (mock mode). */
export function lireRetraits(): Record<string, string[]> {
  try {
    const brut = window.localStorage.getItem(CLE_STOCKAGE_RETRAITS)
    if (!brut) return {}
    const valeur = JSON.parse(brut)
    return valeur && typeof valeur === 'object' ? valeur : {}
  } catch {
    return {}
  }
}

export function ecrireRetraits(retraits: Record<string, string[]>) {
  try {
    window.localStorage.setItem(CLE_STOCKAGE_RETRAITS, JSON.stringify(retraits))
  } catch {
    // Storage unavailable (private browsing…): the removal stays in memory.
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

/** True once the player has finished the first-login tutorial. */
export function estOnboarde(joueur: Joueur | null): boolean {
  return Boolean(joueur?.onboardedAt)
}
