import { describe, expect, it } from 'vitest'
import {
  DEFAULT_CHART,
  beatenBy,
  botDeck,
  botMove,
  clash,
  computeReward,
  createBattle,
  fallbackMove,
  legalMoves,
  matchup,
  publicView,
  resolveTurn,
  seededRandom,
  type EngineCard,
  type FullState,
} from './index'

const card = (id: string, category: string, attack = 5, defense = 5): EngineCard => ({
  id,
  name: id,
  category,
  attack,
  defense,
})

const deck = (prefix: string, cats: string[], attack = 5, defense = 5) =>
  cats.map((c, i) => card(`${prefix}${i}`, c, attack, defense))

describe('chart', () => {
  it('keeps the rock-paper-scissors cycle', () => {
    expect(matchup(DEFAULT_CHART, 'fight', 'animaux')).toBe('wins')
    expect(matchup(DEFAULT_CHART, 'animaux', 'plantes')).toBe('wins')
    expect(matchup(DEFAULT_CHART, 'plantes', 'ressources')).toBe('wins')
    expect(matchup(DEFAULT_CHART, 'ressources', 'plantes')).toBe('loses')
  })
  it('is neutral for same category, unknown pairs and unknown categories', () => {
    expect(matchup(DEFAULT_CHART, 'ressources', 'ressources')).toBe('neutral')
    expect(matchup(DEFAULT_CHART, 'ressources', 'espace')).toBe('neutral')
    expect(matchup(DEFAULT_CHART, 'plasma', 'ressources')).toBe('neutral')
    expect(beatenBy(DEFAULT_CHART, 'ressources')).toEqual(['plantes'])
  })
})

describe('clash', () => {
  it('lets the chart decide first, whatever the stats', () => {
    const r = clash(DEFAULT_CHART, card('p', 'plantes', 1, 1), card('r', 'ressources', 99, 99))
    expect(r.outcome).toBe('a')
    expect(r.reason).toBe('chart')
    expect(r.text).toBe('p (Plants) overgrows r (Resources).')
  })
  it('lets explicit wins override the chart and the stats', () => {
    const hatchet = { ...card('h1', 'plantes', 1, 1), itemId: 'hatchet', explicitWins: ['shield'] }
    const shield = { ...card('s1', 'ressources', 99, 99), itemId: 'shield' }
    const r = clash(DEFAULT_CHART, hatchet, shield)
    expect(r.outcome).toBe('a')
    expect(r.reason).toBe('explicit')
    expect(r.text).toBe('h1 always gets the better of s1.')
  })
  it('uses breakthrough on neutral matchups', () => {
    expect(clash(DEFAULT_CHART, card('x', 'ressources', 6, 5), card('y', 'ressources', 5, 5)).outcome).toBe('a')
    expect(clash(DEFAULT_CHART, card('x', 'ressources', 5, 5), card('y', 'ressources', 5, 5)).outcome).toBe('draw')
    expect(clash(DEFAULT_CHART, card('x', 'ressources', 9, 1), card('y', 'ressources', 9, 1)).outcome).toBe('draw')
  })
  it('adds momentum to attack', () => {
    expect(clash(DEFAULT_CHART, card('x', 'ressources', 5, 5), card('y', 'ressources', 5, 5), 1, 0).outcome).toBe('a')
  })
})

