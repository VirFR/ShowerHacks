// GENERATED from pfc/src/lib/engine/types.ts by scripts/sync-engine.mjs. Do not edit.
/**
 * Combat engine types. This folder is pure TypeScript with no imports so the
 * exact same code runs in the browser and in the Supabase edge function.
 */

/** A card as the engine sees it: a snapshot of an inventory item. */
export interface EngineCard {
  /** Unique per copy (inventory row id), never the catalog item id. */
  id: string
  name: string
  category: string
  attack: number
  defense: number
  imageUrl?: string
  rarity?: string
}

/**
 * Who beats whom. `beats[x]` lists the categories `x` beats. A pair that is
 * absent in both directions is neutral, and a category is always neutral
 * against itself. `verbs[x]` is used in explanations ("Rock crushes Scissors").
 */
export interface Chart {
  beats: Record<string, string[]>
  verbs?: Record<string, string>
  labels?: Record<string, string>
}

export type Side = 'a' | 'b'

export type Matchup = 'wins' | 'loses' | 'neutral'

export type ClashOutcome = Side | 'draw'

export interface ClashResult {
  outcome: ClashOutcome
  /** `chart`: the category table decided; `breakthrough`: attack vs defense; `standoff`: draw. */
  reason: 'chart' | 'breakthrough' | 'standoff'
  text: string
}

export type Move =
  | { type: 'send'; cardId: string }
  | { type: 'hold' }
  | { type: 'retreat'; cardId: string }

/** What everyone may see about one side. */
export interface SidePublic {
  champion: EngineCard | null
  /** Consecutive wins of the current champion. Adds to attack in neutral matchups. */
  momentum: number
  retreatUsed: boolean
  handCount: number
  eliminated: EngineCard[]
  /** True while this side's move for the current turn is locked in. */
  submitted: boolean
}

export interface TurnRecord {
  turn: number
  moves: Record<Side, Move>
  champions: Record<Side, EngineCard>
  momentum: Record<Side, number>
  clash: ClashResult
  /** Sides whose champion was eliminated this turn. */
  eliminated: Side[]
}

export type BattleStatus = 'active' | 'finished'

/** Public battle state, safe to broadcast to both players. */
export interface BattleState {
  turn: number
  status: BattleStatus
  sides: Record<Side, SidePublic>
  turns: TurnRecord[]
  /** Set when finished: winning side, or 'draw'. */
  winner: Side | 'draw' | null
}

/** Full state, including hidden hands. Server-side / local only. */
export interface FullState extends BattleState {
  hands: Record<Side, EngineCard[]>
}

export type RewardTier = 'bronze' | 'silver' | 'gold'

export interface RewardContext {
  kind: 'pvp' | 'bot'
  /** Consecutive PvP wins before this battle. */
  winStreak: number
  firstWinToday: boolean
}

export interface RewardLine {
  label: string
  points: number
}

export interface BattleReward {
  result: 'win' | 'draw' | 'loss'
  points: number
  boosters: number
  tier: RewardTier
  breakdown: RewardLine[]
  /** Flat bonus booster from the daily first win. */
  bonusBooster: boolean
}
