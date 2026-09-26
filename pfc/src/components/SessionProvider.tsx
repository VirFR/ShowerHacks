import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { DEFAULT_CHART, type Chart } from '@/lib/engine'
import { signInWithGoogle, signOut } from '@/lib/auth'
import { trouverRecette, trouverRecetteParResultat } from '@/lib/assemblage'
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
import { JOUEURS_MOCK, RECETTES, trouverJoueur, trouverObjet } from '@/mocks'
import { ajouterObjetsDistant, chargerChart, chargerJoueur, terminerOnboardingDistant } from '@/services/profile'
import { chargerLivreRecettes, codeErreurCraft, combinerDistant } from '@/services/craft'
import type { Joueur, Objet, Recette, ResultatAssemblage } from '@/types'

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

  /** Resolves a combination against `mocks/recettes.ts` and, on success, applies it. */
  const combiner = useCallback(
    async (a: Objet, b: Objet): Promise<ResultatAssemblage> => {
      if (a.id === b.id) {
        return { succes: false, message: 'Can’t combine: you need two different cards.' }
      }
      const recette = trouverRecette(a.id, b.id)
      const resultat = recette ? trouverObjet(recette.resultatId) : undefined
      if (!recette || !resultat) {
        return { succes: false, message: `Can’t combine: no known recipe for ${a.nom} + ${b.nom}.` }
      }
      retirerObjets([a.id, b.id])
      ajouterObjets([resultat])
      return { succes: true, message: `You crafted ${resultat.nom}!`, objetResultat: resultat }
    },
    [ajouterObjets, retirerObjets],
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
    const connues = new Set(joueurId ? (recettesParJoueur[joueurId] ?? []) : [])
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
      combiner,
      livreRecettes: { total: RECETTES.length, decouvertes: RECETTES.filter((r) => connues.has(r.resultatId)) },
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
    combiner,
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
  const [livre, setLivre] = useState<{ total: number; decouvertes: Recette[] }>({ total: 0, decouvertes: [] })

  /** Recipe book from the DB (see `services/craft.ts`): source of truth in supabase mode. */
  const chargerLivre = useCallback(() => {
    chargerLivreRecettes()
      .then(setLivre)
      .catch((e) => console.error('[PFC] recipe book load failed', e))
  }, [])

  const charger = useCallback(
    async (id: string | null) => {
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
            chargerLivre()
            return
          }
          await new Promise((r) => window.setTimeout(r, 400))
        }
        setJoueur(null)
      } catch (e) {
        console.error('[PFC] profile load failed', e)
        setJoueur(null)
      }
    },
    [chargerLivre],
  )

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
      // The `on_inventory_insert_discover` trigger updates `discoveries` server-side;
      // reloading the recipe book after the insert picks that up.
      ajouterObjetsDistant(userId, objets)
        .then(() => charger(userId))
        .catch((e) => console.error('[PFC] inventory insert failed', e))
    },
    [userId, charger],
  )

  /**
   * Optimistic-only: no generic inventory-removal mutation exists (crafting,
   * the one thing that needs it, goes through `combiner`/`craft` instead,
   * which deletes server-side and reloads). Kept so other features that
   * still call `retirerObjets` don't crash; it won't survive `rafraichir()`.
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

  /** Crafting: the `craft` RPC owns ownership checks, the recipe match and the discovery ledger. */
  const combiner = useCallback(
    async (a: Objet, b: Objet): Promise<ResultatAssemblage> => {
      if (!a.inventaireId || !b.inventaireId || a.inventaireId === b.inventaireId) {
        return { succes: false, message: 'Can’t combine: you need two different cards.' }
      }
      try {
        const { resultatId } = await combinerDistant(a.inventaireId, b.inventaireId)
        const resultat = trouverObjet(resultatId)
        await charger(userId)
        return resultat
          ? { succes: true, message: `You crafted ${resultat.nom}!`, objetResultat: resultat }
          : { succes: true, message: 'Crafted!' }
      } catch (e) {
        const code = codeErreurCraft(e)
        const message =
          code === 'no_recipe'
            ? `Can’t combine: no known recipe for ${a.nom} + ${b.nom}.`
            : code === 'card_not_owned'
              ? 'Can’t combine: you don’t own one of these cards anymore.'
              : code === 'not_authenticated'
                ? 'You need to be signed in to craft.'
                : 'Can’t combine: you need two different cards.'
        return { succes: false, message }
      }
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
      retirerObjets,
      combiner,
      livreRecettes: livre,
      chart,
      terminerOnboarding,
      rafraichir,
    }),
    [chargement, joueur, livre, chart, deconnecter, ajouterObjets, retirerObjets, combiner, terminerOnboarding, rafraichir],
  )
}