describe('gauntlet', () => {
  const start = () => createBattle(deck('a', ['plantes', 'animaux', 'ressources', 'vehicules', 'espace']), deck('b', ['ressources', 'plantes', 'animaux', 'espace', 'vehicules']))

  it('requires a send when there is no champion, then hold or retreat once', () => {
    let s = start()
    expect(legalMoves(s, 'a').every((m) => m.type === 'send')).toBe(true)
    s = resolveTurn(DEFAULT_CHART, s, { a: { type: 'send', cardId: 'a0' }, b: { type: 'send', cardId: 'b0' } })
    // plants overgrow resources: a keeps its champion with momentum 1
    expect(s.sides.a.champion?.id).toBe('a0')
    expect(s.sides.a.momentum).toBe(1)
    expect(s.sides.b.champion).toBeNull()
    expect(s.sides.b.eliminated.map((c) => c.id)).toEqual(['b0'])
    expect(legalMoves(s, 'a').map((m) => m.type)).toEqual(['hold', 'retreat', 'retreat', 'retreat', 'retreat'])
    expect(legalMoves(s, 'b').every((m) => m.type === 'send')).toBe(true)
    expect(s.turn).toBe(2)
  })

  it('retreat swaps the champion, hides it back in hand and can be used once', () => {
    let s = start()
    s = resolveTurn(DEFAULT_CHART, s, { a: { type: 'send', cardId: 'a0' }, b: { type: 'send', cardId: 'b0' } })
    s = resolveTurn(DEFAULT_CHART, s, { a: { type: 'retreat', cardId: 'a2' }, b: { type: 'send', cardId: 'b1' } })
    // a2 resources vs b1 plants: a loses, a0 (plants) is back in hand
    expect(s.sides.a.champion).toBeNull()
    expect(s.hands.a.map((c) => c.id)).toContain('a0')
    expect(s.sides.a.retreatUsed).toBe(true)
    expect(s.sides.a.eliminated.map((c) => c.id)).toEqual(['a2'])
    expect(() => resolveTurn(DEFAULT_CHART, s, { a: { type: 'retreat', cardId: 'a0' }, b: { type: 'hold' } })).toThrow()
  })

  it('eliminates both champions on a draw and can end in a battle draw', () => {
    let s = createBattle(deck('a', ['ressources', 'ressources', 'ressources', 'ressources', 'ressources']), deck('b', ['ressources', 'ressources', 'ressources', 'ressources', 'ressources']))
    for (let i = 0; i < 5; i++) {
      s = resolveTurn(DEFAULT_CHART, s, { a: { type: 'send', cardId: `a${i}` }, b: { type: 'send', cardId: `b${i}` } })
      expect(s.sides.a.champion).toBeNull()
      expect(s.sides.b.champion).toBeNull()
    }
    expect(s.status).toBe('finished')
    expect(s.winner).toBe('draw')
    expect(s.turns).toHaveLength(5)
  })

  it('a single champion can sweep the whole enemy deck', () => {
    let s = createBattle(deck('a', ['plantes', 'plantes', 'plantes', 'plantes', 'plantes']), deck('b', ['ressources', 'ressources', 'ressources', 'ressources', 'ressources']))
    s = resolveTurn(DEFAULT_CHART, s, { a: { type: 'send', cardId: 'a0' }, b: { type: 'send', cardId: 'b0' } })
    for (let i = 1; i < 5; i++) {
      s = resolveTurn(DEFAULT_CHART, s, { a: { type: 'hold' }, b: { type: 'send', cardId: `b${i}` } })
    }
    expect(s.status).toBe('finished')
    expect(s.winner).toBe('a')
    expect(s.sides.a.momentum).toBe(5)
    expect(s.sides.a.handCount).toBe(4)
    expect(() => resolveTurn(DEFAULT_CHART, s, { a: { type: 'hold' }, b: { type: 'hold' } })).toThrow()
  })

  it('never mutates its input and hides hands in the public view', () => {
    const s = start()
    const before = JSON.stringify(s)
    resolveTurn(DEFAULT_CHART, s, { a: { type: 'send', cardId: 'a0' }, b: { type: 'send', cardId: 'b0' } })
    expect(JSON.stringify(s)).toBe(before)
    const pub = publicView(s) as Partial<FullState>
    expect(pub.hands).toBeUndefined()
    expect(pub.sides?.a.handCount).toBe(5)
  })

  it('fallback move is hold with a champion, else the first card', () => {
    let s = start()
    expect(fallbackMove(s, 'a')).toEqual({ type: 'send', cardId: 'a0' })
    s = resolveTurn(DEFAULT_CHART, s, { a: { type: 'send', cardId: 'a0' }, b: { type: 'send', cardId: 'b0' } })
    expect(fallbackMove(s, 'a')).toEqual({ type: 'hold' })
  })
})

