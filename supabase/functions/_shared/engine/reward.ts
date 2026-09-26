// GENERATED from pfc/src/lib/engine/reward.ts by scripts/sync-engine.mjs. Do not edit.
import { bestStreak, cardsAlive, wasComeback } from './gauntlet.ts'
import type { BattleReward, BattleState, RewardContext, RewardLine, RewardTier, Side } from './types.ts'

export const POINTS = {
  win: 100,
  draw: 50,
  loss: 20,
  perCardAlive: 15,
  comeback: 30,
  streak3: 20,
  streakStepPct: 10,
  streakCapPct: 50,
  pointsPerBooster: 50,
  botMultiplier: 0.5,
} as const

export function tierFor(points: number): RewardTier {
  if (points >= 150) return 'gold'
  if (points >= 100) return 'silver'
  return 'bronze'
}

/**
 * Points, boosters and rarity tier earned by one side. Cards never change
 * hands: this is the only thing a battle produces.
 */
export function computeReward(state: BattleState, side: Side, ctx: RewardContext): BattleReward {
  if (state.status !== 'finished') throw new Error('Battle is not finished.')
  const result = state.winner === 'draw' ? 'draw' : state.winner === side ? 'win' : 'loss'
  const lines: RewardLine[] = []

  lines.push({ label: result === 'win' ? 'Victory' : result === 'draw' ? 'Draw' : 'Defeat', points: POINTS[result] })

  const alive = cardsAlive(state, side)
  if (alive > 0) lines.push({ label: `${alive} card${alive > 1 ? 's' : ''} still standing`, points: alive * POINTS.perCardAlive })
  if (wasComeback(state, side)) lines.push({ label: 'Comeback from your last card', points: POINTS.comeback })
  if (bestStreak(state, side) >= 3) lines.push({ label: 'Momentum streak of 3+', points: POINTS.streak3 })

  let points = lines.reduce((sum, l) => sum + l.points, 0)

  if (ctx.kind === 'pvp' && result === 'win' && ctx.winStreak > 0) {
    const pct = Math.min(ctx.winStreak * POINTS.streakStepPct, POINTS.streakCapPct)
    const bonus = Math.round((points * pct) / 100)
    lines.push({ label: `Win streak x${ctx.winStreak + 1} (+${pct}%)`, points: bonus })
    points += bonus
  }

  if (ctx.kind === 'bot') {
    const cut = Math.round(points * POINTS.botMultiplier) - points
    lines.push({ label: 'Practice battle (half points)', points: cut })
    points += cut
  }

  const bonusBooster = ctx.kind === 'pvp' && result === 'win' && ctx.firstWinToday
  const boosters = Math.floor(points / POINTS.pointsPerBooster) + (bonusBooster ? 1 : 0)

  return { result, points, boosters, tier: tierFor(points), breakdown: lines, bonusBooster }
}
