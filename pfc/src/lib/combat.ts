import type { Categorie, Objet, ResultatCombat } from '@/types'
import { CATEGORIES } from '@/types'

/**
 * Rock-paper-scissors rules. Each category lists the categories it beats.
 * Rock beats scissors, scissors beat paper, paper beats rock.
 * There are no attack/defense stats: the category alone decides.
 */
export const BEATS: Record<Categorie, Categorie[]> = {
  pierre: ['ciseaux'],
  feuille: ['pierre'],
  ciseaux: ['feuille'],
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

/** One-line explanation of the outcome ("Rock crushes Scissors."). */
export function expliquerCombat(mien: Objet, adverse: Objet): string {
  const resultat = resoudreCombat(mien, adverse)
  if (resultat === 'egalite') return `${mien.nom} vs ${adverse.nom}: nobody wins.`
  const [gagnant, perdant] = resultat === 'victoire' ? [mien, adverse] : [adverse, mien]
  const verbe: Record<Categorie, string> = { pierre: 'crushes', feuille: 'wraps', ciseaux: 'cut' }
  return `${gagnant.nom} ${verbe[gagnant.categorie]} ${perdant.nom}.`
}
