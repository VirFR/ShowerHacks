import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { DEFAULT_CHART, type Chart } from '@/lib/engine'
import { signInWithGoogle, signOut } from '@/lib/auth'
import {
  ecrireInventairesExtra,
  ecrireJoueurId,
  ecrireOnboarding,
  ecrireDecouvertes,
  ecrireRetraits,
  ecrireProfils,
  lireInventairesExtra,
  lireJoueurId,
  lireOnboarding,
  lireDecouvertes,
  lireRetraits,
  lireProfils,
  SessionContext,
  type ModifProfil,
  type Session,
} from '@/lib/session'
import { supabase } from '@/lib/supabase'
import { JOUEURS_MOCK, trouverJoueur, trouverObjet } from '@/mocks'
import { chargerDecouvertes, chargerRecettesMock, crafterDistant, messageErreurCraft } from '@/services/crafting'
import {
  ajouterObjetsDistant,
  chargerChart,
  chargerJoueur,
  modifierProfilDistant,
  terminerOnboardingDistant,
  verifierModifProfil,
} from '@/services/profile'
import { estCarteDeBase, type Joueur, type Objet, type ResultatAssemblage } from '@/types'

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

/**
 * Shared pre-check of a combination, before any recipe lookup. One copy may
 * fill both slots (Iron Ore + Iron Ore with a single Iron Ore).
 */
function verifierPaire(a: Objet, b: Objet): ResultatAssemblage | null {
  if (!a.inventaireId || !b.inventaireId) return { succes: false, message: 'Pick two cards.' }
  return null
}

/* ---------- mock mode (no env variables) ---------- */

/**
 * Merges the items won from boosters (or crafted) into a player's starting
 * inventory, minus the starting copies that have since been crafted away.
 */
function avecInventaireExtra(
  joueur: Joueur,
  inventairesExtra: Record<string, Objet[]>,
  retraits: Record<string, string[]>,
  profils: Record<string, ModifProfil>,
): Joueur {
  const extra = inventairesExtra[joueur.id] ?? []
  const retires = new Set(retraits[joueur.id] ?? [])
  const depart = retires.size > 0 ? joueur.inventaire.filter((o) => !retires.has(o.inventaireId ?? '')) : joueur.inventaire
  const profil = profils[joueur.id]
  const identite = profil ? { pseudo: profil.pseudo, avatarUrl: profil.avatarUrl ?? undefined } : {}
  return { ...joueur, ...identite, inventaire: [...depart, ...extra] }
}

