# PFC — Rock Paper Scissors, evolved

Web app skeleton for the **PFC** game: React 19 + Vite + TypeScript + Tailwind CSS v4 on the front end, Supabase for backend/DB.

> Current state: working navigation between every page, **mock** data only.
> No real matchmaking, crafting or authentication yet.

## Game rules

Each item belongs to a category. An item simply **wins or loses** against another based on its category, exactly like rock-paper-scissors. There are no attack or defense stats.

| Category | Beats                       | Loses to |
| -------- | --------------------------- | -------- |
| Rock     | Scissors                    | Paper    |
| Paper    | Rock                        | Scissors |
| Scissors | Paper                       | Rock     |
| Special  | Rock, Paper, Scissors       | nothing  |

Two items of the same category are a draw. The rules live in `src/lib/combat.ts` (`BEATS`, `resoudreCombat`).

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

## Pages and routes

| Route          | Page                    | Current content                                                  |
| -------------- | ----------------------- | ---------------------------------------------------------------- |
| `/home`        | `pages/Accueil.tsx`     | Play button, booster stack (x/10), rank preview                  |
| `/battle`      | `pages/Combat.tsx`      | Pick an item, mock opponent item, Attack button, result          |
| `/inventory`   | `pages/Inventaire.tsx`  | Grid of owned items, category filter                             |
| `/item/:id`    | `pages/ObjetDetail.tsx` | Detail page: matchups, description, mock W/L history             |
| `/boosters`    | `pages/Boosters.tsx`    | Stack (max 10), animated Open button, 10 min timer               |
| `/crafting`    | `pages/Assemblage.tsx`  | Drag & drop or two clicks, mock success/failure result           |
| `/leaderboard` | `pages/Classement.tsx`  | Score / games / win rate table                                   |
| `/profile`     | `pages/Profil.tsx`      | Profile card, best items, Challenge a friend button              |

## Code structure

```
pfc/
├── public/objets/        # SVG icons of the mock items
├── src/
│   ├── components/       # Shared UI: Layout, Navigation, ObjetCard, Bouton, BadgeCategorie…
│   ├── lib/
│   │   ├── supabase.ts   # Supabase client (env variables)
│   │   ├── combat.ts     # Rock-paper-scissors rules
│   │   └── format.ts     # Labels, colors, display helpers
│   ├── mocks/            # Fake data: 12 items, 8 players, leaderboard, history
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

1. **Battle**: matchmaking, real results on top of `lib/combat.ts`, score updates (`pages/Combat.tsx`).
2. **Crafting / Boosters**: crafting recipes, booster draws, persistence of the stack and timer (`pages/Assemblage.tsx`, `pages/Boosters.tsx`).
3. **Data / Supabase**: table schema (items, players, inventories, battles), gradual replacement of mocks with queries (`lib/supabase.ts`, `mocks/`).
4. **Auth / Profile / Social**: Supabase Auth sign-in, editable profile, friend challenge, realtime leaderboard (`pages/Profil.tsx`, `pages/Classement.tsx`).

`assemblerMock` (Crafting) is the entry point to replace with the real crafting logic.
