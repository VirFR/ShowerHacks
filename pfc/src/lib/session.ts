import { createContext, useContext } from 'react'
import type { Joueur } from '@/types'

/**
 * Session mock : le joueur "connecté" est simplement l'un des comptes de test,
 * mémorisé dans localStorage. À remplacer par Supabase Auth plus tard.
 * Le provider vit dans `components/SessionProvider.tsx`.
 */

export const CLE_STOCKAGE_SESSION = 'pfc.joueurId'

export interface Session {
  /** Joueur connecté, ou null si personne. */
  joueur: Joueur | null
  /** Tous les comptes disponibles (écran de connexion, choix d'adversaire). */
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
    // Stockage indisponible (navigation privée…) : la session reste en mémoire.
  }
}

export function useSession(): Session {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSession doit être utilisé sous <SessionProvider>')
  return ctx
}
