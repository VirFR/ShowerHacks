#!/usr/bin/env node
/**
 * Pixel-art generator for item pictures.
 *
 * Every item in `sprites.mjs` is a 16×16 grid of palette letters ('.' is
 * transparent). This script turns each grid into a crisp SVG in
 * `public/objets/<id>.svg` (horizontal runs of the same color are merged
 * into one <rect>). Run it with `npm run art` after editing a sprite.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { PALETTE, SPRITES, SIZE } from './sprites.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const outDir = join(root, 'public', 'objets')
mkdirSync(outDir, { recursive: true })

let errors = 0
const fail = (msg) => {
  console.error(`✗ ${msg}`)
  errors++
}

function toSvg(id, rows, palette) {
  if (rows.length !== SIZE) fail(`${id}: expected ${SIZE} rows, got ${rows.length}`)
  const rects = []
  rows.forEach((row, y) => {
    if (row.length !== SIZE) fail(`${id}: row ${y + 1} has ${row.length} columns ("${row}")`)
    let x = 0
    while (x < row.length) {
      const ch = row[x]
      let w = 1
      while (x + w < row.length && row[x + w] === ch) w++
      if (ch !== '.') {
        const fill = palette[ch]
        if (!fill) fail(`${id}: unknown palette letter "${ch}" at row ${y + 1}, col ${x + 1}`)
        rects.push(`<rect x="${x}" y="${y}" width="${w}" height="1" fill="${fill}"/>`)
      }
      x += w
    }
  })
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SIZE} ${SIZE}" shape-rendering="crispEdges">` +
    rects.join('') +
    `</svg>\n`
  )
}

for (const [id, sprite] of Object.entries(SPRITES)) {
  const palette = { ...PALETTE, ...(sprite.palette ?? {}) }
  const svg = toSvg(id, sprite.rows, palette)
  writeFileSync(join(outDir, `${id}.svg`), svg)
}

// Every item declared in the mocks should have a sprite, and vice versa.
const mockIds = new Set()
for (const file of ['src/mocks/objets.ts', 'src/mocks/objetsBooster.ts']) {
  const src = readFileSync(join(root, file), 'utf8')
  for (const m of src.matchAll(/imageUrl: '\/objets\/([^']+)\.svg'/g)) mockIds.add(m[1])
}
for (const id of mockIds) if (!SPRITES[id]) fail(`no sprite for item ${id}`)
for (const id of Object.keys(SPRITES)) if (!mockIds.has(id)) console.warn(`! sprite ${id} is not used by any mock item`)

if (errors) {
  console.error(`${errors} error(s)`)
  process.exit(1)
}
console.log(`✓ wrote ${Object.keys(SPRITES).length} sprites to public/objets/`)
