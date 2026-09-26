import type { Recette } from '@/types'

/**
 * Little-Alchemy-style crafting recipes: combining the two ingredients (in
 * either order) consumes both and yields the result. Every item except the
 * three starters (Mossy Rock obj-01, Oak Leaf obj-04, Rusty Scissors obj-07)
 * has exactly one recipe, and each recipe only uses items crafted at an
 * earlier tier, so the whole catalog traces back to rock, leaf and scissors
 * (checked by `recettes.test.ts`). Every pair of ingredients is unique.
 *
 * This file is the source of truth for the `recipes` table
 * (`node scripts/gen-items-sql.mjs` writes supabase/migrations/0004_recipes_seed.sql).
 * The UI must never import it statically: in supabase mode recipes stay in
 * the database and players only get the ones they discovered; mock mode loads
 * it on demand through `services/crafting.ts`.
 *
 * Brainrot items (obj-58 to obj-65) are on hold: no recipe, booster only.
 */
export const RECETTES: Recette[] = [
  // Tier 1: from the three starters
  { resultatId: 'obj-25', ingredients: ['obj-01', 'obj-01'] }, // Mossy Rock + Mossy Rock -> Brick
  { resultatId: 'obj-50', ingredients: ['obj-04', 'obj-04'] }, // Oak Leaf + Oak Leaf -> Climbing Vine
  { resultatId: 'obj-21', ingredients: ['obj-07', 'obj-07'] }, // Rusty Scissors + Rusty Scissors -> Kitchen Knife
  { resultatId: 'obj-41', ingredients: ['obj-01', 'obj-07'] }, // Mossy Rock + Rusty Scissors -> Iron Ore
  { resultatId: 'obj-18', ingredients: ['obj-04', 'obj-07'] }, // Oak Leaf + Rusty Scissors -> Rope
  { resultatId: 'obj-49', ingredients: ['obj-01', 'obj-04'] }, // Mossy Rock + Oak Leaf -> Desert Cactus

  // Tier 2: raw materials
  { resultatId: 'obj-42', ingredients: ['obj-50', 'obj-04'] }, // Climbing Vine + Oak Leaf -> Wood Log
  { resultatId: 'obj-43', ingredients: ['obj-42', 'obj-01'] }, // Wood Log + Mossy Rock -> Coal
  { resultatId: 'obj-02', ingredients: ['obj-01', 'obj-25'] }, // Mossy Rock + Brick -> Ancient Menhir
  { resultatId: 'obj-06', ingredients: ['obj-41', 'obj-04'] }, // Iron Ore + Oak Leaf -> Armored Paper
  { resultatId: 'obj-47', ingredients: ['obj-50', 'obj-07'] }, // Climbing Vine + Rusty Scissors -> Thorny Bramble
  { resultatId: 'obj-46', ingredients: ['obj-42', 'obj-50'] }, // Wood Log + Climbing Vine -> Ancient Oak
  { resultatId: 'obj-48', ingredients: ['obj-43', 'obj-04'] }, // Coal + Oak Leaf -> Poison Mushroom
  { resultatId: 'obj-45', ingredients: ['obj-43', 'obj-02'] }, // Coal + Ancient Menhir -> Raw Diamond

  // Tier 3: tools
  { resultatId: 'obj-17', ingredients: ['obj-41', 'obj-42'] }, // Iron Ore + Wood Log -> Hammer
  { resultatId: 'obj-14', ingredients: ['obj-41', 'obj-41'] }, // Iron Ore + Iron Ore -> Shield
  { resultatId: 'obj-22', ingredients: ['obj-01', 'obj-41'] }, // Mossy Rock + Iron Ore -> Shovel
  { resultatId: 'obj-13', ingredients: ['obj-21', 'obj-42'] }, // Kitchen Knife + Wood Log -> Hatchet
  { resultatId: 'obj-15', ingredients: ['obj-18', 'obj-18'] }, // Rope + Rope -> Net
  { resultatId: 'obj-30', ingredients: ['obj-18', 'obj-41'] }, // Rope + Iron Ore -> Grappling Hook
  { resultatId: 'obj-26', ingredients: ['obj-18', 'obj-06'] }, // Rope + Armored Paper -> Duct Tape
  { resultatId: 'obj-31', ingredients: ['obj-18', 'obj-01'] }, // Rope + Mossy Rock -> Slingshot
  { resultatId: 'obj-16', ingredients: ['obj-43', 'obj-42'] }, // Coal + Wood Log -> Torch
  { resultatId: 'obj-20', ingredients: ['obj-49', 'obj-41'] }, // Desert Cactus + Iron Ore -> Water Bucket
  { resultatId: 'obj-23', ingredients: ['obj-06', 'obj-42'] }, // Armored Paper + Wood Log -> Umbrella
  { resultatId: 'obj-27', ingredients: ['obj-16', 'obj-41'] }, // Torch + Iron Ore -> Flashlight
  { resultatId: 'obj-24', ingredients: ['obj-20', 'obj-41'] }, // Water Bucket + Iron Ore -> Fire Extinguisher
  { resultatId: 'obj-09', ingredients: ['obj-07', 'obj-20'] }, // Rusty Scissors + Water Bucket -> Crab Claw
  { resultatId: 'obj-05', ingredients: ['obj-06', 'obj-16'] }, // Armored Paper + Torch -> Cursed Scroll
  { resultatId: 'obj-44', ingredients: ['obj-41', 'obj-05'] }, // Iron Ore + Cursed Scroll -> Gold Ingot

  // Tier 4: weapons and machines
  { resultatId: 'obj-29', ingredients: ['obj-31', 'obj-41'] }, // Slingshot + Iron Ore -> Crossbow
  { resultatId: 'obj-32', ingredients: ['obj-26', 'obj-17'] }, // Duct Tape + Hammer -> Boxing Glove
  { resultatId: 'obj-28', ingredients: ['obj-17', 'obj-27'] }, // Hammer + Flashlight -> Power Drill
  { resultatId: 'obj-33', ingredients: ['obj-21', 'obj-28'] }, // Kitchen Knife + Power Drill -> Circular Saw
  { resultatId: 'obj-34', ingredients: ['obj-33', 'obj-42'] }, // Circular Saw + Wood Log -> Chainsaw
  { resultatId: 'obj-35', ingredients: ['obj-16', 'obj-24'] }, // Torch + Fire Extinguisher -> Flamethrower
  { resultatId: 'obj-36', ingredients: ['obj-14', 'obj-17'] }, // Shield + Hammer -> Heavy Armor
  { resultatId: 'obj-37', ingredients: ['obj-28', 'obj-45'] }, // Power Drill + Raw Diamond -> Industrial Drill
  { resultatId: 'obj-08', ingredients: ['obj-21', 'obj-45'] }, // Kitchen Knife + Raw Diamond -> Sharpened Katana
  { resultatId: 'obj-38', ingredients: ['obj-29', 'obj-43'] }, // Crossbow + Coal -> Cannon
  { resultatId: 'obj-12', ingredients: ['obj-25', 'obj-05'] }, // Brick + Cursed Scroll -> Chaos Die

  // Tier 5: weather and space
  { resultatId: 'obj-10', ingredients: ['obj-20', 'obj-23'] }, // Water Bucket + Umbrella -> Storm Lightning
  { resultatId: 'obj-40', ingredients: ['obj-15', 'obj-10'] }, // Net + Storm Lightning -> Bottled Tornado
  { resultatId: 'obj-51', ingredients: ['obj-02', 'obj-31'] }, // Ancient Menhir + Slingshot -> Asteroid
  { resultatId: 'obj-03', ingredients: ['obj-51', 'obj-16'] }, // Asteroid + Torch -> Meteorite
  { resultatId: 'obj-52', ingredients: ['obj-51', 'obj-20'] }, // Asteroid + Water Bucket -> Icy Comet
  { resultatId: 'obj-55', ingredients: ['obj-51', 'obj-27'] }, // Asteroid + Flashlight -> Shooting Star
  { resultatId: 'obj-53', ingredients: ['obj-51', 'obj-51'] }, // Asteroid + Asteroid -> Moon
  { resultatId: 'obj-19', ingredients: ['obj-41', 'obj-53'] }, // Iron Ore + Moon -> Magnet
  { resultatId: 'obj-39', ingredients: ['obj-19', 'obj-10'] }, // Magnet + Storm Lightning -> Tesla Generator
  { resultatId: 'obj-11', ingredients: ['obj-14', 'obj-52'] }, // Shield + Icy Comet -> Ice Shield
  { resultatId: 'obj-57', ingredients: ['obj-55', 'obj-52'] }, // Shooting Star + Icy Comet -> Nebula
  { resultatId: 'obj-54', ingredients: ['obj-57', 'obj-35'] }, // Nebula + Flamethrower -> Sun
  { resultatId: 'obj-56', ingredients: ['obj-54', 'obj-19'] }, // Sun + Magnet -> Miniature Black Hole
]

/** Recipes are unordered: A+B and B+A are the same combination. */
export function trouverRecette(recettes: Recette[], idA: string, idB: string): Recette | undefined {
  return recettes.find(
    (r) =>
      (r.ingredients[0] === idA && r.ingredients[1] === idB) ||
      (r.ingredients[0] === idB && r.ingredients[1] === idA),
  )
}
