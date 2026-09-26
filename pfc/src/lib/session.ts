import { createContext, useContext } from 'react'
import type { Joueur } from '@/types'

/**
 * Mock session: the "signed-in" player is simply one of the test accounts,
 * remembered in localStorage. To be replaced by Supabase Auth later.
 * The provider lives in `components/SessionProvider.tsx`.
 */

export const CLE_STOCKAGE_SESSION = 'pfc.joueurId'

export interface Session {
  /** Signed-in player, or null if nobody is. */
  joueur: Joueur | null
  /** Every available account (sign-in screen, opponent picker). */
  comptes: Joueur[]
  connecter: (joueurId: string) => void
  deconnecter: () => void
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

export function useSession(): Session {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSession must be used under <SessionProvider>')
  return ctx
}
