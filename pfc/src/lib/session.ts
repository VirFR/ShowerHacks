import { createContext, useContext } from 'react'
import type { Chart } from '@/lib/engine'
import type { Joueur } from '@/types'

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

export function useSession(): Session {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSession must be used under <SessionProvider>')
  return ctx
}

/** True once the player has finished the first-login tutorial. */
export function estOnboarde(joueur: Joueur | null): boolean {
  return Boolean(joueur?.onboardedAt)
}
