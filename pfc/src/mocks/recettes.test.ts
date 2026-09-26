import { describe, expect, it } from 'vitest'
import { CATALOGUE_MOCK } from './objets'
import { CARTES_DE_BASE, RECETTES, trouverRecette } from './recettes'

const craftables = CATALOGUE_MOCK.filter((o) => !CARTES_DE_BASE.includes(o.id))
const ids = new Set(CATALOGUE_MOCK.map((o) => o.id))

describe('recipes', () => {
  it('only reference catalog items', () => {
    for (const r of RECETTES) {
      expect(ids.has(r.resultatId), r.resultatId).toBe(true)
      for (const i of r.ingredients) expect(ids.has(i), i).toBe(true)
    }
  })

  it('give every non-base item at least one recipe, and never produce a base card', () => {
    const resultats = new Set(RECETTES.map((r) => r.resultatId))
    expect(resultats).toEqual(new Set(craftables.map((o) => o.id)))
  })

  it('never reuse a pair of ingredients', () => {
    const paires = RECETTES.map((r) => [...r.ingredients].sort().join('+'))
    expect(new Set(paires).size).toBe(paires.length)
  })

  it('all trace back to rock, leaf and scissors', () => {
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
    expect(atteints.size).toBe(CATALOGUE_MOCK.length)
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
