import { describe, expect, it } from 'vitest'
import { CATALOGUE_MOCK } from './objets'
import { RECETTES, trouverRecette } from './recettes'

const STARTERS = ['obj-01', 'obj-04', 'obj-07']
const craftables = CATALOGUE_MOCK.filter((o) => !STARTERS.includes(o.id) && o.categorie !== 'brainrot')
const ids = new Set(CATALOGUE_MOCK.map((o) => o.id))

describe('recipes', () => {
  it('only reference catalog items', () => {
    for (const r of RECETTES) {
      expect(ids.has(r.resultatId), r.resultatId).toBe(true)
      for (const i of r.ingredients) expect(ids.has(i), i).toBe(true)
    }
  })

  it('give every non-starter, non-brainrot item exactly one recipe', () => {
    const resultats = RECETTES.map((r) => r.resultatId)
    expect(new Set(resultats).size).toBe(resultats.length)
    expect(new Set(resultats)).toEqual(new Set(craftables.map((o) => o.id)))
  })

  it('never reuse a pair of ingredients', () => {
    const paires = RECETTES.map((r) => [...r.ingredients].sort().join('+'))
    expect(new Set(paires).size).toBe(paires.length)
  })

  it('all trace back to rock, leaf and scissors', () => {
    const atteints = new Set(STARTERS)
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
    expect(atteints.size).toBe(STARTERS.length + craftables.length)
  })

  it('match in either order', () => {
    expect(trouverRecette(RECETTES, 'obj-07', 'obj-01')?.resultatId).toBe('obj-41')
    expect(trouverRecette(RECETTES, 'obj-01', 'obj-07')?.resultatId).toBe('obj-41')
    expect(trouverRecette(RECETTES, 'obj-01', 'obj-54')).toBeUndefined()
  })
})
