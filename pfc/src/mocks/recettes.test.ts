import { describe, expect, it } from 'vitest'
import { CATALOGUE_MOCK } from './objets'
import { CARTES_DE_BASE, RECETTES, trouverRecette } from './recettes'

const ids = new Set(CATALOGUE_MOCK.map((o) => o.id))

describe('recipes', () => {
  it('only reference catalog items', () => {
    for (const r of RECETTES) {
      expect(ids.has(r.resultatId), r.resultatId).toBe(true)
      for (const i of r.ingredients) expect(ids.has(i), i).toBe(true)
    }
  })

  it('never produce a base card', () => {
    for (const r of RECETTES) expect(CARTES_DE_BASE.includes(r.resultatId), r.resultatId).toBe(false)
  })

  it('never reuse a pair of ingredients', () => {
    const paires = RECETTES.map((r) => [...r.ingredients].sort().join('+'))
    expect(new Set(paires).size).toBe(paires.length)
  })

  /**
   * Not every catalog item is craftable on purpose: the items team's booster
   * expansion (200+ cards across 6 categories) is largely booster-exclusive
   * chase content, only the original tier-1/tier-2 chain below is wired into
   * the crafting tree. This checks that every recipe's result is actually
   * reachable by chaining from the base cards (no recipe stranded behind a
   * missing intermediate step), not that the whole catalog is craftable.
   */
  it('every recipe result traces back to rock, leaf and scissors', () => {
    const atteints = new Set(CARTES_DE_BASE)
    let progres = true
    while (progres) {
      progres = false
      for (const r of RECETTES) {
        if (!atteints.has(r.resultatId) && r.ingredients.every((i) => atteints.has(i))) {
          atteints.add(r.resultatId)
          progres = true
        }
      }
    }
    for (const r of RECETTES) expect(atteints.has(r.resultatId), r.resultatId).toBe(true)
  })

  it('make every combination of the early cards work', () => {
    const debut = [...CARTES_DE_BASE, 'obj-25', 'obj-50', 'obj-21', 'obj-41', 'obj-18', 'obj-49']
    for (const [i, a] of debut.entries()) {
      for (const b of debut.slice(i)) expect(trouverRecette(RECETTES, a, b), `${a} + ${b}`).toBeDefined()
    }
  })

  it('match in either order', () => {
    expect(trouverRecette(RECETTES, 'obj-07', 'obj-01')?.resultatId).toBe('obj-41')
    expect(trouverRecette(RECETTES, 'obj-01', 'obj-07')?.resultatId).toBe('obj-41')
    expect(trouverRecette(RECETTES, 'obj-01', 'obj-54')).toBeUndefined()
  })
})
