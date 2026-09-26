# Supabase setup for the battle system

The front end needs two env variables (`pfc/.env`, and the same two in Vercel):

```
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon / publishable key>
```

Without them the app runs in **offline mode**: mock accounts, the practice
battle against the Coach and the whole UI work, but Google sign-in and live
duels do not.

Everything below is done on the Supabase project. It is written as two
prompts to paste into a Claude session that has the Supabase MCP connected
to the project (the teammate who owns it), plus the manual steps Claude
will walk them through.

---

## Prompt A — Google sign-in, keys, team access (no code needed)

```
You are connected to my Supabase project through the Supabase MCP tools. Set up Google sign-in for our web game "PFC" and give a teammate access. Do the automated steps yourself; for the steps that only the dashboard or Google Cloud can do, give me exact click paths and the exact values to paste. Report at the end.

1. Identify the project: call list_projects, pick the one used for PFC (ask me if several look plausible), then get_project_url and get_publishable_keys. Print the project ref, the project URL and the anon (publishable) key. These two values go in the front-end .env as VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.

2. Google OAuth client (I do this, you guide me). Google Cloud Console → APIs & Services:
   - OAuth consent screen: External, app name "PFC", add our teammates' Gmail addresses as test users while the app is in testing.
   - Credentials → Create credentials → OAuth client ID → Web application, name "PFC Supabase".
   - Authorized JavaScript origins: http://localhost:5173 and our Vercel URL (ask me for it).
   - Authorized redirect URI, exactly: https://<project-ref>.supabase.co/auth/v1/callback (fill in the ref from step 1).
   - I will paste back the Client ID and Client Secret.

3. Supabase Auth (dashboard, guide me): Authentication → Providers → Google → enable, paste Client ID and Client Secret, save. Authentication → URL Configuration: Site URL = the Vercel URL; Redirect URLs: add http://localhost:5173/** and https://<vercel-domain>/**.

4. Team access (dashboard, guide me): Organization settings → Team → Invite: invite <teammate email> as Developer. Tell me to check the invited address matches exactly the email/provider they use to log in to supabase.com, because a mismatch is the usual reason an invite cannot be accepted.

5. Verify: confirm with me that the Google provider shows as enabled and that the redirect URI in Google Cloud matches the project ref. Then print a summary block with: project ref, project URL, anon key, Site URL, redirect URLs, and the invited email. Do not touch the database schema yet; a second prompt will bring a migration file and an edge function to deploy.
```

## Prompt B — schema and edge function (after the branch is pushed)

Paste the contents of the two files where the prompt says so, or point the
Claude session at the repository if it can read it.

```
Same Supabase project as before. Install the battle system's backend. Do it in this order and report each step.

1. Apply the migrations in order with apply_migration: `supabase/migrations/0001_combat.sql` (name: combat_schema), `supabase/migrations/0002_items_seed.sql` (name: items_seed), `supabase/migrations/0003_crafting.sql` (name: crafting) then `supabase/migrations/0004_recipes_seed.sql` (name: recipes_seed). All are idempotent. Whenever the catalog or the recipes change, re-apply `0002`, `0003` and `0004` in that order (`0002` also seeds the categories and the chart, so the items' categories exist; `0003` keeps rock, leaf and scissors infinite in `craft()`). Then list_tables in the public schema and confirm these exist: profiles, categories, category_matchups, items, inventory, decks, challenges, battles, battle_secrets, battle_rewards, booster_credits, recipes, discoveries.

2. Verify Realtime: run `select tablename from pg_publication_tables where pubname = 'supabase_realtime'` with execute_sql and confirm battles and challenges are listed.

3. Deploy the edge function named `battle` with deploy_edge_function. Its entry file is `supabase/functions/battle/index.ts`; it imports `../_shared/engine/*.ts` (seven files in `supabase/functions/_shared/engine/`). Send every one of those files with the deployment, keeping the relative paths. verify_jwt must stay enabled (default). No extra secret is needed: the function uses the SUPABASE_URL, SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY that Supabase injects.

4. Smoke test with execute_sql: `select count(*) from public.categories` (expect 5), `select count(*) from public.category_matchups` (expect 9) and `select count(*) from public.items` (expect 65). Then run get_advisors for security and performance and list anything it flags on the new tables.

5. Existing users: anyone who signed in BEFORE the migration has no profile row. Run
   insert into public.profiles (id, username, avatar_url)
   select u.id, coalesce(nullif(regexp_replace(lower(split_part(u.email,'@',1)),'[^a-z0-9_]','','g'),''),'player') || '_' || left(u.id::text, 4), u.raw_user_meta_data->>'avatar_url'
   from auth.users u where not exists (select 1 from public.profiles p where p.id = u.id);
   and give those users the three base items:
   insert into public.inventory (owner, item_id) select p.id, i.id from public.profiles p cross join public.items i where i.id in ('obj-01','obj-04','obj-07') and not exists (select 1 from public.inventory v where v.owner = p.id);

6. Print a summary: tables created, realtime tables, function URL, advisor warnings.
```

---

## What the other teams plug into

- **Items team**: `categories` (slug, label, color, verb), `category_matchups`
  (winner, loser: a missing pair is neutral) and `items` (category, attack,
  defense, explicit_wins, art). The seed comes from the front-end mocks
  through `node --experimental-strip-types scripts/gen-items-sql.mjs`; the
  battle engine reads the tables at battle time, nothing to change in code.
- **Boosters team**: `grant_boosters(user, count, tier, source)` is called
  after every battle and once at the end of the warm-up (`complete_onboarding`).
  Replace its body with the real booster credit. `tier` is `bronze`, `silver`
  or `gold` and should drive the rarity odds. Inventory copies are rows in
  `inventory` (one per card).
- **Crafting / recipes**: the `recipes` table (`item_a`, `item_b` → `result`,
  canonical `item_a <= item_b`) has no direct SELECT policy on purpose — it's
  only readable through two RPCs, both `security definer` and granted to
  `authenticated` only:
  - `recipe_book()` returns `{ total, recipes: [...] }`, where `recipes` is
    the caller's own discovered pairs only (from the `discoveries` table,
    filled by the `on_inventory_insert_discover` trigger on every inventory
    insert — booster pull or craft result alike). Undiscovered pairs never
    reach the client.
  - `craft(p_a, p_b)` takes two of the caller's own **inventory row ids**
    (not catalog item ids), deletes them and inserts the result in one
    transaction if a recipe matches, raising `not_authenticated`,
    `two_cards_needed`, `card_not_owned` or `no_recipe` otherwise.
  Front end: `pfc/src/services/crafting.ts` wraps both RPCs;
  `SessionProvider`'s `crafter()`/`decouvertes` call them in supabase mode
  and fall back to `mocks/recettes.ts` + localStorage in mock mode. The base
  cards (`obj-01`/`04`/`07`) are infinite: `craft()` never consumes them, so
  a single owned copy can fill both slots.

## Online checklist (once the keys are in place)

1. Two browsers, two Google accounts, both land on `/welcome`, both win 2–1
   and see the booster screen.
2. Each builds a deck of 5 on `/battle/deck`.
3. A challenges B on `/battle/opponent`; B sees the incoming card; B accepts;
   both are sent to `/battle/<id>`.
4. Moves lock and reveal together; a player who stops answering can be
   forced after 30 s (the client calls `timeout`).
5. The result overlay shows the same turns on both sides; `profiles.score`
   and `battle_rewards` are updated; `booster_credits` has the new rows.