function useMockSession(): Session {
  const [joueurId, setJoueurId] = useState<string | null>(() => lireJoueurId())
  const [inventairesExtra, setInventairesExtra] = useState<Record<string, Objet[]>>(() => lireInventairesExtra())
  const [retraits, setRetraits] = useState<Record<string, string[]>>(() => lireRetraits())
  const [decouvertesParJoueur, setDecouvertesParJoueur] = useState<Record<string, string[]>>(() => lireDecouvertes())
  const [profils, setProfils] = useState<Record<string, ModifProfil>>(() => lireProfils())
  const [version, setVersion] = useState(0)

  /** Adds booster/craft items (each copy gets its own id) and unlocks any recipe they complete. */
  const ajouterObjets = useCallback(
    async (objets: Objet[]) => {
      if (!joueurId || objets.length === 0) return
      setInventairesExtra((prev) => {
        const copies = objets.map((o, i) => ({ ...o, inventaireId: `${joueurId}-${Date.now().toString(36)}-${i}-${o.id}` }))
        const suivant = { ...prev, [joueurId]: [...(prev[joueurId] ?? []), ...copies] }
        ecrireInventairesExtra(suivant)
        return suivant
      })
      setDecouvertesParJoueur((prev) => {
        const connues = new Set(prev[joueurId] ?? [])
        objets.forEach((o) => connues.add(o.id))
        const suivant = { ...prev, [joueurId]: [...connues] }
        ecrireDecouvertes(suivant)
        return suivant
      })
    },
    [joueurId],
  )

  /** Removes the given inventory copies (the two ingredients a craft consumes). */
  const retirerCopies = useCallback(
    (copies: string[]) => {
      if (!joueurId || copies.length === 0) return
      const aRetirer = new Set(copies)
      setInventairesExtra((prev) => {
        const suivant = { ...prev, [joueurId]: (prev[joueurId] ?? []).filter((o) => !aRetirer.has(o.inventaireId ?? '')) }
        ecrireInventairesExtra(suivant)
        return suivant
      })
      // Starting copies aren't stored in the extra list: remember them as removed.
      setRetraits((prev) => {
        const suivant = { ...prev, [joueurId]: [...(prev[joueurId] ?? []), ...copies] }
        ecrireRetraits(suivant)
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
    const comptes = JOUEURS_MOCK.map((j) => avecInventaireExtra(j, inventairesExtra, retraits, profils))
    const base = comptes.find((j) => j.id === joueurId)
    const joueur: Joueur | null = base ? { ...base, onboardedAt: lireOnboarding(base.id) } : null
    // Everything ever owned: stored discoveries plus the current inventory (starters included).
    const decouvertes = joueur
      ? [...new Set([...(decouvertesParJoueur[joueur.id] ?? []), ...joueur.inventaire.map((o) => o.id)])]
      : []

    const crafter = async (a: Objet, b: Objet): Promise<ResultatAssemblage> => {
      const invalide = verifierPaire(a, b)
      if (invalide) return invalide
      const { RECETTES, trouverRecette } = await chargerRecettesMock()
      const recette = trouverRecette(RECETTES, a.id, b.id)
      const resultat = recette ? trouverObjet(recette.resultatId) : undefined
      if (!resultat) return { succes: false, message: messageErreurCraft({ message: 'no_recipe' }) }
      // Base cards are infinite: only the other ingredients are consumed.
      retirerCopies([...new Set([a, b].filter((o) => !estCarteDeBase(o)).map((o) => o.inventaireId!))])
      ajouterObjets([resultat])
      return {
        succes: true,
        message: `You crafted ${resultat.nom}!`,
        objetResultat: resultat,
        nouvelleDecouverte: !decouvertes.includes(resultat.id),
      }
    }

    const modifierProfil = async (modif: ModifProfil) => {
      if (!joueur) return
      const invalide = verifierModifProfil(modif)
      if (invalide) throw new Error(invalide)
      const pris = comptes.some((c) => c.id !== joueur.id && c.pseudo.toLowerCase() === modif.pseudo.toLowerCase())
      if (pris) throw new Error('This username is already taken.')
      const suivant = { ...profils, [joueur.id]: modif }
      ecrireProfils(suivant)
      setProfils(suivant)
    }

    return {
      mode: 'mock',
      chargement: false,
      joueur,
      comptes,
      connecter,
      connecterGoogle,
      deconnecter,
      ajouterObjets,
      crafter,
      decouvertes,
      chart: DEFAULT_CHART,
      terminerOnboarding,
      rafraichir,
      modifierProfil,
    }
    // `version` forces a re-read of localStorage after onboarding.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    joueurId,
    version,
    inventairesExtra,
    retraits,
    decouvertesParJoueur,
    profils,
    connecter,
    connecterGoogle,
    deconnecter,
    ajouterObjets,
    retirerCopies,
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
  const [decouvertes, setDecouvertes] = useState<string[]>([])

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
          setDecouvertes(await chargerDecouvertes(id).catch(() => j.inventaire.map((o) => o.id)))
          return
        }
        await new Promise((r) => window.setTimeout(r, 400))
      }
      setJoueur(null)
    } catch (e) {
      console.error('[RPS] profile load failed', e)
      setJoueur(null)
    }
  }, [])

  useEffect(() => {
    const sb = supabase!
    chargerChart().then(setChart).catch((e) => console.error('[RPS] chart load failed', e))
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
    async (objets: Objet[]) => {
      if (!userId || objets.length === 0) return
      try {
        await ajouterObjetsDistant(userId, objets)
      } catch (e) {
        // Typically a card missing from the `items` table (catalog seed 0002 not applied).
        console.error('[RPS] inventory insert failed', e)
        throw e
      }
      await charger(userId)
    },
    [userId, charger],
  )

  /** `craft()` RPC: the server checks ownership and the (secret) recipe, then swaps the cards. */
  const crafter = useCallback(
    async (a: Objet, b: Objet): Promise<ResultatAssemblage> => {
      const invalide = verifierPaire(a, b)
      if (invalide) return invalide
      try {
        const craft = await crafterDistant(a.inventaireId!, b.inventaireId!)
        await charger(userId)
        const resultat = trouverObjet(craft.itemId)
        return {
          succes: true,
          message: `You crafted ${resultat?.nom ?? 'a new card'}!`,
          objetResultat: resultat && { ...resultat, inventaireId: craft.inventaireId },
          nouvelleDecouverte: craft.nouvelleDecouverte,
        }
      } catch (e) {
        return { succes: false, message: messageErreurCraft(e) }
      }
    },
    [charger, userId],
  )

  const modifierProfil = useCallback(
    async (modif: ModifProfil) => {
      if (!userId) return
      const invalide = verifierModifProfil(modif)
      if (invalide) throw new Error(invalide)
      await modifierProfilDistant(userId, modif)
      await charger(userId)
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
      crafter,
      decouvertes,
      chart,
      terminerOnboarding,
      rafraichir,
      modifierProfil,
    }),
    [chargement, joueur, decouvertes, chart, deconnecter, ajouterObjets, crafter, terminerOnboarding, rafraichir, modifierProfil],
  )
}
