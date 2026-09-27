import { botMove } from './bot'
import { matchup } from './chart'
import { other } from './gauntlet'
import type { Chart, EngineCard, FullState, Move, Side } from './types'

/**
 * "La Mouche" boss AI. A weighted memory of the categories the opponent has
 * opened with, across every past fight (persisted by the caller — this
 * module stays pure, no storage). Recent play counts more than old play: a
 * synaptic-weight update, decayed on every reinforcement.
 */
export type MoucheModel = Record<string, number>

const DECAY = 0.85
const REINFORCE = 1
const PRUNE_BELOW = 0.01

export function createMoucheModel(): MoucheModel {
  return {}
}

/** Reinforces `category` and decays every other entry. Returns a new model. */
export function updateMoucheModel(model: MoucheModel, category: string): MoucheModel {
  const next: MoucheModel = {}
  for (const [cat, weight] of Object.entries(model)) {
    const decayed = weight * DECAY
    if (decayed > PRUNE_BELOW) next[cat] = decayed
  }
  next[category] = (next[category] ?? 0) + REINFORCE
  return next
}

function pick<T>(items: T[], rng: () => number): T {
  return items[Math.floor(rng() * items.length)]
}

/**
 * The boss's move. As soon as either side has a visible champion, this is
 * exactly `botMove`: the practice bot's counter and retreat logic is already
 * sound and needs no memory to react to what it can see. The only gap it
 * papers over with a coin flip is the blind opening — nobody has a champion
 * yet — and that is precisely where memory pays off: among the cards that
 * are not a bad answer to anything the opponent plays often, it leans
 * toward the one that would counter their single most common category.
 */
export function moucheMove(chart: Chart, state: FullState, side: Side, model: MoucheModel, rng: () => number = Math.random): Move {
  const me = state.sides[side].champion
  const enemy = state.sides[other(side)].champion
  if (me || enemy) return botMove(chart, state, side, rng)

  const hand = state.hands[side]
  const total = Object.values(model).reduce((sum, w) => sum + w, 0)
  if (hand.length === 0) throw new Error('No legal move.')
  if (total <= 0) return { type: 'send', cardId: pick(hand, rng).id }

  const expected = (card: EngineCard) =>
    Object.entries(model).reduce((sum, [cat, weight]) => {
      const m = matchup(chart, card.category, cat)
      const value = m === 'wins' ? 1 : m === 'loses' ? -1 : 0
      return sum + (weight / total) * value
    }, 0)

  const best = Math.max(...hand.map(expected))
  const bestCards = hand.filter((c) => expected(c) === best)
  return { type: 'send', cardId: pick(bestCards, rng).id }
}
