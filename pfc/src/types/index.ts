/**
 * Core types of the PFC game.
 *
 * These interfaces are intentionally minimal: they act as a shared contract
 * between pages and will grow over time (crafting, real battles, auth…).
 */

/** Item categories, by theme (not by combat role). */
export type Categorie = 'fight' | 'plantes' | 'ressources' | 'espace' | 'animaux' | 'vehicules'

export const CATEGORIES: Categorie[] = ['fight', 'plantes', 'ressources', 'espace', 'animaux', 'vehicules']

export type Rarete = 'commun' | 'peu_commun' | 'rare' | 'epique' | 'legendaire' | 'secret_rare'

/**
 * An item. Combat is resolved from `attaque`/`defense` plus the circular
 * tournament in `lib/combat.ts` — category is purely organizational.
 */
export interface Objet {
  id: string
  nom: string
  attaque: number
  defense: number
  categorie: Categorie
  imageUrl: string
  /** Emoji fallback used when the image fails to load. */
  icone: string
  rarete: Rarete
  /** Short flavor text shown on the card, under the picture. */
  description: string
  /**
   * Explicit wins: ids of items this one always beats, on top of the
   * circular tournament (see `lib/combat.ts`). Gives an item a one-off
   * logical exception (e.g. the hatchet eventually splits the shield)
   * without breaking the overall balance of win rates.
   */
  victoiresExplicites?: string[]
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
