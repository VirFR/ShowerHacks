import { createContext, useContext } from 'react'
import type { Chart } from '@/lib/engine'
import type { Joueur, Objet, ResultatAssemblage } from '@/types'

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
/** Mock mode: inventory copy ids consumed by crafting (starting copies included), per account. */
export const CLE_STOCKAGE_RETRAITS = 'pfc.retraitsCopies'
/** Mock mode: catalog ids of every item each account has ever owned (reveals recipes). */
export const CLE_STOCKAGE_DECOUVERTES = 'pfc.decouvertes'

/** Mock mode: username / avatar edits, per account. */
export const CLE_STOCKAGE_PROFILS = 'pfc.profils'

export type ModeSession = 'mock' | 'supabase'

/** What the "Edit profile" form can change. `avatarUrl: null` falls back to the monogram. */
export interface ModifProfil {
  pseudo: string
  avatarUrl: string | null
}

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
  /**
   * Resolves once the items are saved; rejects if the database refused them
   * (supabase mode), so the caller can tell the player instead of losing them.
   */
  ajouterObjets: (objets: Objet[]) => Promise<void>
  /**
   * Combines two inventory copies (Little-Alchemy style). On success both are
   * consumed and the result is added. Supabase mode: `craft()` RPC, the
   * recipes never reach the client.
   */
  crafter: (a: Objet, b: Objet) => Promise<ResultatAssemblage>
  /**
   * Catalog ids of every item the player has ever owned (starter, booster,
   * craft). A recipe is revealed once its result is in this list.
   */
  decouvertes: string[]
  /** Category chart (who beats whom), loaded from the DB or the default one. */
  chart: Chart
  /** Marks the first-login tutorial as done. */
  terminerOnboarding: () => Promise<void>
  /** Reloads profile and inventory (after a battle, a booster…). */
  rafraichir: () => Promise<void>
  /** Saves the username and avatar. Rejects with a player-facing message (username taken…). */
  modifierProfil: (modif: ModifProfil) => Promise<void>
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

function lireParJoueur(cle: string): Record<string, string[]> {
  try {
    const brut = window.localStorage.getItem(cle)
    if (!brut) return {}
    const valeur = JSON.parse(brut)
    return valeur && typeof valeur === 'object' ? valeur : {}
  } catch {
    return {}
  }
}

function ecrireParJoueur(cle: string, valeur: Record<string, string[]>) {
  try {
    window.localStorage.setItem(cle, JSON.stringify(valeur))
  } catch {
    // Storage unavailable (private browsing…): the value stays in memory.
  }
}

/** Inventory copy ids consumed by crafting, keyed by player id (mock mode). */
export const lireRetraits = () => lireParJoueur(CLE_STOCKAGE_RETRAITS)
export const ecrireRetraits = (retraits: Record<string, string[]>) => ecrireParJoueur(CLE_STOCKAGE_RETRAITS, retraits)

/** Discovered catalog ids, keyed by player id (mock mode). */
export const lireDecouvertes = () => lireParJoueur(CLE_STOCKAGE_DECOUVERTES)
export const ecrireDecouvertes = (decouvertes: Record<string, string[]>) =>
  ecrireParJoueur(CLE_STOCKAGE_DECOUVERTES, decouvertes)

export function useSession(): Session {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSession must be used under <SessionProvider>')
  return ctx
}

/** True once the player has finished the first-login tutorial. */
export function estOnboarde(joueur: Joueur | null): boolean {
  return Boolean(joueur?.onboardedAt)
}

/** Profile edits of the mock accounts, keyed by player id. */
export function lireProfils(): Record<string, ModifProfil> {
  try {
    const brut = window.localStorage.getItem(CLE_STOCKAGE_PROFILS)
    if (!brut) return {}
    const valeur = JSON.parse(brut)
    return valeur && typeof valeur === 'object' ? valeur : {}
  } catch {
    return {}
  }
}

export function ecrireProfils(profils: Record<string, ModifProfil>) {
  try {
    window.localStorage.setItem(CLE_STOCKAGE_PROFILS, JSON.stringify(profils))
  } catch {
    // Storage unavailable (private browsing…): the edits stay in memory.
  }
}
