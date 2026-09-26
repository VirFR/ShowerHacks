import { useState } from 'react'
import { ORDRE_RARETE } from '@/lib/format'
import { CARTES_DE_BASE, type Objet } from '@/types'

/** Rock, leaf and scissors (the classics) first, in that order, then from common to rarest. */
export function trierInventaire(objets: Objet[]): Objet[] {
  const rangBase = (o: Objet) => {
    const i = CARTES_DE_BASE.indexOf(o.id)
    return i === -1 ? CARTES_DE_BASE.length : i
  }
  return objets.toSorted((a, b) => rangBase(a) - rangBase(b) || ORDRE_RARETE[a.rarete] - ORDRE_RARETE[b.rarete])
}

/** Every owned copy of one catalog item. */
export interface Pile {
  objet: Objet
  copies: Objet[]
}

/** Groups the inventory copies by catalog item, keeping the input order. */
export function empiler(inventaire: Objet[]): Pile[] {
  const piles = new Map<string, Pile>()
  for (const copie of inventaire) {
    const pile = piles.get(copie.id)
    if (pile) pile.copies.push(copie)
    else piles.set(copie.id, { objet: copie, copies: [copie] })
  }
  return [...piles.values()]
}

export type ModeVue = 'grille' | 'liste'

const CLE_VUE = 'pfc.inventaireVue'

/** Grid / list preference, remembered per browser. */
export function useModeVue(): [ModeVue, (m: ModeVue) => void] {
  const [mode, setMode] = useState<ModeVue>(() => {
    try {
      return localStorage.getItem(CLE_VUE) === 'liste' ? 'liste' : 'grille'
    } catch {
      return 'grille'
    }
  })
  const changer = (m: ModeVue) => {
    setMode(m)
    try {
      localStorage.setItem(CLE_VUE, m)
    } catch {
      // Storage unavailable: the choice just isn't remembered.
    }
  }
  return [mode, changer]
}
