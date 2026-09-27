# Vidéo de démo

[`demo.mp4`](./demo.mp4) : 2 min 56, 1280×720, muette, avec sous-titres incrustés en français.
Filmée en **mode hors ligne** (sans Supabase), donc sans vrai login Google ni duel entre deux joueurs :
pour la partie PvP, enregistrez 20 s sur deux écrans et collez-les au montage.

Le tirage du booster et le combat contre le Coach sont fixés (graines aléatoires) pour que la démo
tombe toujours bien : booster rare → épique → épique → **secret rare (Railgun)**, puis une victoire
en 7 tours gagnée avec la dernière carte (comeback + série de momentum).

## Déroulé et voix off

| Temps | À l'écran | Proposition de voix off |
| --- | --- | --- |
| 0:00 | Écran titre | « Tout le monde connaît pierre-feuille-ciseaux. Le problème, c'est que c'est du pur hasard. On en a fait un jeu de cartes à collectionner. » |
| 0:05 | Connexion | « On se connecte avec son compte Google… » |
| 0:10 | Échauffement contre le Coach | « …et on commence par ce que tout le monde sait faire : un pierre-feuille-ciseaux classique contre le Coach. Zéro règle à apprendre. » |
| 0:24 | Victoire 2-1, premier booster | « Le Coach nous laisse gagner, et on reçoit notre premier booster. » |
| 0:28 | Ouverture du booster | « On le déchire comme un vrai paquet. Les cartes sont triées par rareté : plus elle est rare, plus elle tourne lentement… et la dernière est une secrète rare. » |
| 0:58 | Crafting | « Deuxième mécanique : le crafting, façon Little Alchemy. Pierre plus pierre donne une brique ; brique plus pierre, un menhir. Il y a 248 objets et 266 recettes, et tout remonte à pierre, feuille et ciseaux. » |
| 1:17 | Livre de recettes | « Chaque découverte débloque sa recette. En ligne, les recettes restent sur le serveur : impossible de tricher. » |
| 1:22 | Hub combat et deck | « Place au combat. On choisit cinq cartes ; l'outil montre quelles catégories on bat et à quoi on est faible. » |
| 1:40 | Arène | « Les deux joueurs posent une carte face cachée, révélées en même temps. D'abord le tableau des catégories, sinon l'attaque contre la défense. Le gagnant reste sur le terrain et prend du momentum ; on peut le garder ou battre en retraite une fois par partie. » |
| 2:45 | Victoire | « Victoire avec la dernière carte. Chaque combat rapporte des points, convertis en boosters. En ligne, c'est la même chose en duel temps réel contre d'autres joueurs, avec un classement. » |
| 2:51 | Écran de fin | « RPS : compris en trois secondes, stratégique en cinq minutes. Merci ! » |

## Régénérer la vidéo

Le script [`record-demo.mjs`](./record-demo.mjs) pilote l'app avec Playwright (curseur visible,
sous-titres, écrans titre), capture les images via le screencast de Chrome et encode en MP4 avec ffmpeg.

```bash
cd pfc && npm run build && npx vite preview --port 4173   # sans .env : mode hors ligne
# dans un autre terminal, à la racine du repo :
npm i --no-save playwright && npx playwright install chromium
node docs/demo/record-demo.mjs          # écrit frames/ puis demo.mp4
node docs/demo/record-demo.mjs --dry    # répétition rapide, captures dans shots/
```

Options : `--booster N` (graine du tirage, 73 par défaut), `--battle N` (graine du combat),
variables `BASE_URL`, `CHROME_PATH`, `FFMPEG`. Les sous-titres et le rythme se modifient
directement dans le script. Si l'UI change (libellés de boutons, pages), il faudra adapter les sélecteurs.
