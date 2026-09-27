import { categoryBonus, categoryLabel } from './chart'
import { rarityPoints, rarityRank } from './rarity'
import type { Chart, ClashResult, EngineCard } from './types'

/**
 * One card against another. Fully deterministic, never a draw:
 * 1. explicit wins (an item that always beats another, from the catalog);
 * 2. fighting points: rarity points + the category bonus (plus momentum,
 *    from consecutive wins in a Gauntlet battle) — most clashes end here;
 * 3. attack + defense, then attack alone, then rarity, as tiebreaks;
 * 4. a last-resort, order-based tiebreak that can never itself tie, so two
 *    truly identical cards still produce a winner.
 */
export function clash(
  chart: Chart,
  a: EngineCard,
  b: EngineCard,
  momentumA = 0,
  momentumB = 0,
): ClashResult {
  const aExplicit = alwaysBeats(a, b)
  const bExplicit = alwaysBeats(b, a)
  if (aExplicit && !bExplicit) return { outcome: 'a', reason: 'explicit', text: explicitText(a, b) }
  if (bExplicit && !aExplicit) return { outcome: 'b', reason: 'explicit', text: explicitText(b, a) }

  const ptsA = fightingPoints(chart, a, b) + momentumA
  const ptsB = fightingPoints(chart, b, a) + momentumB
  if (ptsA !== ptsB) return pointsResult(chart, a, b, ptsA, ptsB)

  const sumA = a.attack + a.defense
  const sumB = b.attack + b.defense
  if (sumA !== sumB) return statResult('statsum', a, b, sumA, sumB, 'combined stats')

  if (a.attack !== b.attack) return statResult('attack', a, b, a.attack, b.attack, 'attack')

  const rarityA = rarityRank(a.rarity)
  const rarityB = rarityRank(b.rarity)
  if (rarityA !== rarityB) return statResult('rarity', a, b, rarityA, rarityB, 'rarity')

  return a.id < b.id
    ? { outcome: 'a', reason: 'tiebreak', text: tiebreakText(a, b) }
    : { outcome: 'b', reason: 'tiebreak', text: tiebreakText(b, a) }
}

function fightingPoints(chart: Chart, card: EngineCard, opponent: EngineCard): number {
  return rarityPoints(card.rarity) + categoryBonus(chart, card.category, opponent.category)
}

function alwaysBeats(winner: EngineCard, loser: EngineCard): boolean {
  const target = loser.itemId ?? loser.id
  return (winner.explicitWins ?? []).includes(target)
}

function withCategory(chart: Chart, card: EngineCard): string {
  return `${card.name} (${categoryLabel(chart, card.category)})`
}

function explicitText(winner: EngineCard, loser: EngineCard): string {
  return `${winner.name} always gets the better of ${loser.name}.`
}

function pointsResult(chart: Chart, a: EngineCard, b: EngineCard, ptsA: number, ptsB: number): ClashResult {
  const [winner, loser] = ptsA > ptsB ? [a, b] : [b, a]
  const outcome = ptsA > ptsB ? 'a' : 'b'
  return {
    outcome,
    reason: 'points',
    text: `${withCategory(chart, winner)} outfights ${withCategory(chart, loser)} on fighting points.`,
  }
}

function statResult(
  reason: 'statsum' | 'attack' | 'rarity',
  a: EngineCard,
  b: EngineCard,
  valueA: number,
  valueB: number,
  label: string,
): ClashResult {
  const [winner, loser] = valueA > valueB ? [a, b] : [b, a]
  const outcome = valueA > valueB ? 'a' : 'b'
  return { outcome, reason, text: `${winner.name} edges out ${loser.name} on ${label}.` }
}

function tiebreakText(winner: EngineCard, loser: EngineCard): string {
  return `${winner.name} and ${loser.name} are dead even — ${winner.name} gets there first.`
}
