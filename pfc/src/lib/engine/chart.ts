import type { Chart, Matchup } from './types'

/**
 * Real chart over the six thematic categories of the catalog, owned by the
 * items team. Each category has the advantage over exactly one other,
 * forming a single cycle (every other pairing, including same-category, is
 * neutral and falls to stats):
 *
 *   Fight → Animals → Plants → Resources → Vehicles → Space → (back to Fight)
 *
 * (weapons hunt animals; animals eat plants; roots overgrow resources; rust
 * and scarcity corrode vehicles; rockets/rovers conquer space; cosmic-scale
 * events eclipse any weapon.)
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

export function categoryBeats(chart: Chart, a: string, b: string): boolean {
  return (chart.beats[a] ?? []).includes(b)
}

/** How category `a` fares against category `b`. */
export function matchup(chart: Chart, a: string, b: string): Matchup {
  if (a === b) return 'neutral'
  if (categoryBeats(chart, a, b)) return 'wins'
  if (categoryBeats(chart, b, a)) return 'loses'
  return 'neutral'
}

/** Categories that beat the given one. */
export function beatenBy(chart: Chart, category: string): string[] {
  return Object.keys(chart.beats).filter((other) => categoryBeats(chart, other, category))
}

export function categoryLabel(chart: Chart, category: string): string {
  return chart.labels?.[category] ?? category.charAt(0).toUpperCase() + category.slice(1)
}

export function categoryVerb(chart: Chart, category: string): string {
  return chart.verbs?.[category] ?? 'beats'
}

/** Every category known to the chart (keys and values). */
export function chartCategories(chart: Chart): string[] {
  const all = new Set<string>(Object.keys(chart.beats))
  for (const list of Object.values(chart.beats)) for (const c of list) all.add(c)
  return [...all]
}
