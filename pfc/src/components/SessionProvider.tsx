import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { JOUEURS_MOCK, trouverJoueur } from '@/mocks'
import { trouverRecetteParResultat } from '@/lib/assemblage'
import {
  ecrireInventaires,
  ecrireJoueurId,
  ecrireRecettesConnues,
  lireInventaires,
  lireJoueurId,
  lireRecettesConnues,
  SessionContext,
  type Session,
} from '@/lib/session'
import type { Objet } from '@/types'

/** An account's current inventory: what's stored for it, or its starting items if untouched. */
function inventaireDe(id: string, inventaires: Record<string, Objet[]>): Objet[] {
  return inventaires[id] ?? trouverJoueur(id)?.inventaire ?? []
}

/** Provides the mock session (signed-in test account) to the whole app. */
export function SessionProvider({ children }: { children: ReactNode }) {
  const [joueurId, setJoueurId] = useState<string | null>(() => lireJoueurId())
  const [inventaires, setInventaires] = useState<Record<string, Objet[]>>(() => lireInventaires())
  const [recettesParJoueur, setRecettesParJoueur] = useState<Record<string, string[]>>(() => lireRecettesConnues())

  const connecter = useCallback((id: string) => {
    if (!trouverJoueur(id)) return
    ecrireJoueurId(id)
    setJoueurId(id)
  }, [])

  const deconnecter = useCallback(() => {
    ecrireJoueurId(null)
    setJoueurId(null)
  }, [])

  /** Adds items (booster pull or craft result) and, for any craftable one, unlocks its recipe. */
  const ajouterObjets = useCallback(
    (objets: Objet[]) => {
      if (!joueurId || objets.length === 0) return
      setInventaires((prev) => {
        const suivant = { ...prev, [joueurId]: [...inventaireDe(joueurId, prev), ...objets] }
        ecrireInventaires(suivant)
        return suivant
      })
      const decouvertes = objets
        .map((o) => trouverRecetteParResultat(o.id)?.resultatId)
        .filter((id): id is string => id !== undefined)
      if (decouvertes.length > 0) {
        setRecettesParJoueur((prev) => {
          const connues = new Set(prev[joueurId] ?? [])
          decouvertes.forEach((id) => connues.add(id))
          const suivant = { ...prev, [joueurId]: [...connues] }
          ecrireRecettesConnues(suivant)
          return suivant
        })
      }
    },
    [joueurId],
  )

  /** Removes one owned instance per given id (the two ingredients a craft consumes). */
  const retirerObjets = useCallback(
    (ids: string[]) => {
      if (!joueurId || ids.length === 0) return
      setInventaires((prev) => {
        const restant = [...inventaireDe(joueurId, prev)]
        for (const id of ids) {
          const index = restant.findIndex((o) => o.id === id)
          if (index !== -1) restant.splice(index, 1)
        }
        const suivant = { ...prev, [joueurId]: restant }
        ecrireInventaires(suivant)
        return suivant
      })
    },
    [joueurId],
  )

  const valeur = useMemo<Session>(() => {
    const base = trouverJoueur(joueurId) ?? null
    return {
      joueur: base ? { ...base, inventaire: inventaireDe(base.id, inventaires) } : null,
      comptes: JOUEURS_MOCK.map((j) => ({ ...j, inventaire: inventaireDe(j.id, inventaires) })),
      connecter,
      deconnecter,
      ajouterObjets,
      retirerObjets,
      recettesConnues: joueurId ? (recettesParJoueur[joueurId] ?? []) : [],
    }
  }, [joueurId, inventaires, connecter, deconnecter, ajouterObjets, retirerObjets, recettesParJoueur])

  return <SessionContext.Provider value={valeur}>{children}</SessionContext.Provider>
}
