import type { Objet, ResultatCombat } from '@/types'
import { OBJETS_MOCK } from '@/mocks/objets'
import { OBJETS_BOOSTER_MOCK } from '@/mocks/objetsBooster'

/**
 * Position of each item on the combat "circle" (starter items first, then
 * every booster item, in catalog order). See `resoudreParTournoiCirculaire`.
 */
const POSITION = new Map(
  [...OBJETS_MOCK, ...OBJETS_BOOSTER_MOCK].map((o, index) => [o.id, index]),
)

/**
 * Resolves a binary duel between two items: victory, defeat or draw (from
 * `a`'s point of view).
 *
 * 1. Explicit wins: an item can always beat certain specific items on top
 *    of the tournament (see `Objet.victoiresExplicites`), for one-off
 *    exceptions that make sense (e.g. the hatchet eventually splits the
 *    shield).
 * 2. Circular tournament: absent an explicit relation, every item beats
 *    half of all other items and loses to the other half (see
 *    `resoudreParTournoiCirculaire`). Every card therefore always has a
 *    binary result against every other one, with a win rate guaranteed to
 *    stay between 40% and 60% no matter how many cards exist.
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
 * Circular tournament: items sit on a circle (catalog order). An item beats
 * every item up to halfway around the circle "ahead" of it, and loses to
 * the other half. With an even number of items, the two positions exactly
 * opposite each other (equal distance both ways) are broken by position so
 * exactly one of them wins — otherwise neither would.
 *
 * Result: out of N-1 opponents, every item always beats exactly half of
 * them (± 1 on an even item count), so a win rate close to 50%, never under
 * 40% nor above 60%.
 */
function resoudreParTournoiCirculaire(a: Objet, b: Objet): ResultatCombat {
  const posA = POSITION.get(a.id)
  const posB = POSITION.get(b.id)
  const n = POSITION.size

  // Fallback if an item isn't (yet) part of the tournament: plain stat
  // comparison, so the UI never crashes.
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

/** One-line explanation of the outcome, for the battle screen and item detail page. */
export function expliquerCombat(mien: Objet, adverse: Objet): string {
  if (mien.id === adverse.id) return `${mien.nom} vs ${adverse.nom}: it's a mirror match.`
  const resultat = resoudreCombat(mien, adverse)
  const [gagnant, perdant] = resultat === 'victoire' ? [mien, adverse] : [adverse, mien]
  if (gagnant.victoiresExplicites?.includes(perdant.id)) {
    return `${gagnant.nom} always gets the better of ${perdant.nom}.`
  }
  return `${gagnant.nom} edges out ${perdant.nom}.`
}
