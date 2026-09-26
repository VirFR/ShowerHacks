import { categoryLabel, categoryVerb, matchup } from './chart'
import type { Chart, ClashResult, EngineCard, Side } from './types'

/**
 * One card against another. No hit points:
 * 1. explicit wins (an item that always beats another, from the catalog);
 * 2. the category chart decides when it has an opinion;
 * 3. otherwise "breakthrough": a card breaks through when its attack
 *    (plus momentum) is strictly higher than the other card's defense.
 *    Exactly one breakthrough wins; both or none is a draw.
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

  const m = matchup(chart, a.category, b.category)
  if (m === 'wins') return { outcome: 'a', reason: 'chart', text: chartText(chart, a, b) }
  if (m === 'loses') return { outcome: 'b', reason: 'chart', text: chartText(chart, b, a) }

  const aBreaks = a.attack + momentumA > b.defense
  const bBreaks = b.attack + momentumB > a.defense
  if (aBreaks && !bBreaks) return { outcome: 'a', reason: 'breakthrough', text: breakText(chart, a, b) }
  if (bBreaks && !aBreaks) return { outcome: 'b', reason: 'breakthrough', text: breakText(chart, b, a) }
  return {
    outcome: 'draw',
    reason: 'standoff',
    text:
      aBreaks && bBreaks
        ? `${a.name} and ${b.name} take each other down.`
        : `${a.name} and ${b.name} stand off: neither gets through.`,
  }
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

function chartText(chart: Chart, winner: EngineCard, loser: EngineCard): string {
  return `${withCategory(chart, winner)} ${categoryVerb(chart, winner.category)} ${withCategory(chart, loser)}.`
}

function breakText(chart: Chart, winner: EngineCard, loser: EngineCard): string {
  return `${withCategory(chart, winner)} breaks through ${withCategory(chart, loser)}.`
}

/** Side that lost the clash, if any. */
export function loserOf(outcome: ClashResult['outcome']): Side | null {
  if (outcome === 'a') return 'b'
  if (outcome === 'b') return 'a'
  return null
}
