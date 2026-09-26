import type { Categorie, Objet, ResultatCombat } from '@/types'

/**
 * Ordre de dominance classique pierre-feuille-ciseaux.
 * `DOMINANCE[a]` est la catégorie que `a` bat.
 */
const DOMINANCE: Record<Exclude<Categorie, 'special'>, Exclude<Categorie, 'special'>> = {
  pierre: 'ciseaux',
  ciseaux: 'feuille',
  feuille: 'pierre',
}

function battParCategorie(a: Categorie, b: Categorie): boolean {
  if (a === 'special' || b === 'special') return false
  return DOMINANCE[a] === b
}

/**
 * Résout un combat binaire entre deux objets : victoire, défaite ou égalité
 * (point de vue de `a`).
 *
 * Ordre de résolution :
 * 1. Victoires explicites : chaque objet peut battre certains objets
 *    précis, indépendamment de sa catégorie (voir `Objet.victoiresExplicites`).
 * 2. Règle pierre/feuille/ciseaux entre catégories (la catégorie `special`
 *    n'a pas de dominance fixe, elle passe toujours par les points 1 et 3).
 * 3. Repli sur les statistiques (attaque de l'un contre défense de l'autre).
 */
export function resoudreCombat(a: Objet, b: Objet): ResultatCombat {
  if (a.id === b.id) return 'egalite'

  const aBatB = a.victoiresExplicites?.includes(b.id) ?? false
  const bBatA = b.victoiresExplicites?.includes(a.id) ?? false
  if (aBatB && !bBatA) return 'victoire'
  if (bBatA && !aBatB) return 'defaite'

  if (battParCategorie(a.categorie, b.categorie)) return 'victoire'
  if (battParCategorie(b.categorie, a.categorie)) return 'defaite'

  const scoreA = a.attaque - b.defense
  const scoreB = b.attaque - a.defense
  if (scoreA === scoreB) return 'egalite'
  return scoreA > scoreB ? 'victoire' : 'defaite'
}
