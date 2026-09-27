import { clash } from './clash'
import type {
  BattleState,
  Chart,
  EngineCard,
  FullState,
  Move,
  Side,
  SidePublic,
  TurnRecord,
} from './types'

export const DECK_SIZE = 5
/** Each turn eliminates at least one card, so a battle never exceeds this. */
export const MAX_TURNS = DECK_SIZE * 2 - 1

export const other = (side: Side): Side => (side === 'a' ? 'b' : 'a')

function emptySide(handCount: number): SidePublic {
  return { champion: null, momentum: 0, retreatUsed: false, handCount, eliminated: [], submitted: false }
}

/** New battle: both hands hidden, no champion on the field yet. */
export function createBattle(deckA: EngineCard[], deckB: EngineCard[]): FullState {
  if (deckA.length !== DECK_SIZE || deckB.length !== DECK_SIZE) {
    throw new Error(`A deck must contain exactly ${DECK_SIZE} cards.`)
  }
  return {
    turn: 1,
    status: 'active',
    winner: null,
    turns: [],
    sides: { a: emptySide(DECK_SIZE), b: emptySide(DECK_SIZE) },
    hands: { a: [...deckA], b: [...deckB] },
  }
}

/** Strips the hidden hands. What both players (and spectators) receive. */
export function publicView(state: FullState): BattleState {
  const { hands: _hands, ...rest } = state
  return structuredClone(rest)
}

/** Moves a side is allowed to submit right now. */
export function legalMoves(state: FullState, side: Side): Move[] {
  if (state.status !== 'active') return []
  const me = state.sides[side]
  const hand = state.hands[side]
  if (!me.champion) return hand.map((c) => ({ type: 'send', cardId: c.id }))
  const moves: Move[] = [{ type: 'hold' }]
  if (!me.retreatUsed) for (const c of hand) moves.push({ type: 'retreat', cardId: c.id })
  return moves
}

export function isLegal(state: FullState, side: Side, move: Move): boolean {
  return legalMoves(state, side).some((m) => sameMove(m, move))
}

function sameMove(x: Move, y: Move): boolean {
  if (x.type !== y.type) return false
  if (x.type === 'hold' || y.type === 'hold') return true
  return x.cardId === y.cardId
}

/** Default move when a player runs out of time. */
export function fallbackMove(state: FullState, side: Side): Move {
  const me = state.sides[side]
  if (me.champion) return { type: 'hold' }
  return { type: 'send', cardId: state.hands[side][0].id }
}

/** Applies a move to one side (card placement only; no clash yet). */
function applyMove(state: FullState, side: Side, move: Move): void {
  const me = state.sides[side]
  const hand = state.hands[side]
  const take = (cardId: string): EngineCard => {
    const i = hand.findIndex((c) => c.id === cardId)
    if (i === -1) throw new Error(`Card ${cardId} is not in hand.`)
    return hand.splice(i, 1)[0]
  }
  switch (move.type) {
    case 'send': {
      if (me.champion) throw new Error('A champion is already on the field.')
      me.champion = take(move.cardId)
      me.momentum = 0
      break
    }
    case 'retreat': {
      if (!me.champion) throw new Error('No champion to retreat.')
      if (me.retreatUsed) throw new Error('Retreat already used.')
      const incoming = take(move.cardId)
      hand.push(me.champion)
      me.champion = incoming
      me.momentum = 0
      me.retreatUsed = true
      break
    }
    case 'hold': {
      if (!me.champion) throw new Error('Nothing to hold: send a card.')
      break
    }
  }
  me.handCount = hand.length
}

/**
 * Resolves one turn once both moves are known. Returns a new state; the
 * input is never mutated.
 */
export function resolveTurn(chart: Chart, input: FullState, moves: Record<Side, Move>): FullState {
  if (input.status !== 'active') throw new Error('Battle is over.')
  for (const side of ['a', 'b'] as const) {
    if (!isLegal(input, side, moves[side])) throw new Error(`Illegal move for side ${side}.`)
  }
  const state = structuredClone(input)
  applyMove(state, 'a', moves.a)
  applyMove(state, 'b', moves.b)

  const champA = state.sides.a.champion!
  const champB = state.sides.b.champion!
  const momentum = { a: state.sides.a.momentum, b: state.sides.b.momentum }
  const result = clash(chart, champA, champB, momentum.a, momentum.b)

  const eliminated: Side[] = []
  const knockOut = (side: Side) => {
    const s = state.sides[side]
    s.eliminated.push(s.champion!)
    s.champion = null
    s.momentum = 0
    eliminated.push(side)
  }
  // clash() never ties, so exactly one side is knocked out per turn.
  const winner = result.outcome
  const loser: Side = winner === 'a' ? 'b' : 'a'
  knockOut(loser)
  state.sides[winner].momentum += 1

  const record: TurnRecord = {
    turn: state.turn,
    moves,
    champions: { a: champA, b: champB },
    momentum,
    clash: result,
    eliminated,
  }
  state.turns.push(record)
  state.sides.a.submitted = false
  state.sides.b.submitted = false

  // Only the loser's champion can be null right after a win, so only it can be "out".
  if (!state.sides[loser].champion && state.hands[loser].length === 0) {
    state.status = 'finished'
    state.winner = winner
  } else {
    state.turn += 1
  }
  return state
}

/** Cards a side still has (hand + champion). */
export function cardsAlive(state: BattleState, side: Side): number {
  return state.sides[side].handCount + (state.sides[side].champion ? 1 : 0)
}

/** Highest momentum a side's champions reached during the battle. */
export function bestStreak(state: BattleState, side: Side): number {
  let best = 0
  for (const t of state.turns) {
    if (t.clash.outcome === side) best = Math.max(best, t.momentum[side] + 1)
  }
  return best
}

/** True when the side won after having been down to a single card. */
export function wasComeback(state: BattleState, side: Side): boolean {
  if (state.winner !== side) return false
  // Reconstruct alive count over time: 5 minus eliminated so far.
  let alive = DECK_SIZE
  for (const t of state.turns) {
    if (t.eliminated.includes(side)) alive -= 1
    if (alive === 1 && t !== state.turns[state.turns.length - 1]) return true
  }
  return false
}
