#!/usr/bin/env node
/**
 * Imports the item pictures from the game-icons.net library (CC BY 3.0).
 *
 * `mapping.json` maps each item id to an icon name. This script finds the
 * icon in a local clone of https://github.com/game-icons/icons (path in
 * GAME_ICONS_DIR, default ../game-icons next to the repo), strips the
 * black background square, keeps the white glyph, and writes
 * public/objets/<id>.svg. It also writes public/objets/CREDITS.md.
 *
 *   git clone --depth 1 https://github.com/game-icons/icons.git ../game-icons
 *   npm run icons              # all items
 *   npm run icons obj-12       # one item
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const lib = process.env.GAME_ICONS_DIR ?? join(root, '..', '..', 'game-icons')
const outDir = join(root, 'public', 'objets')
const mapping = JSON.parse(readFileSync(join(root, 'scripts', 'icons', 'mapping.json'), 'utf8'))
const only = process.argv.slice(2)

// Index the library once: icon name -> file path.
const index = new Map()
const walk = (dir) => {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f)
    if (statSync(p).isDirectory()) walk(p)
    else if (f.endsWith('.svg') && !index.has(f.slice(0, -4))) index.set(f.slice(0, -4), p)
  }
}
walk(lib)

const clean = (svg) =>
  svg
    .replace(/<path d="M0 0h512v512H0z"[^>]*\/?>(<\/path>)?/g, '')
    .replace(/<path[^>]*d="M0 0h512v512H0z"[^>]*\/?>(<\/path>)?/g, '')
    .replace(/<circle cx="128" cy="128" r="128"\/>/g, '')
    // Badge-style icons draw an unfilled <circle>; without a fill it paints black.
    .replace(/<circle (?![^>]*fill=)/g, '<circle fill="none" ')
    .replace(/\s(class|style)=""/g, '')
    .replace(/fill="#fff"/g, 'fill="#ffffff"')

let n = 0
const credits = new Map()
for (const [id, { name, icon }] of Object.entries(mapping)) {
  if (only.length && !only.includes(id)) continue
  const src = index.get(icon)
  if (!src) {
    console.error(`✗ ${id} (${name}): icon "${icon}" not found in ${lib}`)
    process.exitCode = 1
    continue
  }
  writeFileSync(join(outDir, `${id}.svg`), clean(readFileSync(src, 'utf8')))
  credits.set(icon, src.slice(lib.length + 1).split('/')[0])
  n++
}

if (!only.length) {
  const lines = [...credits.entries()].sort().map(([icon, author]) => `- ${icon} — ${author}`)
  writeFileSync(
    join(outDir, 'CREDITS.md'),
    `# Item icon credits\n\nItem pictures come from [game-icons.net](https://game-icons.net), licensed CC BY 3.0.\nIcon — author:\n\n${lines.join('\n')}\n`,
  )
}
console.log(`✓ imported ${n} icons from game-icons`)
