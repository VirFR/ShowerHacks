// Generates supabase/migrations/0002_items_seed.sql from the front-end catalog
// (pfc/src/mocks/objets.ts + objetsBooster.ts), so the database matches the
// items team's data. Run from the repository root: node scripts/gen-items-sql.mjs
import { writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const require = createRequire(join(root, 'pfc/package.json'))
const { rolldown } = require('rolldown')

// Bundle the catalog with rolldown (resolves the `@/` alias and strips types).
const bundle = await rolldown({
  input: join(root, 'pfc/src/mocks/objets.ts'),
  resolve: { alias: { '@': join(root, 'pfc/src') } },
  logLevel: 'silent',
})
const { output } = await bundle.generate({ format: 'esm' })
await bundle.close()
const { OBJETS_MOCK, CATALOGUE_MOCK } = await import(`data:text/javascript;base64,${Buffer.from(output[0].code).toString('base64')}`)
const OBJETS_BOOSTER_MOCK = CATALOGUE_MOCK.slice(OBJETS_MOCK.length)

const RARITY = { commun: 'common', peu_commun: 'uncommon', rare: 'rare', epique: 'epic', legendaire: 'legendary', secret_rare: 'secret_rare' }
const q = (s) => `'${String(s).replace(/'/g, "''")}'`

const rows = [...OBJETS_MOCK, ...OBJETS_BOOSTER_MOCK].map((o) =>
  '  (' +
  [
    q(o.id),
    q(o.nom),
    q(o.categorie),
    o.attaque,
    o.defense,
    q(o.imageUrl),
    q(RARITY[o.rarete] ?? 'common'),
    o.description ? q(o.description) : 'null',
    o.victoiresExplicites?.length ? `array[${o.victoiresExplicites.map(q).join(', ')}]::text[]` : 'null',
  ].join(', ') +
  ')',
)

const sql = `-- PFC · items catalog seed, GENERATED from pfc/src/mocks by scripts/gen-items-sql.mjs.
-- Re-run the script after the items team changes the catalog; the insert is idempotent.

insert into public.items (id, name, category, attack, defense, image_url, rarity, description, explicit_wins) values
${rows.join(',\n')}
on conflict (id) do update set
  name = excluded.name,
  category = excluded.category,
  attack = excluded.attack,
  defense = excluded.defense,
  image_url = excluded.image_url,
  rarity = excluded.rarity,
  description = excluded.description,
  explicit_wins = excluded.explicit_wins;
`
writeFileSync(join(root, 'supabase/migrations/0002_items_seed.sql'), sql)
console.log(`${rows.length} items written to supabase/migrations/0002_items_seed.sql`)
