# PFC — Objects at war

Web app skeleton for the **PFC** game: React 19 + Vite + TypeScript + Tailwind CSS v4 on the front end, Supabase for backend/DB.

> Current state: the battle system (deck of 5, Gauntlet duels, practice bot, first-login warm-up, Google sign-in, online duels through Supabase) is implemented, and so is crafting (Little-Alchemy-style recipes, hidden in the database). Boosters are still a mock page owned by the other team.

## Game rules: the Gauntlet

Every item has a **category**, an **attack** and a **defense** value (all three are data owned by the items team: tables `categories`, `category_matchups`, `items`). A battle is 5 cards against 5, no hit points:

1. Both players send a card face down; the flips happen together.
2. **Explicit wins come first.** An item that lists another in `victoiresExplicites` always beats it.
3. **Then the chart.** If the winner's category beats the loser's (`category_matchups`), that is the clash. A pair that is not in the chart, or the same category twice, is neutral.
4. **Neutral matchups use the numbers.** A card breaks through when its attack (plus momentum) is strictly higher than the other card's defense. Exactly one breakthrough wins; both or none is a stand-off.
5. The loser's card is out. The winner's card stays on the field, visible, with **+1 momentum** (added to attack in neutral matchups) per consecutive win.
6. The player without a champion sends a new card, knowing what they face. The other player may **hold**, or **retreat** once per battle: the champion goes back to the hidden hand and another card comes in. Both decisions are revealed together.
7. A stand-off takes **both** cards down. A player with no champion and no cards loses; both empty is a draw. At most 9 turns, 20 s per decision.

Nobody wins or loses cards. A battle produces **points**, which become **boosters** (with a rarity tier), see below.

The engine is pure TypeScript in `src/lib/engine/` (chart, clash, gauntlet, bot, reward) with tests in `engine.test.ts`; the same files are copied into the edge function by `node scripts/sync-engine.mjs`. `src/lib/combat.ts` keeps one-card helpers for the item pages.

### After a battle: points and boosters

| Source | Points |
| --- | --- |
| Win / draw / loss | 100 / 50 / 20 |
| Each card still standing at the end | +15 |
| Comeback (won from your last card) | +30 |
| Momentum streak of 3+ | +20 |
| PvP win streak | +10 % per consecutive win, capped at +50 % |
| First PvP win of the day | +1 booster |
| Practice vs the Coach | everything × 0.5, no streak or daily bonus |

`boosters = floor(points / 50)`; tier `bronze` (< 100 pts), `silver` (100–149), `gold` (150+). The tier is handed to the boosters team through the SQL function `grant_boosters(user, count, tier, source)`, the only hook between the two systems. `profiles.score` adds the points; the leaderboard reads it.

### First login

A signed-in player who has not played the warm-up is sent to `/welcome`: a classic rock-paper-scissors best of three against the Coach, who sees the player's throw and lets them win 2–1. The end screen offers the first booster (`complete_onboarding()` → `grant_boosters(user, 1, 'silver', 'welcome')`) and unlocks the site. Visitors who are not signed in can browse every page.

## Session, sign-in and modes

- **Supabase mode** (env variables set): Google sign-in through Supabase Auth, profile and inventory from the database, live duels through the `battle` edge function and Realtime. Setup steps and the prompts for the teammate who owns the Supabase project are in [`docs/SUPABASE_SETUP.md`](../docs/SUPABASE_SETUP.md).
- **Offline mode** (no `.env`): the four test accounts (`src/mocks/joueurs.ts`), localStorage, the practice battle against the Coach running entirely in the browser. "Continue with Google" signs in as the first test account.
- `useSession()` (`src/lib/session.ts`) exposes `joueur`, `mode`, `chart`, `connecterGoogle()`, `deconnecter()`, `terminerOnboarding()` and `rafraichir()`.

## Prerequisites

- Node.js ≥ 20 (tested with Node 22)
- npm ≥ 10

## Run locally

```bash
cd pfc
npm install
cp .env.example .env      # then fill in your Supabase keys (optional for now)
npm run dev
```

The app is served on <http://localhost:5173> and redirects `/` to `/home`.

Without a `.env`, a warning is printed in the console and the app runs entirely on mocks.

### Other scripts

| Command           | Role                                          |
| ----------------- | --------------------------------------------- |
| `npm run dev`     | Dev server with hot reload                    |
| `npm run build`   | TypeScript check (`tsc -b`) + production build |
| `npm run preview` | Serves the production build locally           |
| `npm run lint`    | Lint with oxlint                              |

## Supabase configuration

