import type { Chart, Matchup } from './types'

/**
 * Placeholder chart. The real categories and matchups are decided by the
 * items team and loaded from the `categories` / `category_matchups` tables.
 * This one keeps the classic rock-paper-scissors cycle and adds two
 * categories so that neutral matchups exist (scissors vs water, and any
 * category against itself).
 */
export const DEFAULT_CHART: Chart = {
  beats: {
    rock: ['scissors', 'fire'],
    paper: ['rock', 'water'],
    scissors: ['paper'],
    fire: ['paper', 'scissors'],
    water: ['fire', 'rock'],
  },
  verbs: {
    rock: 'crushes',
    paper: 'wraps',
    scissors: 'cut',
    fire: 'burns',
    water: 'drowns',
  },
  labels: {
    rock: 'Rock',
    paper: 'Paper',
    scissors: 'Scissors',
    fire: 'Fire',
    water: 'Water',
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
