// Generates supabase/migrations/0002_items_seed.sql from the front-end catalog
// (pfc/src/mocks/objets.ts + objetsBooster.ts), so the database matches the
// items team's data, and 0004_recipes_seed.sql from pfc/src/mocks/recettes.ts. Run from the repository root: node scripts/gen-items-sql.mjs
import { writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const require = createRequire(join(root, 'pfc/package.json'))
const { rolldown } = require('rolldown')

// Bundle the catalog with rolldown (resolves the `@/` alias and strips types).
async function charger(fichier) {
  const bundle = await rolldown({
    input: join(root, fichier),
    resolve: { alias: { '@': join(root, 'pfc/src') } },
    logLevel: 'silent',
  })
  const { output } = await bundle.generate({ format: 'esm' })
  await bundle.close()
  return import(`data:text/javascript;base64,${Buffer.from(output[0].code).toString('base64')}`)
}
const { OBJETS_MOCK, CATALOGUE_MOCK } = await charger('pfc/src/mocks/objets.ts')
const { RECETTES } = await charger('pfc/src/mocks/recettes.ts')
const { DEFAULT_CHART } = await charger('pfc/src/lib/engine/chart.ts')
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

// Categories and the chart come from DEFAULT_CHART (pfc/src/lib/engine/chart.ts),
// so every item's category exists before the items are inserted.
const couleurs = { fight: '#fb7185', plantes: '#34d399', ressources: '#f59e0b', espace: '#818cf8', animaux: '#fb923c', vehicules: '#22d3ee' }
const categories = Object.keys(DEFAULT_CHART.beats).map(
  (slug) =>
    `  (${q(slug)}, ${q(DEFAULT_CHART.labels?.[slug] ?? slug)}, ${couleurs[slug] ? q(couleurs[slug]) : 'null'}, ${q(DEFAULT_CHART.verbs?.[slug] ?? 'beats')})`,
)
const matchups = Object.entries(DEFAULT_CHART.beats).flatMap(([gagnant, perdants]) =>
  perdants.map((perdant) => `  (${q(gagnant)}, ${q(perdant)})`),
)

const sql = `-- PFC · items catalog seed, GENERATED from pfc/src/mocks by scripts/gen-items-sql.mjs.
-- Re-run the script after the items team changes the catalog; the insert is idempotent.

-- Categories and chart, from DEFAULT_CHART (pfc/src/lib/engine/chart.ts). Categories
-- no longer in the chart are kept (owned cards may still use them) but lose their matchups.
insert into public.categories (slug, label, color, verb) values
${categories.join(',\n')}
on conflict (slug) do update set label = excluded.label, color = excluded.color, verb = excluded.verb;

delete from public.category_matchups where (winner, loser) not in (values
${matchups.join(',\n')}
);
insert into public.category_matchups (winner, loser) values
${matchups.join(',\n')}
on conflict do nothing;

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

// Recipes: pair stored sorted (item_a <= item_b), see 0003_crafting.sql.
const lignesRecettes = RECETTES.map((r) => {
  const [a, b] = [...r.ingredients].sort()
  return `  (${q(a)}, ${q(b)}, ${q(r.resultatId)})`
})
const sqlRecettes = `-- PFC · crafting recipes seed, GENERATED from pfc/src/mocks/recettes.ts by scripts/gen-items-sql.mjs.
-- Re-run the script after changing the recipes. Recipes no longer in the file are removed.

-- An item can have several recipes (older databases had a unique result).
alter table public.recipes drop constraint if exists recipes_result_key;

delete from public.recipes where (item_a, item_b) not in (values
${lignesRecettes.map((l) => l.replace(/, '[^']*'\)$/, ')')).join(',\n')}
);

insert into public.recipes (item_a, item_b, result) values
${lignesRecettes.join(',\n')}
on conflict (item_a, item_b) do update set result = excluded.result;
`
writeFileSync(join(root, 'supabase/migrations/0004_recipes_seed.sql'), sqlRecettes)
console.log(`${lignesRecettes.length} recipes written to supabase/migrations/0004_recipes_seed.sql`)
