# PFC — Pierre Feuille Ciseaux évolué

Squelette de l'application web du jeu **PFC** : React 19 + Vite + TypeScript + Tailwind CSS v4 côté front, Supabase côté backend/DB.

> État actuel : navigation fonctionnelle entre toutes les pages, données **mock** uniquement.
> Pas encore de logique de combat réel, de crafting ni d'authentification.

## Prérequis

- Node.js ≥ 20 (testé avec Node 22)
- npm ≥ 10

## Lancer le projet en local

```bash
cd pfc
npm install
cp .env.example .env      # puis renseignez vos clés Supabase (facultatif pour l'instant)
npm run dev
```

L'app est servie sur <http://localhost:5173> et redirige `/` vers `/accueil`.

Sans `.env`, un avertissement s'affiche en console et l'app tourne entièrement sur les mocks.

### Autres scripts

| Commande          | Rôle                                             |
| ----------------- | ------------------------------------------------ |
| `npm run dev`     | Serveur de dev avec rechargement à chaud         |
| `npm run build`   | Vérification TypeScript (`tsc -b`) + build prod  |
| `npm run preview` | Sert le build de production localement           |
| `npm run lint`    | Lint avec oxlint                                 |

## Configuration Supabase

Le client est créé dans `src/lib/supabase.ts` à partir de deux variables d'environnement (jamais de clé en dur) :

```
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-cle-anon-publique
```

Elles se trouvent dans le dashboard Supabase : **Project Settings → API**.
Si elles sont absentes, `supabase` vaut `null` et `getSupabase()` lève une erreur explicite.

## Pages et routes

| Route          | Page                    | Contenu actuel                                                     |
| -------------- | ----------------------- | ------------------------------------------------------------------ |
| `/accueil`     | `pages/Accueil.tsx`     | Bouton Jouer, stack de boosters (x/10), aperçu du rang             |
| `/combat`      | `pages/Combat.tsx`      | Sélection d'un objet, objet adverse mock, bouton Attaquer, résultat |
| `/inventaire`  | `pages/Inventaire.tsx`  | Grille des objets possédés, filtre par catégorie                   |
| `/objet/:id`   | `pages/ObjetDetail.tsx` | Fiche détail : stats, description, historique V/D mock             |
| `/boosters`    | `pages/Boosters.tsx`    | Stack (max 10), bouton Ouvrir animé, timer 10 min                  |
| `/assemblage`  | `pages/Assemblage.tsx`  | Drag & drop ou deux clics, résultat mock réussi/impossible         |
| `/classement`  | `pages/Classement.tsx`  | Tableau score / parties / ratio                                    |
| `/profil`      | `pages/Profil.tsx`      | Carte de profil, meilleurs objets, bouton Défier un ami            |

## Structure du code

```
pfc/
├── public/objets/        # Icônes SVG des objets mock
├── src/
│   ├── components/       # UI partagée : Layout, Navigation, ObjetCard, Bouton, StatBadge…
│   ├── lib/
│   │   ├── supabase.ts   # Client Supabase (variables d'env)
│   │   └── format.ts     # Libellés, couleurs, helpers d'affichage
│   ├── mocks/            # Données factices : 12 objets, 8 joueurs, classement, historique
│   ├── pages/            # Une page par route
│   ├── types/            # Interfaces : Objet, Joueur, EntreeClassement, StackBoosters…
│   ├── App.tsx           # Table des routes (react-router)
│   ├── main.tsx          # Point d'entrée
│   └── index.css         # Tailwind + thème (tokens @theme) + animations
├── .env.example
└── vite.config.ts        # Plugins React + Tailwind, alias `@/` → `src/`
```

Les imports utilisent l'alias `@/` (ex. `import { Objet } from '@/types'`).

## Se répartir le travail

Chaque page est indépendante et ne partage que les composants de `src/components`, les types et les mocks. Pistes de découpage à 4 :

1. **Combat** : règles pierre/feuille/ciseaux + stats, matchmaking, résultat réel (`pages/Combat.tsx`, futur `lib/combat.ts`).
2. **Crafting / Boosters** : recettes d'assemblage, tirage des boosters, persistance du stack et du timer (`pages/Assemblage.tsx`, `pages/Boosters.tsx`).
3. **Données / Supabase** : schéma des tables (objets, joueurs, inventaires, combats), remplacement progressif des mocks par des requêtes (`lib/supabase.ts`, `mocks/`).
4. **Auth / Profil / Social** : connexion Supabase Auth, profil éditable, défi d'un ami, classement temps réel (`pages/Profil.tsx`, `pages/Classement.tsx`).

Les fonctions `resultatMock` (Combat) et `assemblerMock` (Assemblage) sont les points d'entrée à remplacer par la vraie logique.
