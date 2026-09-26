import { beatenBy, matchup } from './chart'
import { legalMoves, other } from './gauntlet'
import type { Chart, EngineCard, FullState, Move, Side } from './types'

/** Small deterministic PRNG (mulberry32) so bot games are reproducible. */
export function seededRandom(seed: number): () => number {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function pick<T>(items: T[], rng: () => number): T {
  return items[Math.floor(rng() * items.length)]
}

/**
 * Practice bot. It only uses public information plus its own hand:
 * - to send a card, it plays a chart counter to the visible enemy champion
 *   when it has one, otherwise the card with the best attack minus the
 *   enemy's defense (random among equals);
 * - when its champion just won, the enemy will probably answer with a
 *   counter: about a third of the time it retreats (once) to a card that
 *   beats that likely counter; otherwise it holds.
 */
export function botMove(chart: Chart, state: FullState, side: Side, rng: () => number = Math.random): Move {
  const legal = legalMoves(state, side)
  if (legal.length === 0) throw new Error('No legal move.')
  const me = state.sides[side]
  const hand = state.hands[side]
  const enemy = state.sides[other(side)].champion

  const counters = (cards: EngineCard[]) =>
    enemy ? cards.filter((c) => matchup(chart, c.category, enemy.category) === 'wins') : []

  if (!me.champion) {
    const c = counters(hand)
    if (c.length) return { type: 'send', cardId: pick(c, rng).id }
    if (!enemy) return { type: 'send', cardId: pick(hand, rng).id }
    const safe = hand.filter((card) => matchup(chart, card.category, enemy.category) !== 'loses')
    const pool = safe.length ? safe : hand
    const score = (card: EngineCard) => card.attack - enemy.defense
    const best = Math.max(...pool.map(score))
    return { type: 'send', cardId: pick(pool.filter((card) => score(card) === best), rng).id }
  }

  if (!enemy && !me.retreatUsed && hand.length > 0 && rng() < 0.35) {
    const champion = me.champion
    const likelyCounters = beatenBy(chart, champion.category)
    const answers = hand.filter((card) =>
      likelyCounters.some((counter) => matchup(chart, card.category, counter) === 'wins'),
    )
    if (answers.length) return { type: 'retreat', cardId: pick(answers, rng).id }
  }
  return { type: 'hold' }
}

/** Builds a bot deck of 5 from a catalog, spreading categories when possible. */
export function botDeck(catalog: EngineCard[], rng: () => number = Math.random, prefix = 'bot'): EngineCard[] {
  if (catalog.length === 0) throw new Error('Empty catalog.')
  const shuffled = [...catalog].sort(() => rng() - 0.5)
  const chosen: EngineCard[] = []
  const seen = new Set<string>()
  for (const card of shuffled) {
    if (chosen.length === 5) break
    if (!seen.has(card.category)) {
      seen.add(card.category)
      chosen.push(card)
    }
  }
  let i = 0
  while (chosen.length < 5) chosen.push(shuffled[i++ % shuffled.length])
  return chosen.map((card, index) => ({ ...card, id: `${prefix}-${index}-${card.id}` }))
}
