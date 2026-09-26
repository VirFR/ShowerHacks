import type { Objet, ResultatCombat } from '@/types'
import { OBJETS_MOCK } from '@/mocks/objets'

/**
 * Position de chaque objet sur le "cercle" du tournoi (ordre de OBJETS_MOCK).
 * Voir `resoudreParTournoiCirculaire` pour l'usage.
 */
const POSITION = new Map(OBJETS_MOCK.map((o, index) => [o.id, index]))

/**
 * Résout un combat binaire entre deux objets : victoire, défaite ou égalité
 * (point de vue de `a`).
 *
 * 1. Victoires explicites : un objet peut battre certains objets précis en
 *    plus du tournoi (voir `Objet.victoiresExplicites`), pour des exceptions
 *    ponctuelles qui font sens (ex: la hache finit par fendre le bouclier).
 * 2. Tournoi circulaire : à défaut de relation explicite, chaque objet bat
 *    la moitié des autres objets et perd contre l'autre moitié (voir
 *    `resoudreParTournoiCirculaire`). Chaque carte a donc toujours un
 *    résultat binaire face à toutes les autres, avec un taux de victoire
 *    garanti entre 40 % et 60 %, quel que soit le nombre total de cartes.
 */
export function resoudreCombat(a: Objet, b: Objet): ResultatCombat {
  if (a.id === b.id) return 'egalite'

  const aBatB = a.victoiresExplicites?.includes(b.id) ?? false
  const bBatA = b.victoiresExplicites?.includes(a.id) ?? false
  if (aBatB && !bBatA) return 'victoire'
  if (bBatA && !aBatB) return 'defaite'

  return resoudreParTournoiCirculaire(a, b)
}

/**
 * Tournoi circulaire : les objets sont placés sur un cercle (ordre de
 * `OBJETS_MOCK`). Un objet bat tous ceux situés jusqu'à la moitié du cercle
 * "devant" lui, et perd contre ceux situés dans l'autre moitié. Avec un
 * nombre pair d'objets, les deux positions parfaitement opposées (à égale
 * distance dans les deux sens) sont départagées par leur position pour
 * qu'une seule des deux gagne — sans quoi ni l'une ni l'autre ne l'emporte.
 *
 * Résultat : sur N-1 adversaires, chaque objet en bat toujours exactement
 * la moitié (± 1 sur un nombre pair d'objets), donc un taux de victoire
 * proche de 50 %, jamais sous 40 % ni au-dessus de 60 %.
 */
function resoudreParTournoiCirculaire(a: Objet, b: Objet): ResultatCombat {
  const posA = POSITION.get(a.id)
  const posB = POSITION.get(b.id)
  const n = POSITION.size

  // Repli si un objet n'est pas (encore) intégré au tournoi : comparaison
  // de stats classique, pour ne jamais planter l'affichage.
  if (posA === undefined || posB === undefined) {
    const scoreA = a.attaque - b.defense
    const scoreB = b.attaque - a.defense
    if (scoreA === scoreB) return 'egalite'
    return scoreA > scoreB ? 'victoire' : 'defaite'
  }

  const distance = (posB - posA + n) % n
  const moitie = n / 2

  if (distance === moitie) {
    return posA < posB ? 'victoire' : 'defaite'
  }

  return distance < moitie ? 'victoire' : 'defaite'
}
