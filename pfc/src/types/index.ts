/**
 * Core types of the PFC game.
 *
 * These interfaces are intentionally minimal: they act as a shared contract
 * between pages and will grow over time (crafting, real battles, auth…).
 */

/** Item categories: the three classic families. */
export type Categorie = 'pierre' | 'feuille' | 'ciseaux'

export const CATEGORIES: Categorie[] = ['pierre', 'feuille', 'ciseaux']

export type Rarete = 'commun' | 'peu_commun' | 'rare' | 'epique' | 'legendaire' | 'secret_rare'

/**
 * An item. There are no attack/defense stats: an item wins or loses purely
 * on its category, rock-paper-scissors style (see `lib/combat.ts`).
 */
export interface Objet {
  id: string
  nom: string
  categorie: Categorie
  imageUrl: string
  /** Emoji fallback used when the image fails to load. */
  icone: string
  rarete: Rarete
  description: string
}

export type Rang =
  | 'Bronze'
  | 'Silver'
  | 'Gold'
  | 'Platinum'
  | 'Diamond'
  | 'Master'

export interface Joueur {
  id: string
  pseudo: string
  score: number
  /** Items owned by the player. */
  inventaire: Objet[]
  rang: Rang
  avatarUrl?: string
  nbParties: number
  nbVictoires: number
}

/** One leaderboard row (aggregated player data). */
export interface EntreeClassement {
  position: number
  joueurId: string
  pseudo: string
  score: number
  nbParties: number
  nbVictoires: number
  /** Wins / games played, between 0 and 1. */
  ratio: number
}

export type ResultatCombat = 'victoire' | 'defaite' | 'egalite'

/** A past duel, as shown on an item's detail page. */
export interface HistoriqueCombat {
  id: string
  date: string
  objetId: string
  objetAdverseId: string
  adversairePseudo: string
  resultat: ResultatCombat
}

/** A player's booster stack. */
export interface StackBoosters {
  /** Boosters currently available. */
  actuel: number
  /** Maximum stack size. */
  max: number
  /** ISO date at which the next booster is added. */
  prochainA: string
}

/** Mock result of an attempt to combine two items. */
export interface ResultatAssemblage {
  succes: boolean
  message: string
  objetResultat?: Objet
}

/** Shared gameplay constants. */
export const BOOSTERS_MAX = 8
export const BOOSTER_INTERVALLE_MS = 10 * 60 * 1000 // 10 minutes
export const OBJETS_PAR_BOOSTER = 5
