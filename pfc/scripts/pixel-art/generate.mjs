#!/usr/bin/env node
/**
 * Pixel-art generator for item pictures.
 *
 * Every item in `items.mjs` is a small drawing function that paints shapes
 * onto a 64×64 pixel canvas (see `raster.mjs`). This script rasterizes each
 * one, adds the outline, and writes a crisp SVG to `public/objets/<id>.svg`.
 * Run it with `npm run art` after editing an item.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Canvas } from './raster.mjs'
import { ITEMS } from './items.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const outDir = join(root, 'public', 'objets')
mkdirSync(outDir, { recursive: true })

let errors = 0
const only = process.argv.slice(2)
let total = 0
for (const [id, draw] of Object.entries(ITEMS)) {
  if (only.length && !only.includes(id)) continue
  const c = new Canvas()
  try {
    const opts = draw(c) ?? {}
    if (opts.shadow !== false) c.shadow(opts.shadow ?? 0.18)
    if (opts.outline !== false) c.outline()
  } catch (e) {
    console.error(`✗ ${id}: ${e.message}`)
    errors++
    continue
  }
  const svg = c.toSvg()
  writeFileSync(join(outDir, `${id}.svg`), svg)
  total += svg.length
}

// Every item declared in the mocks should have a drawing, and vice versa.
const mockIds = new Set()
for (const file of ['src/mocks/objets.ts', 'src/mocks/objetsBooster.ts']) {
  const src = readFileSync(join(root, file), 'utf8')
  for (const m of src.matchAll(/imageUrl: '\/objets\/([^']+)\.svg'/g)) mockIds.add(m[1])
}
for (const id of mockIds) if (!ITEMS[id]) { console.error(`✗ no drawing for item ${id}`); errors++ }
for (const id of Object.keys(ITEMS)) if (!mockIds.has(id)) console.warn(`! drawing ${id} is not used by any mock item`)

if (errors) {
  console.error(`${errors} error(s)`)
  process.exit(1)
}
console.log(`✓ wrote ${Object.keys(ITEMS).length} sprites (${(total / 1024).toFixed(0)} KB) to public/objets/`)
