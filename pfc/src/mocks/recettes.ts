import type { Recette } from '@/types'

export { CARTES_DE_BASE } from '@/types'

/**
 * Little-Alchemy-style crafting recipes: combining the two ingredients (in
 * either order) yields the result. The three base cards (Mossy Rock obj-01,
 * Oak Leaf obj-04, Rusty Scissors obj-07) are infinite, like Little Alchemy's
 * elements: a craft never consumes them and one copy can fill both slots.
 * Every other ingredient is consumed.
 *
 * Every card of the catalog is craftable and traces back to rock, leaf and
 * scissors (checked by `recettes.test.ts`): `PREMIERES` covers the original
 * 57 items tier by tier, `EXTENSION` the items team's expansion (animals,
 * vehicles, resources, plants, space, weapons), rarer cards sitting deeper in
 * the tree. `ALTERNATIVES` adds more ways to reach the early cards, so that
 * every combination of the three bases and their six tier-1 results produces
 * something. Every pair of ingredients is unique.
 *
 * Cards can still be pulled from boosters too: crafting is one more way to
 * get them, not the only one.
 *
 * This file is the source of truth for the `recipes` table
 * (`node scripts/gen-items-sql.mjs` writes supabase/migrations/0004_recipes_seed.sql).
 * The UI must never import it statically: in supabase mode recipes stay in
 * the database and players only get the ones they discovered; mock mode loads
 * it on demand through `services/crafting.ts`.
 *
 * Brainrot items are set aside (see `objetsBrainrot.ts`): no recipe.
 */
