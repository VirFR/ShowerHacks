/**
 * Core types of the PFC game.
 *
 * These interfaces are a shared contract between pages. Battle-specific
 * engine types live in `lib/engine/types.ts`.
 */

import type { BattleState, EngineCard, RewardTier, Side } from '@/lib/engine/types'

/**
 * Item category slug. Categories and the "who beats whom" chart are data
 * (tables `categories` / `category_matchups`), owned by the items team.
 * `CATEGORIES` only lists the placeholder seed used offline.
 */
export type Categorie = string

export const CATEGORIES: Categorie[] = ['rock', 'paper', 'scissors', 'fire', 'water']

export type Rarete = 'commun' | 'rare' | 'epique' | 'legendaire'

/**
 * An item. In a duel the category chart decides first; when two categories
 * are neutral, attack and defense decide (see `lib/engine/clash.ts`).
 */
export interface Objet {
  /** Catalog id (shared by every copy of the item). */
  id: string
  /** Id of this copy in the player's inventory. Absent for catalog entries. */
  inventaireId?: string
  nom: string
  categorie: Categorie
  attaque: number
  defense: number
  imageUrl: string
  /** Emoji fallback used by the items team when the image fails to load. */
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
