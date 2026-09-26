import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { JOUEURS_MOCK, trouverJoueur } from '@/mocks'
import {
  ecrireInventairesExtra,
  ecrireJoueurId,
  lireInventairesExtra,
  lireJoueurId,
  SessionContext,
  type Session,
} from '@/lib/session'
import type { Joueur, Objet } from '@/types'

/** Merges the items won from boosters into a player's starting inventory. */
function avecInventaireExtra(joueur: Joueur, inventairesExtra: Record<string, Objet[]>): Joueur {
  const extra = inventairesExtra[joueur.id]
  return extra && extra.length > 0 ? { ...joueur, inventaire: [...joueur.inventaire, ...extra] } : joueur
}

/** Provides the mock session (signed-in test account) to the whole app. */
export function SessionProvider({ children }: { children: ReactNode }) {
  const [joueurId, setJoueurId] = useState<string | null>(() => lireJoueurId())
  const [inventairesExtra, setInventairesExtra] = useState<Record<string, Objet[]>>(() => lireInventairesExtra())

  const connecter = useCallback((id: string) => {
    if (!trouverJoueur(id)) return
    ecrireJoueurId(id)
    setJoueurId(id)
  }, [])

  const deconnecter = useCallback(() => {
    ecrireJoueurId(null)
    setJoueurId(null)
  }, [])

  /** Adds booster items to the signed-in player's inventory (persisted in localStorage). */
  const ajouterObjets = useCallback(
    (objets: Objet[]) => {
      if (!joueurId || objets.length === 0) return
      setInventairesExtra((prev) => {
        const suivant = { ...prev, [joueurId]: [...(prev[joueurId] ?? []), ...objets] }
        ecrireInventairesExtra(suivant)
        return suivant
      })
    },
    [joueurId],
  )

  const valeur = useMemo<Session>(() => {
    const base = trouverJoueur(joueurId) ?? null
    return {
      joueur: base ? avecInventaireExtra(base, inventairesExtra) : null,
      comptes: JOUEURS_MOCK.map((j) => avecInventaireExtra(j, inventairesExtra)),
      connecter,
      deconnecter,
      ajouterObjets,
    }
  }, [joueurId, inventairesExtra, connecter, deconnecter, ajouterObjets])

  return <SessionContext.Provider value={valeur}>{children}</SessionContext.Provider>
}