The client is created in `src/lib/supabase.ts` from two environment variables (never a hard-coded key):

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key
```

Both are in the Supabase dashboard: **Project Settings → API**.
If they are missing, `supabase` is `null` and `getSupabase()` throws an explicit error.

## Deploying to Vercel

The repository contains two `vercel.json` files:

- `vercel.json` at the root: tells Vercel to build the `pfc/` subfolder (`npm install --prefix pfc`, `npm run build --prefix pfc`, output `pfc/dist`). Works with the **Root Directory** left at the repository root.
- `pfc/vercel.json`: used if you set **Root Directory** to `pfc` in the Vercel project settings.

Both contain the `/(.*) → /index.html` rewrite, required so that react-router routes (`/battle`, `/item/obj-01`…) respond on direct access or refresh; otherwise Vercel returns a 404.

Environment variables to declare in Vercel (**Settings → Environment Variables**) once Supabase is wired up: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. Without them, the site runs on mocks.

## Pages and routes

| Route          | Page                    | Current content                                                        |
| -------------- | ----------------------- | ---------------------------------------------------------------------- |
| `/home`        | `pages/Accueil.tsx`     | Play button, booster stack (x/8), rank preview                         |
| `/battle`      | `pages/battle/Hub.tsx`  | Ranked duel, practice, your deck, how the Gauntlet works                |
| `/battle/deck` | `pages/battle/DeckBuilder.tsx` | Pick the 5 cards, coverage of the chart                          |
| `/battle/opponent` | `pages/battle/OpponentPicker.tsx` | Online players (Presence), challenges, practice           |
| `/battle/:id`  | `pages/battle/Arena.tsx` | Full-screen fight (outside the layout), reveal, result overlay        |
| `/welcome`     | `pages/battle/Welcome.tsx` | First-login warm-up vs the Coach, first booster (full screen)       |
| `/inventory`   | `pages/Inventaire.tsx`  | Grid of owned items, category filter                                   |
| `/item/:id`    | `pages/ObjetDetail.tsx` | Detail page: matchups, description, W/L history (empty for now)        |
| `/boosters`    | `pages/Boosters.tsx`    | Stack (max 8), animated Open button (5 items), 10 min timer            |
| `/crafting`    | `pages/Assemblage.tsx`  | Drag & drop or two clicks; a known recipe consumes both cards and adds the result |
| `/recipes`     | `pages/Recettes.tsx`    | Recipe book: only the recipes of cards the player has owned are revealed |
| `/leaderboard` | `pages/Classement.tsx`  | Score / games / win rate table                                         |
| `/profile`     | `pages/Profil.tsx`      | Sign in to a test account, profile card, switch account                |

## Card art

Item pictures come from the [game-icons.net](https://game-icons.net) library
(CC BY 3.0, authors listed in `public/objets/CREDITS.md`). Each item is mapped
to an icon in `scripts/icons/mapping.json`; the import script copies the icon,
strips its black background and writes `public/objets/<id>.svg`. The card
paints it white on a gradient colored by the item's category.

To change or add a picture, pick an icon name on game-icons.net, edit
`mapping.json`, then:

```bash
git clone --depth 1 https://github.com/game-icons/icons.git ../../game-icons   # once, next to the repo
npm run icons            # all items
npm run icons obj-12     # one item
```

The eight brainrot items keep their own hand-made art and are not in the mapping.

## Code structure

```
pfc/
├── public/objets/        # SVG icons of the base items
├── src/
│   ├── components/       # Shared UI: Layout, Navigation, ObjetCard, Bouton, BadgeCategorie…
│   ├── lib/
│   │   ├── supabase.ts   # Supabase client (env variables)
│   │   ├── session.ts    # Mock session (signed-in account, localStorage)
│   │   ├── engine/       # Battle engine (pure TS, shared with the edge function)
│   │   ├── combat.ts     # One-card helpers over the engine (item pages)
│   │   ├── tutorial.ts   # Rigged warm-up vs the Coach
│   │   ├── auth.ts       # Supabase Auth helpers (Google)
│   │   └── format.ts     # Labels, colors, display helpers
│   ├── services/         # deck, profile, lobby, battle (local + remote)
│   ├── mocks/            # Offline data: 7 items, 4 accounts, leaderboard
│   ├── pages/            # One page per route
│   ├── types/            # Interfaces: Objet, Joueur, EntreeClassement, StackBoosters…
│   ├── App.tsx           # Route table (react-router)
│   ├── main.tsx          # Entry point
│   └── index.css         # Tailwind + theme (@theme tokens) + animations
├── .env.example
└── vite.config.ts        # React + Tailwind plugins, `@/` → `src/` alias
```

Imports use the `@/` alias (e.g. `import { Objet } from '@/types'`).

Identifiers in the code (components, types, variables) are still in French from the original scaffold; all user-facing text and routes are in English.

## Splitting the work

Each page is independent and only shares the components in `src/components`, the types and the mocks. Suggested split for four people:

1. **Battle** (done): engine, deck, lobby, arena, rewards, auth and onboarding (`lib/engine`, `services/`, `pages/battle/`, `supabase/`).
2. **Crafting / Boosters**: crafting recipes, booster draws, persistence of the stack and timer (`pages/Assemblage.tsx`, `pages/Boosters.tsx`).
3. **Data / Supabase**: table schema (items, players, inventories, battles), gradual replacement of mocks with queries (`lib/supabase.ts`, `mocks/`).
4. **Auth / Profile / Social**: Supabase Auth sign-in, editable profile, friend challenge, realtime leaderboard (`pages/Profil.tsx`, `pages/Classement.tsx`).

Crafting: rock, leaf and scissors are infinite base cards (never consumed); any card can fill both slots (a second copy is used when the player has one, otherwise the single copy is consumed once); every other card of the catalog (all 237, expansion included) has at least one recipe in `mocks/recettes.ts` and traces back to them, and every combination of the early cards works (checked by `mocks/recettes.test.ts`: don't loosen it when adding cards, add their recipes). Brainrot cards are set aside in `mocks/objetsBrainrot.ts`: out of boosters, crafting and category filters. After editing it run `node scripts/gen-items-sql.mjs` to regenerate `supabase/migrations/0004_recipes_seed.sql`. In supabase mode the recipes never reach the client: the `craft()` and `recipe_book()` SQL functions (`0003_crafting.sql`) do the lookup and only return the recipes of discovered cards (`discoveries` table). Never import `mocks/recettes.ts` statically from the UI, go through `services/crafting.ts`. The boosters team plugs into `grant_boosters()` (SQL) and inserts `inventory` rows; the items team fills `categories`, `category_matchups` and `items`. No emoji in the UI: use `components/Icon.tsx`.
