import { describe, expect, it } from 'vitest'
import { THROWS, createTutorial, judge, playRound, type Throw } from './tutorial'

describe('tutorial', () => {
  it('always ends 2-1 for the player whatever they throw', () => {
    for (let seed = 0; seed < 27; seed++) {
      let s = createTutorial()
      let guard = 0
      while (!s.finished && guard++ < 10) {
        const t: Throw = THROWS[(seed + guard * 7) % 3]
        s = playRound(s, t)
      }
      expect(s.finished).toBe(true)
      expect(s.score).toEqual({ player: 2, coach: 1 })
      const decisive = s.rounds.filter((r) => r.result !== 'draw').map((r) => r.result)
      expect(decisive).toEqual(['player', 'coach', 'player'])
      expect(s.rounds.every((r) => r.result === 'draw' || r.result === judge(r.player, r.coach))).toBe(true)
      expect(s.rounds.some((r) => r.result === 'draw')).toBe(false)
    }
  })

  it('ignores throws once finished', () => {
    let s = createTutorial()
    s = playRound(s, 'rock')
    s = playRound(s, 'rock')
    s = playRound(s, 'rock')
    expect(s.finished).toBe(true)
    expect(playRound(s, 'paper')).toBe(s)
  })
})