describe('bot', () => {
  it('counters the visible champion when it can and is deterministic with a seed', () => {
    let s = createBattle(deck('a', ['ressources', 'ressources', 'ressources', 'ressources', 'ressources']), deck('b', ['vehicules', 'plantes', 'animaux', 'espace', 'ressources']))
    s = resolveTurn(DEFAULT_CHART, s, { a: { type: 'send', cardId: 'a0' }, b: { type: 'send', cardId: 'b0' } })
    const m1 = botMove(DEFAULT_CHART, s, 'b', seededRandom(7))
    const m2 = botMove(DEFAULT_CHART, s, 'b', seededRandom(7))
    expect(m1).toEqual(m2)
    expect(m1.type).toBe('send')
    const chosen = s.hands.b.find((c) => c.id === (m1 as { cardId: string }).cardId)!
    expect(['plantes', 'espace']).toContain(chosen.category)
  })

  it('sometimes retreats after a win to pre-empt the likely counter, never twice', () => {
    // b0 (plants) beats a0 (resources); the likely answer is animals, which fight beats.
    let s = createBattle(deck('a', ['ressources', 'animaux', 'plantes', 'plantes', 'plantes']), deck('b', ['plantes', 'fight', 'fight', 'ressources', 'vehicules']))
    s = resolveTurn(DEFAULT_CHART, s, { a: { type: 'send', cardId: 'a0' }, b: { type: 'send', cardId: 'b0' } })
    expect(s.sides.b.champion?.id).toBe('b0')
    const moves = new Set<string>()
    for (let seed = 0; seed < 40; seed++) moves.add(botMove(DEFAULT_CHART, s, 'b', seededRandom(seed)).type)
    expect(moves).toEqual(new Set(['hold', 'retreat']))
    const retreatSeed = [...Array(40).keys()].find((seed) => botMove(DEFAULT_CHART, s, 'b', seededRandom(seed)).type === 'retreat')!
    const retreat = botMove(DEFAULT_CHART, s, 'b', seededRandom(retreatSeed)) as { type: 'retreat'; cardId: string }
    // fight (b1 or b2) beats animals: the predicted counter to plants
    expect(['b1', 'b2']).toContain(retreat.cardId)
    s = resolveTurn(DEFAULT_CHART, s, { a: { type: 'send', cardId: 'a1' }, b: retreat })
    expect(s.sides.b.retreatUsed).toBe(true)
    expect(s.sides.b.champion?.id).toBe(retreat.cardId)
    for (let seed = 0; seed < 20; seed++) expect(botMove(DEFAULT_CHART, s, 'b', seededRandom(seed))).toEqual({ type: 'hold' })
  })

  it('plays a full battle against itself without errors', () => {
    const rng = seededRandom(42)
    const catalog = deck('c', ['ressources', 'plantes', 'fight', 'animaux', 'espace', 'vehicules', 'plantes'], 6, 4)
    let s = createBattle(botDeck(catalog, rng, 'x'), botDeck(catalog, rng, 'y'))
    let guard = 0
    while (s.status === 'active' && guard++ < 20) {
      s = resolveTurn(DEFAULT_CHART, s, { a: botMove(DEFAULT_CHART, s, 'a', rng), b: botMove(DEFAULT_CHART, s, 'b', rng) })
    }
    expect(s.status).toBe('finished')
    expect(s.turns.length).toBeLessThanOrEqual(9)
  })
})

describe('reward', () => {
  const sweep = () => {
    let s = createBattle(deck('a', ['plantes', 'plantes', 'plantes', 'plantes', 'plantes']), deck('b', ['ressources', 'ressources', 'ressources', 'ressources', 'ressources']))
    s = resolveTurn(DEFAULT_CHART, s, { a: { type: 'send', cardId: 'a0' }, b: { type: 'send', cardId: 'b0' } })
    for (let i = 1; i < 5; i++) s = resolveTurn(DEFAULT_CHART, s, { a: { type: 'hold' }, b: { type: 'send', cardId: `b${i}` } })
    return publicView(s)
  }

  it('rewards a clean pvp sweep with gold tier and boosters', () => {
    const r = computeReward(sweep(), 'a', { kind: 'pvp', winStreak: 0, firstWinToday: false })
    // 100 + 5 cards * 15 + streak 20 = 195
    expect(r.result).toBe('win')
    expect(r.points).toBe(195)
    expect(r.tier).toBe('gold')
    expect(r.boosters).toBe(3)
  })

  it('gives the loser consolation points and no booster', () => {
    const r = computeReward(sweep(), 'b', { kind: 'pvp', winStreak: 3, firstWinToday: true })
    expect(r.result).toBe('loss')
    expect(r.points).toBe(20)
    expect(r.boosters).toBe(0)
    expect(r.tier).toBe('bronze')
  })

  it('applies the win streak (capped) and the daily bonus booster', () => {
    const r = computeReward(sweep(), 'a', { kind: 'pvp', winStreak: 9, firstWinToday: true })
    expect(r.points).toBe(195 + Math.round(195 * 0.5))
    expect(r.bonusBooster).toBe(true)
    expect(r.boosters).toBe(Math.floor(r.points / 50) + 1)
  })

  it('halves everything against the bot and ignores streak and daily bonus', () => {
    const r = computeReward(sweep(), 'a', { kind: 'bot', winStreak: 4, firstWinToday: true })
    expect(r.points).toBe(Math.round(195 * 0.5))
    expect(r.bonusBooster).toBe(false)
    expect(r.boosters).toBe(1)
  })
})
