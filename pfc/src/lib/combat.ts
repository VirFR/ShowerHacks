import type { Categorie, Objet, ResultatCombat } from '@/types'
import { CATEGORIES } from '@/types'

/**
 * Rock-paper-scissors rules. Each category lists the categories it beats.
 * Rock beats scissors, scissors beat paper, paper beats rock.
 * Special items beat every classic category and tie with each other.
 */
export const BEATS: Record<Categorie, Categorie[]> = {
  pierre: ['ciseaux'],
  feuille: ['pierre'],
  ciseaux: ['feuille'],
  special: ['pierre', 'feuille', 'ciseaux'],
}

export function categorieBat(a: Categorie, b: Categorie): boolean {
  return BEATS[a].includes(b)
}

/** Categories that beat the given one. */
export function perdContre(c: Categorie): Categorie[] {
  return CATEGORIES.filter((autre) => BEATS[autre].includes(c))
}

/** Resolves a duel between two items from their categories alone. */
export function resoudreCombat(mien: Objet, adverse: Objet): ResultatCombat {
  if (categorieBat(mien.categorie, adverse.categorie)) return 'victoire'
  if (categorieBat(adverse.categorie, mien.categorie)) return 'defaite'
  return 'egalite'
}
