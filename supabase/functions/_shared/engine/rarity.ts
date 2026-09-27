// GENERATED from pfc/src/lib/engine/rarity.ts by scripts/sync-engine.mjs. Do not edit.
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

export function rarityPoints(rarity: string | undefined): number {
  return RARITY_POINTS[rarity ?? ''] ?? 0
}

export function rarityRank(rarity: string | undefined): number {
  return RARITY_RANK[rarity ?? ''] ?? 0
}
