import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { JOUEURS_MOCK, trouverJoueur } from '@/mocks'
import { ecrireJoueurId, lireJoueurId, SessionContext, type Session } from '@/lib/session'

/** Provides the mock session (signed-in test account) to the whole app. */
export function SessionProvider({ children }: { children: ReactNode }) {
  const [joueurId, setJoueurId] = useState<string | null>(() => lireJoueurId())

  const connecter = useCallback((id: string) => {
    if (!trouverJoueur(id)) return
    ecrireJoueurId(id)
    setJoueurId(id)
  }, [])

  const deconnecter = useCallback(() => {
    ecrireJoueurId(null)
    setJoueurId(null)
  }, [])

  const valeur = useMemo<Session>(
    () => ({
      joueur: trouverJoueur(joueurId) ?? null,
      comptes: JOUEURS_MOCK,
      connecter,
      deconnecter,
    }),
    [joueurId, connecter, deconnecter],
  )

  return <SessionContext.Provider value={valeur}>{children}</SessionContext.Provider>
}