const PREMIERES: Recette[] = [
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

/**
 * The items team's expansion, one block per category. Each recipe only uses
 * cards reachable earlier in the tree.
 */
const EXTENSION: Recette[] = [
  // Resources
  { resultatId: 'obj-163', ingredients: ['obj-01', 'obj-17'] }, // Mossy Rock + Hammer -> Sand
  { resultatId: 'obj-216', ingredients: ['obj-01', 'obj-22'] }, // Mossy Rock + Shovel -> Gravel
  { resultatId: 'obj-164', ingredients: ['obj-163', 'obj-20'] }, // Sand + Water Bucket -> Clay
  { resultatId: 'obj-165', ingredients: ['obj-01', 'obj-20'] }, // Mossy Rock + Water Bucket -> Limestone
  { resultatId: 'obj-167', ingredients: ['obj-20', 'obj-16'] }, // Water Bucket + Torch -> Salt Crystal
  { resultatId: 'obj-217', ingredients: ['obj-165', 'obj-20'] }, // Limestone + Water Bucket -> Gypsum
  { resultatId: 'obj-166', ingredients: ['obj-41', 'obj-43'] }, // Iron Ore + Coal -> Copper Ore
  { resultatId: 'obj-218', ingredients: ['obj-41', 'obj-216'] }, // Iron Ore + Gravel -> Tin Ore
  { resultatId: 'obj-219', ingredients: ['obj-41', 'obj-163'] }, // Iron Ore + Sand -> Zinc Ore
  { resultatId: 'obj-220', ingredients: ['obj-02', 'obj-17'] }, // Ancient Menhir + Hammer -> Granite Block
  { resultatId: 'obj-170', ingredients: ['obj-163', 'obj-16'] }, // Sand + Torch -> Quartz Crystal
  { resultatId: 'obj-171', ingredients: ['obj-01', 'obj-35'] }, // Mossy Rock + Flamethrower -> Obsidian Shard
  { resultatId: 'obj-221', ingredients: ['obj-219', 'obj-16'] }, // Zinc Ore + Torch -> Nickel Ingot
  { resultatId: 'obj-169', ingredients: ['obj-218', 'obj-16'] }, // Tin Ore + Torch -> Silver Ingot
  { resultatId: 'obj-168', ingredients: ['obj-166', 'obj-19'] }, // Copper Ore + Magnet -> Cobalt Ore
  { resultatId: 'obj-173', ingredients: ['obj-46', 'obj-43'] }, // Ancient Oak + Coal -> Amber
  { resultatId: 'obj-222', ingredients: ['obj-170', 'obj-20'] }, // Quartz Crystal + Water Bucket -> Opal
  { resultatId: 'obj-223', ingredients: ['obj-170', 'obj-16'] }, // Quartz Crystal + Torch -> Garnet
  { resultatId: 'obj-172', ingredients: ['obj-09', 'obj-163'] }, // Crab Claw + Sand -> Pearl
  { resultatId: 'obj-174', ingredients: ['obj-169', 'obj-221'] }, // Silver Ingot + Nickel Ingot -> Platinum Ingot
  { resultatId: 'obj-224', ingredients: ['obj-174', 'obj-16'] }, // Platinum Ingot + Torch -> Palladium
  { resultatId: 'obj-175', ingredients: ['obj-170', 'obj-35'] }, // Quartz Crystal + Flamethrower -> Ruby
  { resultatId: 'obj-176', ingredients: ['obj-170', 'obj-52'] }, // Quartz Crystal + Icy Comet -> Sapphire
  { resultatId: 'obj-225', ingredients: ['obj-170', 'obj-44'] }, // Quartz Crystal + Gold Ingot -> Topaz
  { resultatId: 'obj-177', ingredients: ['obj-221', 'obj-35'] }, // Nickel Ingot + Flamethrower -> Titanium Ingot
  { resultatId: 'obj-178', ingredients: ['obj-45', 'obj-50'] }, // Raw Diamond + Climbing Vine -> Emerald
  { resultatId: 'obj-179', ingredients: ['obj-168', 'obj-10'] }, // Cobalt Ore + Storm Lightning -> Uranium Ore
  { resultatId: 'obj-227', ingredients: ['obj-174', 'obj-224'] }, // Platinum Ingot + Palladium -> Rhodium
  { resultatId: 'obj-226', ingredients: ['obj-175', 'obj-176'] }, // Ruby + Sapphire -> Painite
  { resultatId: 'obj-180', ingredients: ['obj-03', 'obj-17'] }, // Meteorite + Hammer -> Meteorite Fragment
  { resultatId: 'obj-228', ingredients: ['obj-226', 'obj-53'] }, // Painite + Moon -> Musgravite
  { resultatId: 'obj-181', ingredients: ['obj-179', 'obj-56'] }, // Uranium Ore + Miniature Black Hole -> Antimatter Sample
  // Plants
  { resultatId: 'obj-184', ingredients: ['obj-04', 'obj-20'] }, // Oak Leaf + Water Bucket -> Grass Tuft
  { resultatId: 'obj-204', ingredients: ['obj-01', 'obj-184'] }, // Mossy Rock + Grass Tuft -> Moss
  { resultatId: 'obj-183', ingredients: ['obj-184', 'obj-04'] }, // Grass Tuft + Oak Leaf -> Clover
  { resultatId: 'obj-182', ingredients: ['obj-184', 'obj-184'] }, // Grass Tuft + Grass Tuft -> Dandelion
  { resultatId: 'obj-186', ingredients: ['obj-04', 'obj-204'] }, // Oak Leaf + Moss -> Fern
  { resultatId: 'obj-185', ingredients: ['obj-50', 'obj-48'] }, // Climbing Vine + Poison Mushroom -> Poison Ivy
  { resultatId: 'obj-203', ingredients: ['obj-184', 'obj-22'] }, // Grass Tuft + Shovel -> Wheat Stalk
  { resultatId: 'obj-202', ingredients: ['obj-183', 'obj-20'] }, // Clover + Water Bucket -> Tulip
  { resultatId: 'obj-188', ingredients: ['obj-205', 'obj-202'] }, // Maple Tree + Tulip -> Cherry Blossom
  { resultatId: 'obj-189', ingredients: ['obj-46', 'obj-50'] }, // Ancient Oak + Climbing Vine -> Mistletoe
  { resultatId: 'obj-207', ingredients: ['obj-202', 'obj-20'] }, // Tulip + Water Bucket -> Water Lily
  { resultatId: 'obj-187', ingredients: ['obj-184', 'obj-42'] }, // Grass Tuft + Wood Log -> Bamboo Stalk
  { resultatId: 'obj-190', ingredients: ['obj-202', 'obj-47'] }, // Tulip + Thorny Bramble -> Rose
  { resultatId: 'obj-192', ingredients: ['obj-48', 'obj-47'] }, // Poison Mushroom + Thorny Bramble -> Venus Flytrap
  { resultatId: 'obj-205', ingredients: ['obj-42', 'obj-04'] }, // Wood Log + Oak Leaf -> Maple Tree
  { resultatId: 'obj-206', ingredients: ['obj-42', 'obj-163'] }, // Wood Log + Sand -> Palm Tree
  { resultatId: 'obj-208', ingredients: ['obj-192', 'obj-20'] }, // Venus Flytrap + Water Bucket -> Pitcher Plant
  { resultatId: 'obj-209', ingredients: ['obj-190', 'obj-202'] }, // Rose + Tulip -> Bird of Paradise
  { resultatId: 'obj-210', ingredients: ['obj-190', 'obj-50'] }, // Rose + Climbing Vine -> Passion Flower
  { resultatId: 'obj-191', ingredients: ['obj-182', 'obj-54'] }, // Dandelion + Sun -> Sunflower
  { resultatId: 'obj-211', ingredients: ['obj-205', 'obj-169'] }, // Maple Tree + Silver Ingot -> Silver Birch
  { resultatId: 'obj-193', ingredients: ['obj-46', 'obj-20'] }, // Ancient Oak + Water Bucket -> Baobab Tree
  { resultatId: 'obj-194', ingredients: ['obj-202', 'obj-46'] }, // Tulip + Ancient Oak -> Orchid
  { resultatId: 'obj-196', ingredients: ['obj-207', 'obj-190'] }, // Water Lily + Rose -> Lotus Flower
  { resultatId: 'obj-212', ingredients: ['obj-46', 'obj-175'] }, // Ancient Oak + Ruby -> Dragon Blood Tree
  { resultatId: 'obj-213', ingredients: ['obj-46', 'obj-46'] }, // Ancient Oak + Ancient Oak -> Banyan Tree
  { resultatId: 'obj-197', ingredients: ['obj-205', 'obj-46'] }, // Maple Tree + Ancient Oak -> Redwood
  { resultatId: 'obj-195', ingredients: ['obj-197', 'obj-197'] }, // Redwood + Redwood -> Giant Sequoia
  { resultatId: 'obj-198', ingredients: ['obj-48', 'obj-190'] }, // Poison Mushroom + Rose -> Corpse Flower
  { resultatId: 'obj-199', ingredients: ['obj-194', 'obj-53'] }, // Orchid + Moon -> Ghost Orchid
  { resultatId: 'obj-214', ingredients: ['obj-198', 'obj-185'] }, // Corpse Flower + Poison Ivy -> Rafflesia
  { resultatId: 'obj-200', ingredients: ['obj-50', 'obj-178'] }, // Climbing Vine + Emerald -> Jade Vine
  { resultatId: 'obj-215', ingredients: ['obj-190', 'obj-175'] }, // Rose + Ruby -> Middlemist Red
  { resultatId: 'obj-201', ingredients: ['obj-195', 'obj-173'] }, // Giant Sequoia + Amber -> Wollemi Pine
  // Animals
  { resultatId: 'obj-66', ingredients: ['obj-04', 'obj-163'] }, // Oak Leaf + Sand -> Ant
  { resultatId: 'obj-71', ingredients: ['obj-207', 'obj-66'] }, // Water Lily + Ant -> Frog
  { resultatId: 'obj-67', ingredients: ['obj-203', 'obj-42'] }, // Wheat Stalk + Wood Log -> Mouse
  { resultatId: 'obj-68', ingredients: ['obj-183', 'obj-183'] }, // Clover + Clover -> Rabbit
  { resultatId: 'obj-69', ingredients: ['obj-203', 'obj-04'] }, // Wheat Stalk + Oak Leaf -> Sparrow
  { resultatId: 'obj-70', ingredients: ['obj-46', 'obj-67'] }, // Ancient Oak + Mouse -> Squirrel
  { resultatId: 'obj-246', ingredients: ['obj-67', 'obj-47'] }, // Mouse + Thorny Bramble -> Hedgehog
  { resultatId: 'obj-79', ingredients: ['obj-67', 'obj-23'] }, // Mouse + Umbrella -> Bat
  { resultatId: 'obj-74', ingredients: ['obj-69', 'obj-53'] }, // Sparrow + Moon -> Owl
  { resultatId: 'obj-72', ingredients: ['obj-67', 'obj-68'] }, // Mouse + Rabbit -> Fox
  { resultatId: 'obj-73', ingredients: ['obj-70', 'obj-20'] }, // Squirrel + Water Bucket -> Raccoon
  { resultatId: 'obj-247', ingredients: ['obj-71', 'obj-70'] }, // Frog + Squirrel -> Otter
  { resultatId: 'obj-75', ingredients: ['obj-48', 'obj-22'] }, // Poison Mushroom + Shovel -> Wild Boar
  { resultatId: 'obj-78', ingredients: ['obj-68', 'obj-205'] }, // Rabbit + Maple Tree -> Deer
  { resultatId: 'obj-249', ingredients: ['obj-69', 'obj-49'] }, // Sparrow + Desert Cactus -> Vulture
  { resultatId: 'obj-84', ingredients: ['obj-249', 'obj-02'] }, // Vulture + Ancient Menhir -> Eagle
  { resultatId: 'obj-80', ingredients: ['obj-72', 'obj-53'] }, // Fox + Moon -> Wolf
  { resultatId: 'obj-81', ingredients: ['obj-80', 'obj-163'] }, // Wolf + Sand -> Hyena
  { resultatId: 'obj-82', ingredients: ['obj-80', 'obj-46'] }, // Wolf + Ancient Oak -> Leopard
  { resultatId: 'obj-85', ingredients: ['obj-82', 'obj-10'] }, // Leopard + Storm Lightning -> Cheetah
  { resultatId: 'obj-94', ingredients: ['obj-82', 'obj-20'] }, // Leopard + Water Bucket -> Jaguar
  { resultatId: 'obj-88', ingredients: ['obj-82', 'obj-44'] }, // Leopard + Gold Ingot -> Lion
  { resultatId: 'obj-89', ingredients: ['obj-82', 'obj-187'] }, // Leopard + Bamboo Stalk -> Tiger
  { resultatId: 'obj-77', ingredients: ['obj-78', 'obj-193'] }, // Deer + Baobab Tree -> Giraffe
  { resultatId: 'obj-76', ingredients: ['obj-75', 'obj-02'] }, // Wild Boar + Ancient Menhir -> Elephant
  { resultatId: 'obj-250', ingredients: ['obj-76', 'obj-20'] }, // Elephant + Water Bucket -> Hippopotamus
  { resultatId: 'obj-251', ingredients: ['obj-70', 'obj-32'] }, // Squirrel + Boxing Glove -> Silverback Gorilla
  { resultatId: 'obj-90', ingredients: ['obj-73', 'obj-17'] }, // Raccoon + Hammer -> Grizzly Bear
  { resultatId: 'obj-93', ingredients: ['obj-90', 'obj-11'] }, // Grizzly Bear + Ice Shield -> Polar Bear
  { resultatId: 'obj-248', ingredients: ['obj-246', 'obj-36'] }, // Hedgehog + Heavy Armor -> Honey Badger
  { resultatId: 'obj-83', ingredients: ['obj-71', 'obj-14'] }, // Frog + Shield -> Crocodile
  { resultatId: 'obj-95', ingredients: ['obj-83', 'obj-167'] }, // Crocodile + Salt Crystal -> Saltwater Crocodile
  { resultatId: 'obj-86', ingredients: ['obj-83', 'obj-48'] }, // Crocodile + Poison Mushroom -> Komodo Dragon
  { resultatId: 'obj-87', ingredients: ['obj-18', 'obj-83'] }, // Rope + Crocodile -> Anaconda
  { resultatId: 'obj-91', ingredients: ['obj-09', 'obj-33'] }, // Crab Claw + Circular Saw -> Great White Shark
  { resultatId: 'obj-92', ingredients: ['obj-91', 'obj-52'] }, // Great White Shark + Icy Comet -> Orca
  { resultatId: 'obj-96', ingredients: ['obj-92', 'obj-250'] }, // Orca + Hippopotamus -> Sperm Whale
  { resultatId: 'obj-98', ingredients: ['obj-91', 'obj-173'] }, // Great White Shark + Amber -> Megalodon
  { resultatId: 'obj-97', ingredients: ['obj-86', 'obj-173'] }, // Komodo Dragon + Amber -> Tyrannosaurus Rex
  { resultatId: 'obj-99', ingredients: ['obj-96', 'obj-05'] }, // Sperm Whale + Cursed Scroll -> Kraken
  // Space
  { resultatId: 'obj-148', ingredients: ['obj-51', 'obj-17'] }, // Asteroid + Hammer -> Space Dust
  { resultatId: 'obj-149', ingredients: ['obj-52', 'obj-17'] }, // Icy Comet + Hammer -> Ice Chunk
  { resultatId: 'obj-150', ingredients: ['obj-53', 'obj-51'] }, // Moon + Asteroid -> Small Moon
  { resultatId: 'obj-151', ingredients: ['obj-03', 'obj-03'] }, // Meteorite + Meteorite -> Meteor Shower
  { resultatId: 'obj-152', ingredients: ['obj-51', 'obj-148'] }, // Asteroid + Space Dust -> Asteroid Belt
  { resultatId: 'obj-232', ingredients: ['obj-52', 'obj-148'] }, // Icy Comet + Space Dust -> Comet Tail
  { resultatId: 'obj-229', ingredients: ['obj-55', 'obj-27'] }, // Shooting Star + Flashlight -> Cosmic Ray
  { resultatId: 'obj-230', ingredients: ['obj-148', 'obj-40'] }, // Space Dust + Bottled Tornado -> Solar Wind
  { resultatId: 'obj-231', ingredients: ['obj-57', 'obj-148'] }, // Nebula + Space Dust -> Interstellar Gas Cloud
  { resultatId: 'obj-234', ingredients: ['obj-150', 'obj-152'] }, // Small Moon + Asteroid Belt -> Ring System
  { resultatId: 'obj-233', ingredients: ['obj-55', 'obj-55'] }, // Shooting Star + Shooting Star -> Binary Star System
  { resultatId: 'obj-154', ingredients: ['obj-150', 'obj-41'] }, // Small Moon + Iron Ore -> Satellite
  { resultatId: 'obj-153', ingredients: ['obj-150', 'obj-149'] }, // Small Moon + Ice Chunk -> Dwarf Planet
  { resultatId: 'obj-235', ingredients: ['obj-153', 'obj-184'] }, // Dwarf Planet + Grass Tuft -> Exoplanet
  { resultatId: 'obj-156', ingredients: ['obj-231', 'obj-53'] }, // Interstellar Gas Cloud + Moon -> Gas Giant
  { resultatId: 'obj-236', ingredients: ['obj-156', 'obj-16'] }, // Gas Giant + Torch -> Brown Dwarf
  { resultatId: 'obj-237', ingredients: ['obj-156', 'obj-149'] }, // Gas Giant + Ice Chunk -> Ice Giant
  { resultatId: 'obj-240', ingredients: ['obj-231', 'obj-16'] }, // Interstellar Gas Cloud + Torch -> Protostar
  { resultatId: 'obj-239', ingredients: ['obj-240', 'obj-54'] }, // Protostar + Sun -> Yellow Dwarf Star
  { resultatId: 'obj-155', ingredients: ['obj-239', 'obj-148'] }, // Yellow Dwarf Star + Space Dust -> White Dwarf
  { resultatId: 'obj-157', ingredients: ['obj-239', 'obj-35'] }, // Yellow Dwarf Star + Flamethrower -> Red Giant Star
  { resultatId: 'obj-158', ingredients: ['obj-157', 'obj-10'] }, // Red Giant Star + Storm Lightning -> Blue Supergiant Star
  { resultatId: 'obj-242', ingredients: ['obj-158', 'obj-157'] }, // Blue Supergiant Star + Red Giant Star -> Hypergiant Star
  { resultatId: 'obj-159', ingredients: ['obj-157', 'obj-38'] }, // Red Giant Star + Cannon -> Supernova
  { resultatId: 'obj-238', ingredients: ['obj-159', 'obj-45'] }, // Supernova + Raw Diamond -> Neutron Star
  { resultatId: 'obj-160', ingredients: ['obj-238', 'obj-27'] }, // Neutron Star + Flashlight -> Pulsar
  { resultatId: 'obj-241', ingredients: ['obj-238', 'obj-19'] }, // Neutron Star + Magnet -> Magnetar
  { resultatId: 'obj-243', ingredients: ['obj-56', 'obj-12'] }, // Miniature Black Hole + Chaos Die -> Wormhole
  { resultatId: 'obj-161', ingredients: ['obj-56', 'obj-160'] }, // Miniature Black Hole + Pulsar -> Quasar
  { resultatId: 'obj-162', ingredients: ['obj-161', 'obj-57'] }, // Quasar + Nebula -> Galaxy
  { resultatId: 'obj-244', ingredients: ['obj-56', 'obj-159'] }, // Miniature Black Hole + Supernova -> The Big Bang
  { resultatId: 'obj-245', ingredients: ['obj-162', 'obj-244'] }, // Galaxy + The Big Bang -> Observable Universe
  // Vehicles
  { resultatId: 'obj-100', ingredients: ['obj-42', 'obj-17'] }, // Wood Log + Hammer -> Wooden Cart
  { resultatId: 'obj-252', ingredients: ['obj-42', 'obj-13'] }, // Wood Log + Hatchet -> Canoe
  { resultatId: 'obj-102', ingredients: ['obj-252', 'obj-22'] }, // Canoe + Shovel -> Rowboat
  { resultatId: 'obj-253', ingredients: ['obj-42', 'obj-149'] }, // Wood Log + Ice Chunk -> Skis
  { resultatId: 'obj-103', ingredients: ['obj-100', 'obj-26'] }, // Wooden Cart + Duct Tape -> Skateboard
  { resultatId: 'obj-101', ingredients: ['obj-100', 'obj-18'] }, // Wooden Cart + Rope -> Bicycle
  { resultatId: 'obj-107', ingredients: ['obj-102', 'obj-23'] }, // Rowboat + Umbrella -> Sailing Ship
  { resultatId: 'obj-105', ingredients: ['obj-23', 'obj-16'] }, // Umbrella + Torch -> Hot Air Balloon
  { resultatId: 'obj-108', ingredients: ['obj-105', 'obj-105'] }, // Hot Air Balloon + Hot Air Balloon -> Zeppelin
  { resultatId: 'obj-254', ingredients: ['obj-100', 'obj-166'] }, // Wooden Cart + Copper Ore -> Trolley Car
  { resultatId: 'obj-256', ingredients: ['obj-254', 'obj-18'] }, // Trolley Car + Rope -> Cable Car
  { resultatId: 'obj-106', ingredients: ['obj-101', 'obj-28'] }, // Bicycle + Power Drill -> Motorcycle
  { resultatId: 'obj-104', ingredients: ['obj-100', 'obj-43'] }, // Wooden Cart + Coal -> Steam Locomotive
  { resultatId: 'obj-109', ingredients: ['obj-106', 'obj-253'] }, // Motorcycle + Skis -> Snowmobile
  { resultatId: 'obj-255', ingredients: ['obj-23', 'obj-28'] }, // Umbrella + Power Drill -> Biplane
  { resultatId: 'obj-110', ingredients: ['obj-106', 'obj-100'] }, // Motorcycle + Wooden Cart -> Automobile
  { resultatId: 'obj-111', ingredients: ['obj-110', 'obj-22'] }, // Automobile + Shovel -> Pickup Truck
  { resultatId: 'obj-257', ingredients: ['obj-110', 'obj-06'] }, // Automobile + Armored Paper -> School Bus
  { resultatId: 'obj-258', ingredients: ['obj-110', 'obj-27'] }, // Automobile + Flashlight -> Ambulance
  { resultatId: 'obj-262', ingredients: ['obj-111', 'obj-100'] }, // Pickup Truck + Wooden Cart -> Semi-Truck
  { resultatId: 'obj-259', ingredients: ['obj-104', 'obj-100'] }, // Steam Locomotive + Wooden Cart -> Freight Train
  { resultatId: 'obj-119', ingredients: ['obj-259', 'obj-10'] }, // Freight Train + Storm Lightning -> Bullet Train
  { resultatId: 'obj-112', ingredients: ['obj-107', 'obj-41'] }, // Sailing Ship + Iron Ore -> Cargo Ship
  { resultatId: 'obj-115', ingredients: ['obj-112', 'obj-25'] }, // Cargo Ship + Brick -> Container Ship
  { resultatId: 'obj-260', ingredients: ['obj-112', 'obj-206'] }, // Cargo Ship + Palm Tree -> Cruise Ship
  { resultatId: 'obj-261', ingredients: ['obj-107', 'obj-10'] }, // Sailing Ship + Storm Lightning -> High-Speed Ferry
  { resultatId: 'obj-113', ingredients: ['obj-255', 'obj-41'] }, // Biplane + Iron Ore -> Propeller Airplane
  { resultatId: 'obj-116', ingredients: ['obj-113', 'obj-35'] }, // Propeller Airplane + Flamethrower -> Fighter Jet
  { resultatId: 'obj-117', ingredients: ['obj-113', 'obj-33'] }, // Propeller Airplane + Circular Saw -> Attack Helicopter
  { resultatId: 'obj-122', ingredients: ['obj-116', 'obj-79'] }, // Fighter Jet + Bat -> Stealth Bomber
  { resultatId: 'obj-263', ingredients: ['obj-116', 'obj-84'] }, // Fighter Jet + Eagle -> Supersonic Concorde Jet
  { resultatId: 'obj-114', ingredients: ['obj-110', 'obj-38'] }, // Automobile + Cannon -> Tank
  { resultatId: 'obj-118', ingredients: ['obj-112', 'obj-36'] }, // Cargo Ship + Heavy Armor -> Submarine
  { resultatId: 'obj-123', ingredients: ['obj-115', 'obj-116'] }, // Container Ship + Fighter Jet -> Aircraft Carrier
  { resultatId: 'obj-121', ingredients: ['obj-110', 'obj-85'] }, // Automobile + Cheetah -> Hypercar
  { resultatId: 'obj-124', ingredients: ['obj-121', 'obj-177'] }, // Hypercar + Titanium Ingot -> Formula 1 Car
  { resultatId: 'obj-120', ingredients: ['obj-116', 'obj-53'] }, // Fighter Jet + Moon -> Space Shuttle
  { resultatId: 'obj-126', ingredients: ['obj-120', 'obj-35'] }, // Space Shuttle + Flamethrower -> Reusable Orbital Rocket
  { resultatId: 'obj-125', ingredients: ['obj-126', 'obj-111'] }, // Reusable Orbital Rocket + Pickup Truck -> Mars Rover
  { resultatId: 'obj-264', ingredients: ['obj-126', 'obj-154'] }, // Reusable Orbital Rocket + Satellite -> International Space Station
  // Weapons
  { resultatId: 'obj-139', ingredients: ['obj-38', 'obj-31'] }, // Cannon + Slingshot -> Pistol
  { resultatId: 'obj-141', ingredients: ['obj-139', 'obj-84'] }, // Pistol + Eagle -> Sniper Rifle
  { resultatId: 'obj-142', ingredients: ['obj-38', 'obj-26'] }, // Cannon + Duct Tape -> Grenade
  { resultatId: 'obj-143', ingredients: ['obj-139', 'obj-139'] }, // Pistol + Pistol -> AK-47
  { resultatId: 'obj-146', ingredients: ['obj-39', 'obj-141'] }, // Tesla Generator + Sniper Rifle -> Railgun
]

/**
 * Extra recipes: every pair of early cards (rock, leaf, scissors, brick,
 * vine, knife, iron ore, rope, cactus) works, so experimenting pays off.
 */
const ALTERNATIVES: Recette[] = [
  { resultatId: 'obj-47', ingredients: ['obj-01', 'obj-50'] }, // Mossy Rock + Climbing Vine -> Thorny Bramble
  { resultatId: 'obj-13', ingredients: ['obj-01', 'obj-21'] }, // Mossy Rock + Kitchen Knife -> Hatchet
  { resultatId: 'obj-25', ingredients: ['obj-01', 'obj-49'] }, // Mossy Rock + Desert Cactus -> Brick
  { resultatId: 'obj-50', ingredients: ['obj-04', 'obj-25'] }, // Oak Leaf + Brick -> Climbing Vine
  { resultatId: 'obj-06', ingredients: ['obj-04', 'obj-21'] }, // Oak Leaf + Kitchen Knife -> Armored Paper
  { resultatId: 'obj-15', ingredients: ['obj-04', 'obj-18'] }, // Oak Leaf + Rope -> Net
  { resultatId: 'obj-50', ingredients: ['obj-04', 'obj-49'] }, // Oak Leaf + Desert Cactus -> Climbing Vine
  { resultatId: 'obj-22', ingredients: ['obj-07', 'obj-25'] }, // Rusty Scissors + Brick -> Shovel
  { resultatId: 'obj-09', ingredients: ['obj-07', 'obj-21'] }, // Rusty Scissors + Kitchen Knife -> Crab Claw
  { resultatId: 'obj-21', ingredients: ['obj-07', 'obj-41'] }, // Rusty Scissors + Iron Ore -> Kitchen Knife
  { resultatId: 'obj-30', ingredients: ['obj-07', 'obj-18'] }, // Rusty Scissors + Rope -> Grappling Hook
  { resultatId: 'obj-47', ingredients: ['obj-07', 'obj-49'] }, // Rusty Scissors + Desert Cactus -> Thorny Bramble
  { resultatId: 'obj-02', ingredients: ['obj-25', 'obj-25'] }, // Brick + Brick -> Ancient Menhir
  { resultatId: 'obj-02', ingredients: ['obj-25', 'obj-50'] }, // Brick + Climbing Vine -> Ancient Menhir
  { resultatId: 'obj-17', ingredients: ['obj-25', 'obj-21'] }, // Brick + Kitchen Knife -> Hammer
  { resultatId: 'obj-14', ingredients: ['obj-25', 'obj-41'] }, // Brick + Iron Ore -> Shield
  { resultatId: 'obj-20', ingredients: ['obj-25', 'obj-18'] }, // Brick + Rope -> Water Bucket (a well)
  { resultatId: 'obj-43', ingredients: ['obj-25', 'obj-49'] }, // Brick + Desert Cactus -> Coal (a kiln)
  { resultatId: 'obj-46', ingredients: ['obj-50', 'obj-50'] }, // Climbing Vine + Climbing Vine -> Ancient Oak
  { resultatId: 'obj-18', ingredients: ['obj-50', 'obj-21'] }, // Climbing Vine + Kitchen Knife -> Rope
  { resultatId: 'obj-30', ingredients: ['obj-50', 'obj-41'] }, // Climbing Vine + Iron Ore -> Grappling Hook
  { resultatId: 'obj-15', ingredients: ['obj-50', 'obj-18'] }, // Climbing Vine + Rope -> Net
  { resultatId: 'obj-48', ingredients: ['obj-50', 'obj-49'] }, // Climbing Vine + Desert Cactus -> Poison Mushroom
  { resultatId: 'obj-08', ingredients: ['obj-21', 'obj-21'] }, // Kitchen Knife + Kitchen Knife -> Sharpened Katana
  { resultatId: 'obj-13', ingredients: ['obj-21', 'obj-41'] }, // Kitchen Knife + Iron Ore -> Hatchet
  { resultatId: 'obj-29', ingredients: ['obj-21', 'obj-18'] }, // Kitchen Knife + Rope -> Crossbow
  { resultatId: 'obj-20', ingredients: ['obj-21', 'obj-49'] }, // Kitchen Knife + Desert Cactus -> Water Bucket
  { resultatId: 'obj-31', ingredients: ['obj-18', 'obj-49'] }, // Rope + Desert Cactus -> Slingshot (a forked cactus)
  { resultatId: 'obj-20', ingredients: ['obj-49', 'obj-49'] }, // Desert Cactus + Desert Cactus -> Water Bucket
]

export const RECETTES: Recette[] = [...PREMIERES, ...EXTENSION, ...ALTERNATIVES]

/** Recipes are unordered: A+B and B+A are the same combination. */
export function trouverRecette(recettes: Recette[], idA: string, idB: string): Recette | undefined {
  return recettes.find(
    (r) =>
      (r.ingredients[0] === idA && r.ingredients[1] === idB) ||
      (r.ingredients[0] === idB && r.ingredients[1] === idA),
  )
}
