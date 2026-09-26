import type { Recette } from '@/types'

/**
 * Little-Alchemy-style crafting recipes: combine the two ingredients to get
 * the result, consuming both (see `lib/assemblage.ts`). Every pair of
 * ingredients is unique across this list, so a combination never has more
 * than one possible result.
 *
 * Tier 1 recipes start from the three starter items (obj-01, obj-04, obj-07)
 * and the `ressources` category, which is the game's raw-material pool.
 * Tier 2 recipes chain a tier-1 result back in as an ingredient, the way
 * Little Alchemy trees work. Not every item is craftable on purpose: the
 * rarest `espace`/`brainrot` cards stay booster-exclusive chase cards.
 */
export const RECETTES: Recette[] = [
  // Tier 1: starters + raw resources -> basic tools
  { resultatId: 'obj-13', ingredients: ['obj-42', 'obj-41'] }, // Wood Log + Iron Ore -> Hatchet
  { resultatId: 'obj-14', ingredients: ['obj-41', 'obj-25'] }, // Iron Ore + Brick -> Shield
  { resultatId: 'obj-15', ingredients: ['obj-04', 'obj-07'] }, // Oak Leaf + Rusty Scissors -> Net
  { resultatId: 'obj-16', ingredients: ['obj-42', 'obj-43'] }, // Wood Log + Coal -> Torch
  { resultatId: 'obj-17', ingredients: ['obj-01', 'obj-41'] }, // Mossy Rock + Iron Ore -> Hammer
  { resultatId: 'obj-18', ingredients: ['obj-04', 'obj-42'] }, // Oak Leaf + Wood Log -> Rope
  { resultatId: 'obj-19', ingredients: ['obj-41', 'obj-43'] }, // Iron Ore + Coal -> Magnet
  { resultatId: 'obj-20', ingredients: ['obj-02', 'obj-42'] }, // Ancient Menhir + Wood Log -> Water Bucket
  { resultatId: 'obj-21', ingredients: ['obj-01', 'obj-07'] }, // Mossy Rock + Rusty Scissors -> Kitchen Knife
  { resultatId: 'obj-22', ingredients: ['obj-01', 'obj-42'] }, // Mossy Rock + Wood Log -> Shovel

  // Tier 2: a tier-1 result feeds back in as an ingredient
  { resultatId: 'obj-35', ingredients: ['obj-16', 'obj-41'] }, // Torch + Iron Ore -> Flamethrower
  { resultatId: 'obj-30', ingredients: ['obj-18', 'obj-42'] }, // Rope + Wood Log -> Grappling Hook
  { resultatId: 'obj-23', ingredients: ['obj-15', 'obj-42'] }, // Net + Wood Log -> Umbrella
  { resultatId: 'obj-36', ingredients: ['obj-14', 'obj-45'] }, // Shield + Raw Diamond -> Heavy Armor
  { resultatId: 'obj-39', ingredients: ['obj-19', 'obj-44'] }, // Magnet + Gold Ingot -> Tesla Generator
]
