import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { DEFAULT_CHART, type Chart } from '@/lib/engine'
import { signInWithGoogle, signOut } from '@/lib/auth'
import { trouverRecetteParResultat } from '@/lib/assemblage'
import {
  ecrireInventairesExtra,
  ecrireJoueurId,
  ecrireOnboarding,
  ecrireRecettesConnues,
  ecrireRetraits,
  lireInventairesExtra,
  lireJoueurId,
  lireOnboarding,
  lireRecettesConnues,
  lireRetraits,
  SessionContext,
  type Session,
} from '@/lib/session'
import { supabase } from '@/lib/supabase'
import { JOUEURS_MOCK, trouverJoueur } from '@/mocks'
import { ajouterObjetsDistant, chargerChart, chargerJoueur, terminerOnboardingDistant } from '@/services/profile'
import type { Joueur, Objet } from '@/types'

/** Picks the mock or the Supabase session once, from the env variables. */
export function SessionProvider({ children }: { children: ReactNode }) {
  return supabase ? <SupabaseSessionProvider>{children}</SupabaseSessionProvider> : <MockSessionProvider>{children}</MockSessionProvider>
}

function MockSessionProvider({ children }: { children: ReactNode }) {
  const valeur = useMockSession()
  return <SessionContext.Provider value={valeur}>{children}</SessionContext.Provider>
}

function SupabaseSessionProvider({ children }: { children: ReactNode }) {
  const valeur = useSupabaseSession()
  return <SessionContext.Provider value={valeur}>{children}</SessionContext.Provider>
}

/** Result item ids of any recipes these newly-owned objects unlock. */
function decouvrirRecettes(objets: Objet[]): string[] {
  return objets.map((o) => trouverRecetteParResultat(o.id)?.resultatId).filter((id): id is string => id !== undefined)
}

/* ---------- mock mode (no env variables) ---------- */

/**
 * Merges the items won from boosters (or crafted) into a player's starting
 * inventory, minus any starting item that's since been crafted away.
 */
function avecInventaireExtra(
  joueur: Joueur,
  inventairesExtra: Record<string, Objet[]>,
  retraits: Record<string, string[]>,
): Joueur {
  const extra = inventairesExtra[joueur.id] ?? []
  const retires = new Set(retraits[joueur.id] ?? [])
  const depart = retires.size > 0 ? joueur.inventaire.filter((o) => !retires.has(o.id)) : joueur.inventaire
  return { ...joueur, inventaire: [...depart, ...extra] }
}

