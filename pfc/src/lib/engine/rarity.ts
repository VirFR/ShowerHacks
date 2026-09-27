/**
 * Fighting points by rarity: the primary signal in `clash`, alongside the
 * category bonus. Unknown/missing rarity (a card created without one) is
 * treated as the bottom tier.
 */
export const RARITY_POINTS: Record<string, number> = {
  commun: 10,
  peu_commun: 20,
  rare: 30,
  epique: 40,
  legendaire: 50,
  secret_rare: 60,
}

/** Sort order of rarities, lowest first — used only as a late tiebreak. */
export const RARITY_RANK: Record<string, number> = {
  commun: 0,
  peu_commun: 1,
  rare: 2,
  epique: 3,
  legendaire: 4,
  secret_rare: 5,
}

/** Slugs stored in the `items` table, mapped to the engine's slugs. */
const DB_RARITY: Record<string, string> = {
  common: 'commun',
  uncommon: 'peu_commun',
  epic: 'epique',
  legendary: 'legendaire',
}

/**
 * Engine rarity slug for any rarity the app may carry (engine slug or the
 * database's English slug). Unknown/missing rarity becomes `commun`.
 */
export function normalizeRarity(rarity: string | undefined): string {
  const slug = DB_RARITY[rarity ?? ''] ?? rarity ?? ''
  return slug in RARITY_RANK ? slug : 'commun'
}

export function rarityPoints(rarity: string | undefined): number {
  return RARITY_POINTS[normalizeRarity(rarity)]
}

export function rarityRank(rarity: string | undefined): number {
  return RARITY_RANK[normalizeRarity(rarity)]
}
