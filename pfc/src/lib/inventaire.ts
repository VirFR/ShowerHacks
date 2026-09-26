import { useState } from 'react'
import type { Objet } from '@/types'

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
