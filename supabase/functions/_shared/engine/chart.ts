// GENERATED from pfc/src/lib/engine/chart.ts by scripts/sync-engine.mjs. Do not edit.
import type { Chart, Matchup } from './types.ts'

/**
 * Real chart over the six thematic categories of the catalog, owned by the
 * items team. `beats[x]` names the ONE category `x` has its strongest
 * advantage over, forming a single cycle:
 *
 *   Fight → Animals → Plants → Resources → Vehicles → Space → (back to Fight)
 *
 * (weapons hunt animals; animals eat plants; roots overgrow resources; rust
 * and scarcity corrode vehicles; rockets/rovers conquer space; cosmic-scale
 * events eclipse any weapon.)
 *
 * Combat doesn't stop at that one neighbor: `categoryBonus` grades every
 * pairing by how many steps apart the two categories are on this same
 * cycle — see its doc comment for the full table.
 */
export const DEFAULT_CHART: Chart = {
  beats: {
    fight: ['animaux'],
    animaux: ['plantes'],
    plantes: ['ressources'],
    ressources: ['vehicules'],
    vehicules: ['espace'],
    espace: ['fight'],
  },
  verbs: {
    fight: 'hunts',
    animaux: 'devours',
    plantes: 'overgrows',
    ressources: 'corrodes',
    vehicules: 'conquers',
    espace: 'eclipses',
  },
  labels: {
    fight: 'Fight',
    plantes: 'Plants',
    ressources: 'Resources',
    espace: 'Space',
    animaux: 'Animals',
    vehicules: 'Vehicles',
  },
}

/** Every category known to the chart (keys and values). */
export function chartCategories(chart: Chart): string[] {
  const all = new Set<string>(Object.keys(chart.beats))
  for (const list of Object.values(chart.beats)) for (const c of list) all.add(c)
  return [...all]
}

/**
 * Walks `chart.beats` as a single cycle, starting from whichever category
 * sorts first: `cycle[i]` has its strongest advantage over `cycle[i + 1]`.
 * Cached per chart instance since it never changes at runtime.
 */
const cycleCache = new WeakMap<Chart, string[]>()
export function categoryCycle(chart: Chart): string[] {
  const cached = cycleCache.get(chart)
  if (cached) return cached
  const all = chartCategories(chart).sort()
  const cycle: string[] = []
  let cur = all[0]
  for (let i = 0; i < all.length && cur !== undefined && !cycle.includes(cur); i++) {
    cycle.push(cur)
    cur = chart.beats[cur]?.[0]
  }
  cycleCache.set(chart, cycle)
  return cycle
}

/** Forward distance from `a` to `b` around the cycle (0 for the same category). */
export function categoryDistance(chart: Chart, a: string, b: string): number {
  if (a === b) return 0
  const cycle = categoryCycle(chart)
  const ia = cycle.indexOf(a)
  const ib = cycle.indexOf(b)
  if (ia === -1 || ib === -1) return 0
  return (ib - ia + cycle.length) % cycle.length
}

/**
 * Net fighting-point bonus for `a`'s category against `b`'s, graded by how
 * close they sit on the cycle (closest neighbor: strongest; the category
 * directly opposite: neutral, since both sides get the same small edge over
 * it and it cancels out):
 *
 *   1 step away:  +22      4 steps away: -17
 *   2 steps away: +17      5 steps away: -22
 *   3 steps away (opposite): 0
 */
const NET_BY_DISTANCE: Record<number, number> = { 0: 0, 1: 22, 2: 17, 3: 0 }
export function categoryBonus(chart: Chart, a: string, b: string): number {
  const cycle = categoryCycle(chart)
  const n = cycle.length
  const d = categoryDistance(chart, a, b)
  if (d <= Math.floor(n / 2)) return NET_BY_DISTANCE[d] ?? 0
  return -(NET_BY_DISTANCE[n - d] ?? 0)
}

/** How category `a` fares against category `b`, by the sign of its bonus. */
export function matchup(chart: Chart, a: string, b: string): Matchup {
  const bonus = categoryBonus(chart, a, b)
  if (bonus > 0) return 'wins'
  if (bonus < 0) return 'loses'
  return 'neutral'
}

/** Categories with a positive net bonus over the given one. */
export function beatenBy(chart: Chart, category: string): string[] {
  return chartCategories(chart).filter((other) => categoryBonus(chart, other, category) > 0)
}

export function categoryLabel(chart: Chart, category: string): string {
  return chart.labels?.[category] ?? category.charAt(0).toUpperCase() + category.slice(1)
}

export function categoryVerb(chart: Chart, category: string): string {
  return chart.verbs?.[category] ?? 'beats'
}
