/**
 * Core types of the PFC game.
 *
 * These interfaces are a shared contract between pages. Battle-specific
 * engine types live in `lib/engine/types.ts`.
 */

import type { BattleState, EngineCard, RewardTier, Side } from '@/lib/engine/types'

/**
 * Item category slug, by theme. The "who beats whom" chart between
 * categories is data (`categories` / `category_matchups` tables, default in
 * `lib/engine/chart.ts`) owned by the items team; `CATEGORIES` lists the
 * offline seed.
 */
export type Categorie = string

export const CATEGORIES: Categorie[] = ['fight', 'plantes', 'ressources', 'espace', 'brainrot']

export type Rarete = 'commun' | 'peu_commun' | 'rare' | 'epique' | 'legendaire' | 'secret_rare'

/**
 * An item. In a clash the explicit wins decide first, then the category
 * chart, then attack against defense (see `lib/engine/clash.ts`).
 */
export interface Objet {
  /** Catalog id (shared by every copy of the item). */
  id: string
  /** Id of this copy in the player's inventory. Absent for catalog entries. */
  inventaireId?: string
  nom: string
  attaque: number
  defense: number
  categorie: Categorie
  imageUrl: string
  /** Emoji fallback used by the items team when the image fails to load. */
  icone: string
  rarete: Rarete
  /** Short flavor text shown on the card, under the picture. */
  description: string
  /**
   * Explicit wins: ids of items this one always beats, whatever the chart
   * and the stats say (e.g. the hatchet eventually splits the shield).
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
  /** Items owned by the player (one entry per copy). */
  inventaire: Objet[]
  rang: Rang
  avatarUrl?: string
  nbParties: number
  nbVictoires: number
  /** ISO date of the end of the first-login tutorial, null until then. */
  onboardedAt?: string | null
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

/** Result of an attempt to combine two items. */
export interface ResultatAssemblage {
  succes: boolean
  message: string
  objetResultat?: Objet
  /** True the first time the player ever gets this item (its recipe is now revealed). */
  nouvelleDecouverte?: boolean
}

/**
 * A crafting recipe: combining the two ingredients (in either order) yields
 * the item `resultatId`. See `mocks/recettes.ts` and `services/crafting.ts`.
 */
export interface Recette {
  resultatId: string
  ingredients: [string, string]
}

/** Shared gameplay constants. */
export const BOOSTERS_MAX = 8
export const BOOSTER_INTERVALLE_MS = 10 * 60 * 1000 // 10 minutes
export const OBJETS_PAR_BOOSTER = 5

/* ---------- Battle (battle team) ---------- */

export type BattleKind = 'pvp' | 'bot'

/** A public opponent, as listed in the lobby. */
export interface Adversaire {
  id: string
  pseudo: string
  avatarUrl?: string
  score: number
  rang: Rang
  enLigne: boolean
}

export interface Battle {
  id: string
  kind: BattleKind
  /** Which side the signed-in player is on. */
  mySide: Side
  me: Adversaire
  opponent: Adversaire
  status: 'waiting' | 'active' | 'finished'
  state: BattleState
  /** Cards still in my hand (private). */
  hand: EngineCard[]
  /** Reward for me, set once finished. */
  reward?: BattleRewardRow
  updatedAt: string
}

export interface BattleRewardRow {
  result: 'win' | 'draw' | 'loss'
  points: number
  boosters: number
  tier: RewardTier
  breakdown: { label: string; points: number }[]
  bonusBooster: boolean
}

export interface Defi {
  id: string
  from: Adversaire
  to: Adversaire
  status: 'pending' | 'accepted' | 'declined' | 'expired'
  battleId?: string | null
  createdAt: string
}