function useMockSession(): Session {
  const [joueurId, setJoueurId] = useState<string | null>(() => lireJoueurId())
  const [inventairesExtra, setInventairesExtra] = useState<Record<string, Objet[]>>(() => lireInventairesExtra())
  const [retraits, setRetraits] = useState<Record<string, string[]>>(() => lireRetraits())
  const [recettesParJoueur, setRecettesParJoueur] = useState<Record<string, string[]>>(() => lireRecettesConnues())
  const [version, setVersion] = useState(0)

  /** Adds booster/craft items (each copy gets its own id) and unlocks any recipe they complete. */
  const ajouterObjets = useCallback(
    (objets: Objet[]) => {
      if (!joueurId || objets.length === 0) return
      setInventairesExtra((prev) => {
        const copies = objets.map((o, i) => ({ ...o, inventaireId: `${joueurId}-${Date.now().toString(36)}-${i}-${o.id}` }))
        const suivant = { ...prev, [joueurId]: [...(prev[joueurId] ?? []), ...copies] }
        ecrireInventairesExtra(suivant)
        return suivant
      })
      const decouvertes = decouvrirRecettes(objets)
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

  /**
   * Removes one owned copy per given catalog id: from the booster/craft
   * copies first, falling back to retiring a starting item (there's only
   * ever one copy of those, so retiring by id is unambiguous).
   */
  const retirerObjets = useCallback(
    (ids: string[]) => {
      if (!joueurId || ids.length === 0) return
      setInventairesExtra((prev) => {
        const liste = [...(prev[joueurId] ?? [])]
        const aRetirer: string[] = []
        for (const id of ids) {
          const index = liste.findIndex((o) => o.id === id)
          if (index !== -1) liste.splice(index, 1)
          else aRetirer.push(id)
        }
        if (aRetirer.length > 0) {
          setRetraits((prevRetraits) => {
            const suivantRetraits = { ...prevRetraits, [joueurId]: [...(prevRetraits[joueurId] ?? []), ...aRetirer] }
            ecrireRetraits(suivantRetraits)
            return suivantRetraits
          })
        }
        const suivant = { ...prev, [joueurId]: liste }
        ecrireInventairesExtra(suivant)
        return suivant
      })
    },
    [joueurId],
  )

  const connecter = useCallback((id: string) => {
    if (!trouverJoueur(id)) return
    ecrireJoueurId(id)
    setJoueurId(id)
  }, [])

  const deconnecter = useCallback(async () => {
    ecrireJoueurId(null)
    setJoueurId(null)
  }, [])

  const connecterGoogle = useCallback(async () => connecter(JOUEURS_MOCK[0].id), [connecter])

  const terminerOnboarding = useCallback(async () => {
    if (!joueurId) return
    ecrireOnboarding(joueurId, new Date().toISOString())
    setVersion((v) => v + 1)
  }, [joueurId])

  const rafraichir = useCallback(async () => setVersion((v) => v + 1), [])

  return useMemo<Session>(() => {
    const base = trouverJoueur(joueurId)
    const joueur: Joueur | null = base
      ? { ...avecInventaireExtra(base, inventairesExtra, retraits), onboardedAt: lireOnboarding(base.id) }
      : null
    return {
      mode: 'mock',
      chargement: false,
      joueur,
      comptes: JOUEURS_MOCK.map((j) => avecInventaireExtra(j, inventairesExtra, retraits)),
      connecter,
      connecterGoogle,
      deconnecter,
      ajouterObjets,
      retirerObjets,
      recettesConnues: joueurId ? (recettesParJoueur[joueurId] ?? []) : [],
      chart: DEFAULT_CHART,
      terminerOnboarding,
      rafraichir,
    }
    // `version` forces a re-read of localStorage after onboarding.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    joueurId,
    version,
    inventairesExtra,
    retraits,
    recettesParJoueur,
    connecter,
    connecterGoogle,
    deconnecter,
    ajouterObjets,
    retirerObjets,
    terminerOnboarding,
    rafraichir,
  ])
}

/* ---------- supabase mode ---------- */

function useSupabaseSession(): Session {
  const [userId, setUserId] = useState<string | null>(null)
  const [joueur, setJoueur] = useState<Joueur | null>(null)
  const [chart, setChart] = useState<Chart>(DEFAULT_CHART)
  const [chargement, setChargement] = useState(true)
  const [recettesParJoueur, setRecettesParJoueur] = useState<Record<string, string[]>>(() => lireRecettesConnues())

  const charger = useCallback(async (id: string | null) => {
    if (!id) {
      setJoueur(null)
      return
    }
    try {
      // The profile row is created by a trigger right after sign-up; retry briefly.
      for (let essai = 0; essai < 5; essai++) {
        const j = await chargerJoueur(id)
        if (j) {
          setJoueur(j)
          return
        }
        await new Promise((r) => window.setTimeout(r, 400))
      }
      setJoueur(null)
    } catch (e) {
      console.error('[PFC] profile load failed', e)
      setJoueur(null)
    }
  }, [])

  useEffect(() => {
    const sb = supabase!
    chargerChart().then(setChart).catch((e) => console.error('[PFC] chart load failed', e))
    sb.auth.getSession().then(({ data }) => {
      const id = data.session?.user.id ?? null
      setUserId(id)
      charger(id).finally(() => setChargement(false))
    })
    const { data: sub } = sb.auth.onAuthStateChange((_event, session) => {
      const id = session?.user.id ?? null
      setUserId((prev) => {
        if (prev !== id) charger(id)
        return id
      })
    })
    return () => sub.subscription.unsubscribe()
  }, [charger])

  const rafraichir = useCallback(async () => charger(userId), [charger, userId])

  const terminerOnboarding = useCallback(async () => {
    await terminerOnboardingDistant()
    await charger(userId)
  }, [charger, userId])

  const deconnecter = useCallback(async () => {
    await signOut()
    setJoueur(null)
    setUserId(null)
  }, [])

  const marquerRecettesDecouvertes = useCallback(
    (objets: Objet[]) => {
      if (!userId) return
      const decouvertes = decouvrirRecettes(objets)
      if (decouvertes.length === 0) return
      setRecettesParJoueur((prev) => {
        const connues = new Set(prev[userId] ?? [])
        decouvertes.forEach((id) => connues.add(id))
        const suivant = { ...prev, [userId]: [...connues] }
        ecrireRecettesConnues(suivant)
        return suivant
      })
    },
    [userId],
  )

  const ajouterObjets = useCallback(
    (objets: Objet[]) => {
      if (!userId || objets.length === 0) return
      ajouterObjetsDistant(userId, objets)
        .then(() => charger(userId))
        .catch((e) => console.error('[PFC] inventory insert failed', e))
      marquerRecettesDecouvertes(objets)
    },
    [userId, charger, marquerRecettesDecouvertes],
  )

  /**
   * No backend mutation exists yet to delete inventory rows, so this only
   * updates the signed-in view; it won't survive the next `rafraichir()`.
   * Enough to demo crafting until a real removal call is wired up.
   */
  const retirerObjets = useCallback((ids: string[]) => {
    setJoueur((prev) => {
      if (!prev) return prev
      const inventaire = [...prev.inventaire]
      for (const id of ids) {
        const index = inventaire.findIndex((o) => o.id === id)
        if (index !== -1) inventaire.splice(index, 1)
      }
      return { ...prev, inventaire }
    })
  }, [])

  return useMemo<Session>(
    () => ({
      mode: 'supabase',
      chargement,
      joueur,
      comptes: [],
      connecter: () => {},
      connecterGoogle: signInWithGoogle,
      deconnecter,
      ajouterObjets,
      retirerObjets,
      recettesConnues: userId ? (recettesParJoueur[userId] ?? []) : [],
      chart,
      terminerOnboarding,
      rafraichir,
    }),
    [chargement, joueur, userId, recettesParJoueur, chart, deconnecter, ajouterObjets, retirerObjets, terminerOnboarding, rafraichir],
  )
}
