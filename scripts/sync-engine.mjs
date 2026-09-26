// Copies the pure engine from the front end into the edge function's shared
// folder, adding the `.ts` extensions Deno needs on relative imports.
// Run after any change in pfc/src/lib/engine: `node scripts/sync-engine.mjs`
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const from = join(root, 'pfc/src/lib/engine')
const to = join(root, 'supabase/functions/_shared/engine')
mkdirSync(to, { recursive: true })

for (const file of readdirSync(from)) {
  if (!file.endsWith('.ts') || file.endsWith('.test.ts')) continue
  const src = readFileSync(join(from, file), 'utf8').replace(/from '(\.\/[a-z]+)'/g, "from '$1.ts'")
  writeFileSync(join(to, file), `// GENERATED from pfc/src/lib/engine/${file} by scripts/sync-engine.mjs. Do not edit.\n${src}`)
}
console.log('engine synced to', to)
