import type { Objet } from '@/types'

/**
 * The fixed deck of the "La Mouche" boss fight (`services/battle/mouche.ts`).
 * Themed on the FlyWire connectome — the first complete wiring map of an
 * adult animal brain (Drosophila melanogaster, ~139,255 neurons and 50
 * million synapses, published in Nature in October 2024). Kept out of
 * `CATALOGUE_MOCK`: never dropped by boosters, never craftable, never part
 * of the category filters — a player never owns a copy.
 */
export const OBJETS_MOUCHE: Objet[] = [
  {
    id: 'obj-265',
    nom: 'Lobe Antennaire',
    attaque: 6,
    defense: 9,
    categorie: 'plantes',
    imageUrl: '/objets/obj-265.svg',
    icone: '👃',
    rarete: 'legendaire',
    description: 'Detects a rotting peach at fifty paces. This whole fight started over fruit.',
  },
  {
    id: 'obj-266',
    nom: 'Œil Composé',
    attaque: 7,
    defense: 8,
    categorie: 'animaux',
    imageUrl: '/objets/obj-266.svg',
    icone: '👁️',
    rarete: 'legendaire',
    description: 'Thousands of lenses, one seamless view. Good luck sneaking up on it.',
  },
  {
    id: 'obj-267',
    nom: 'Ganglion Thoracique',
    attaque: 9,
    defense: 6,
    categorie: 'vehicules',
    imageUrl: '/objets/obj-267.svg',
    icone: '🪰',
    rarete: 'legendaire',
    description: "Two hundred wingbeats a second. You'll hear it before you see it.",
  },
  {
    id: 'obj-268',
    nom: 'Corps Pédonculé',
    attaque: 7,
    defense: 7,
    categorie: 'espace',
    imageUrl: '/objets/obj-268.svg',
    icone: '🧠',
    rarete: 'legendaire',
    description: "Where it remembers every card you've ever opened with.",
  },
  {
    id: 'obj-269',
    nom: 'Connectome',
    attaque: 10,
    defense: 10,
    categorie: 'ressources',
    imageUrl: '/objets/obj-269.svg',
    icone: '🕸️',
    rarete: 'secret_rare',
    description: '139,255 neurons, 50 million synapses — the first brain ever fully mapped, wired to count your tells.',
  },
]
