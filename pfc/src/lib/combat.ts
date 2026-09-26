import type { Categorie, Objet, ResultatCombat } from '@/types'
import { DEFAULT_CHART, beatenBy, clash, type EngineCard } from '@/lib/engine'

/**
 * Compatibility layer over the battle engine (`lib/engine`) for pages that
 * only need a one-card-vs-one-card answer with the default chart
 * (item detail, tooltips). Real battles use the engine directly with the
 * chart loaded from the database.
 */

/** Each category lists the categories it beats (placeholder chart). */
export const BEATS: Record<Categorie, Categorie[]> = DEFAULT_CHART.beats

export function categorieBat(a: Categorie, b: Categorie): boolean {
  return (BEATS[a] ?? []).includes(b)
}

/** Categories that beat the given one. */
export function perdContre(c: Categorie): Categorie[] {
  return beatenBy(DEFAULT_CHART, c)
}

/** Categories the given one beats. */
export function batCategories(c: Categorie): Categorie[] {
  return BEATS[c] ?? []
}

export function versCarte(objet: Objet): EngineCard {
  return {
    id: objet.inventaireId ?? objet.id,
    name: objet.nom,
    category: objet.categorie,
    attack: objet.attaque,
    defense: objet.defense,
    imageUrl: objet.imageUrl,
    rarity: objet.rarete,
  }
}

/** Resolves a single clash between two items (chart first, then stats). */
export function resoudreCombat(mien: Objet, adverse: Objet): ResultatCombat {
  const r = clash(DEFAULT_CHART, versCarte(mien), versCarte(adverse))
  if (r.outcome === 'a') return 'victoire'
  if (r.outcome === 'b') return 'defaite'
  return 'egalite'
}

/** One-line explanation of the outcome ("Rock (Rock) crushes Scissors (Scissors)."). */
export function expliquerCombat(mien: Objet, adverse: Objet): string {
  return clash(DEFAULT_CHART, versCarte(mien), versCarte(adverse)).text
}
