import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { DEFAULT_CHART, type Chart } from '@/lib/engine'
import { signInWithGoogle, signOut } from '@/lib/auth'
import {
  ecrireInventairesExtra,
  ecrireJoueurId,
  ecrireOnboarding,
  lireInventairesExtra,
  lireJoueurId,
  lireOnboarding,
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

/* ---------- mock mode (no env variables) ---------- */

/** Merges the items won from boosters into a player's starting inventory. */
function avecInventaireExtra(joueur: Joueur, inventairesExtra: Record<string, Objet[]>): Joueur {
  const extra = inventairesExtra[joueur.id]
  return extra && extra.length > 0 ? { ...joueur, inventaire: [...joueur.inventaire, ...extra] } : joueur
}

function useMockSession(): Session {
  const [joueurId, setJoueurId] = useState<string | null>(() => lireJoueurId())
  const [inventairesExtra, setInventairesExtra] = useState<Record<string, Objet[]>>(() => lireInventairesExtra())
  const [version, setVersion] = useState(0)

  /** Adds booster items to the signed-in player's inventory, each copy with its own id. */
  const ajouterObjets = useCallback(
    (objets: Objet[]) => {
      if (!joueurId || objets.length === 0) return
      setInventairesExtra((prev) => {
        const copies = objets.map((o, i) => ({ ...o, inventaireId: `${joueurId}-${Date.now().toString(36)}-${i}-${o.id}` }))
        const suivant = { ...prev, [joueurId]: [...(prev[joueurId] ?? []), ...copies] }
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
    const joueur: Joueur | null = base ? { ...avecInventaireExtra(base, inventairesExtra), onboardedAt: lireOnboarding(base.id) } : null
    return {
      mode: 'mock',
      chargement: false,
      joueur,
      comptes: JOUEURS_MOCK.map((j) => avecInventaireExtra(j, inventairesExtra)),
      connecter,
      connecterGoogle,
      deconnecter,
      ajouterObjets,
      chart: DEFAULT_CHART,
      terminerOnboarding,
      rafraichir,
    }
    // `version` forces a re-read of localStorage after onboarding.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [joueurId, version, inventairesExtra, connecter, connecterGoogle, deconnecter, ajouterObjets, terminerOnboarding, rafraichir])
}

/* ---------- supabase mode ---------- */

function useSupabaseSession(): Session {
  const [userId, setUserId] = useState<string | null>(null)
  const [joueur, setJoueur] = useState<Joueur | null>(null)
  const [chart, setChart] = useState<Chart>(DEFAULT_CHART)
  const [chargement, setChargement] = useState(true)

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

  const ajouterObjets = useCallback(
    (objets: Objet[]) => {
      if (!userId || objets.length === 0) return
      ajouterObjetsDistant(userId, objets)
        .then(() => charger(userId))
        .catch((e) => console.error('[PFC] inventory insert failed', e))
    },
    [userId, charger],
  )

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
      chart,
      terminerOnboarding,
      rafraichir,
    }),
    [chargement, joueur, chart, deconnecter, ajouterObjets, terminerOnboarding, rafraichir],
  )
}
