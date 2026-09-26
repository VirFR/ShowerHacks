import type { Categorie, Objet, Rarete, ResultatCombat } from '@/types'
import { OBJETS_MOCK } from '@/mocks/objets'
import { OBJETS_BOOSTER_MOCK } from '@/mocks/objetsBooster'

/**
 * Position of each item on the combat "circle" (starter items first, then
 * every booster item, in catalog order). Only used as a tiebreaker now —
 * see `resoudreParTournoiCirculaire`.
 */
const POSITION = new Map(
  [...OBJETS_MOCK, ...OBJETS_BOOSTER_MOCK].map((o, index) => [o.id, index]),
)

/**
 * Rock-paper-scissors style cycle between categories: each category has the
 * advantage over exactly one other. Neither side of a pair outside this list
 * (including two items of the same category) has an edge — those matchups
 * are "neutral" and fall straight to the tournament tiebreaker.
 *
 *   Fight → Animals → Plants → Resources → Vehicles → Space → (back to Fight)
 *
 * (weapons hunt animals; animals eat plants; roots crack resources; rust and
 * scarcity ground vehicles; rockets/rovers reach space; cosmic-scale events
 * outlast any weapon.)
 */
const AVANTAGE_CATEGORIE: Record<Categorie, Categorie> = {
  fight: 'animaux',
  animaux: 'plantes',
  plantes: 'ressources',
  ressources: 'vehicules',
  vehicules: 'espace',
  espace: 'fight',
}

/**
 * Fighting points awarded by rarity alone. The gap between tiers (1 point)
 * is deliberately larger than the category-advantage bonus below, so
 * advantage can flip a close fight but never lets a common overpower a
 * legendary or secret rare.
 */
const POINTS_RARETE: Record<Rarete, number> = {
  commun: 1,
  peu_commun: 2,
  rare: 3,
  epique: 4,
  legendaire: 5,
  secret_rare: 6,
}

/**
 * Bonus fighting points for having the category advantage. Kept below the
 * 1-point gap between adjacent rarities: a common (1pt) with the advantage
 * (+2 = 3pts) still loses to a legendary (5pts), but can flip a fight
 * against an equal or one-tier-higher opponent.
 */
const BONUS_AVANTAGE = 2

/**
 * Resolves a binary duel between two items: victory, defeat or draw (from
 * `a`'s point of view).
 *
 * 1. Explicit wins: an item can always beat certain specific items on top
 *    of everything else (see `Objet.victoiresExplicites`), for one-off
 *    exceptions that make sense (e.g. the hatchet eventually splits the
 *    shield).
 * 2. Category advantage + rarity points: if one item's category has the
 *    advantage over the other's (see `AVANTAGE_CATEGORIE`), each side's
 *    rarity is converted to fighting points (see `POINTS_RARETE`), the
 *    advantaged side gets `BONUS_AVANTAGE` extra points, and the higher
 *    total wins. Same category, or a category pair with no advantage
 *    either way, skips straight to step 4.
 * 3. Rarity tiebreak: if step 2 ends in an exact points tie, whichever item
 *    has the rarer tier wins outright (e.g. a common with the advantage
 *    tying a rare's points still loses to it — the rare is simply rarer).
 * 4. Circular tournament tiebreaker: used whenever step 2 doesn't apply
 *    (neutral category matchup) or steps 2 and 3 both end in an exact tie
 *    (same rarity, no advantage either way). Every item sits on a fixed
 *    circle and beats half of all others, so this always resolves cleanly
 *    with an even ~50/50 split.
 */
export function resoudreCombat(a: Objet, b: Objet): ResultatCombat {
  if (a.id === b.id) return 'egalite'

  const aBatB = a.victoiresExplicites?.includes(b.id) ?? false
  const bBatA = b.victoiresExplicites?.includes(a.id) ?? false
  if (aBatB && !bBatA) return 'victoire'
  if (bBatA && !aBatB) return 'defaite'

  const aAvantage = AVANTAGE_CATEGORIE[a.categorie] === b.categorie
  const bAvantage = AVANTAGE_CATEGORIE[b.categorie] === a.categorie

  if (aAvantage || bAvantage) {
    const scoreA = POINTS_RARETE[a.rarete] + (aAvantage ? BONUS_AVANTAGE : 0)
    const scoreB = POINTS_RARETE[b.rarete] + (bAvantage ? BONUS_AVANTAGE : 0)
    if (scoreA > scoreB) return 'victoire'
    if (scoreB > scoreA) return 'defaite'

    // Exact tie on fighting points: the rarer item wins outright.
    if (POINTS_RARETE[a.rarete] > POINTS_RARETE[b.rarete]) return 'victoire'
    if (POINTS_RARETE[b.rarete] > POINTS_RARETE[a.rarete]) return 'defaite'
    // Still tied (same rarity too): fall through to the tournament tiebreaker.
  }

  return resoudreParTournoiCirculaire(a, b)
}

/**
 * Circular tournament: items sit on a circle (catalog order). An item beats
 * every item up to halfway around the circle "ahead" of it, and loses to
 * the other half. With an even number of items, the two positions exactly
 * opposite each other (equal distance both ways) are broken by position so
 * exactly one of them wins — otherwise neither would.
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
  if (AVANTAGE_CATEGORIE[gagnant.categorie] === perdant.categorie) {
    return `${gagnant.nom} has the type advantage and overpowers ${perdant.nom}.`
  }
  return `${gagnant.nom} edges out ${perdant.nom}.`
}
