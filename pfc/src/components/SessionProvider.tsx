import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { DEFAULT_CHART, type Chart } from '@/lib/engine'
import { signInWithGoogle, signOut } from '@/lib/auth'
import {
  ecrireJoueurId,
  ecrireOnboarding,
  lireJoueurId,
  lireOnboarding,
  SessionContext,
  type Session,
} from '@/lib/session'
import { supabase } from '@/lib/supabase'
import { JOUEURS_MOCK, trouverJoueur } from '@/mocks'
import { chargerChart, chargerJoueur, terminerOnboardingDistant } from '@/services/profile'
import type { Joueur } from '@/types'

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

function useMockSession(): Session {
  const [joueurId, setJoueurId] = useState<string | null>(() => lireJoueurId())
  const [version, setVersion] = useState(0)

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
    const joueur: Joueur | null = base ? { ...base, onboardedAt: lireOnboarding(base.id) } : null
    return {
      mode: 'mock',
      chargement: false,
      joueur,
      comptes: JOUEURS_MOCK,
      connecter,
      connecterGoogle,
      deconnecter,
      chart: DEFAULT_CHART,
      terminerOnboarding,
      rafraichir,
    }
    // `version` forces a re-read of localStorage after onboarding.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [joueurId, version, connecter, connecterGoogle, deconnecter, terminerOnboarding, rafraichir])
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

  return useMemo<Session>(
    () => ({
      mode: 'supabase',
      chargement,
      joueur,
      comptes: [],
      connecter: () => {},
      connecterGoogle: signInWithGoogle,
      deconnecter,
      chart,
      terminerOnboarding,
      rafraichir,
    }),
    [chargement, joueur, chart, deconnecter, terminerOnboarding, rafraichir],
  )
}
