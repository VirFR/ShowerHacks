import type { Objet } from '@/types'

/**
 * Mock items. Images point to /public/objets/*.svg; the `icone` emoji is
 * used as a fallback when the image fails to load.
 */
export const OBJETS_MOCK: Objet[] = [
  {
    id: 'obj-01',
    nom: 'Mossy Rock',
    categorie: 'pierre',
    imageUrl: '/objets/obj-01.svg',
    icone: '🪨',
    rarete: 'commun',
    description: 'A good old rock. Solid, but not very fast.',
  },
  {
    id: 'obj-02',
    nom: 'Ancient Menhir',
    categorie: 'pierre',
    imageUrl: '/objets/obj-02.svg',
    icone: '🗿',
    rarete: 'rare',
    description: 'Standing for millennia. It no longer moves, but it takes every hit.',
  },
  {
    id: 'obj-03',
    nom: 'Meteorite',
    categorie: 'pierre',
    imageUrl: '/objets/obj-03.svg',
    icone: '☄️',
    rarete: 'epique',
    description: 'Fell from the sky. Hits hard, but cracks quickly.',
  },
  {
    id: 'obj-04',
    nom: 'Oak Leaf',
    categorie: 'feuille',
    imageUrl: '/objets/obj-04.svg',
    icone: '🍃',
    rarete: 'commun',
    description: 'Light and discreet, it wraps around rock without effort.',
  },
  {
    id: 'obj-05',
    nom: 'Cursed Scroll',
    categorie: 'feuille',
    imageUrl: '/objets/obj-05.svg',
    icone: '📜',
    rarete: 'rare',
    description: 'Its runes burn anyone who reads them out loud.',
  },
  {
    id: 'obj-06',
    nom: 'Armored Paper',
    categorie: 'feuille',
    imageUrl: '/objets/obj-06.svg',
    icone: '📰',
    rarete: 'rare',
    description: 'Folded a hundred times. No scissors have cut through it yet.',
  },
  {
    id: 'obj-07',
    nom: 'Rusty Scissors',
    categorie: 'ciseaux',
    imageUrl: '/objets/obj-07.svg',
    icone: '✂️',
    rarete: 'commun',
    description: 'They still cut. More or less.',
  },
  {
    id: 'obj-08',
    nom: 'Sharpened Katana',
    categorie: 'ciseaux',
    imageUrl: '/objets/obj-08.svg',
    icone: '⚔️',
    rarete: 'epique',
    description: 'Slices paper before it even touches the ground.',
  },
  {
    id: 'obj-09',
    nom: 'Crab Claw',
    categorie: 'ciseaux',
    imageUrl: '/objets/obj-09.svg',
    icone: '🦀',
    rarete: 'rare',
    description: 'A natural pair of pincers, balanced and surprisingly sturdy.',
  },
  {
    id: 'obj-10',
    nom: 'Storm Bolt',
    categorie: 'special',
    imageUrl: '/objets/obj-10.svg',
    icone: '⚡',
    rarete: 'legendaire',
    description: 'Ignores the classic rules. Nobody really knows what it beats.',
  },
  {
    id: 'obj-11',
    nom: 'Ice Shield',
    categorie: 'special',
    imageUrl: '/objets/obj-11.svg',
    icone: '🧊',
    rarete: 'epique',
    description: 'Freezes the opposing item on the spot. Melts at the first ray of sun.',
  },
  {
    id: 'obj-12',
    nom: 'Chaos Die',
    categorie: 'special',
    imageUrl: '/objets/obj-12.svg',
    icone: '🎲',
    rarete: 'legendaire',
    description: 'Its outcome changes with every roll. In theory, anyway.',
  },
]

export function trouverObjet(id: string | undefined): Objet | undefined {
  return OBJETS_MOCK.find((o) => o.id === id)
}
