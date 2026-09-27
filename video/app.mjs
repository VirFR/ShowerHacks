// Films the real app, scene by scene, into clips/*.mp4.
import fs from 'fs';
import { launch } from './rec.mjs';

const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null;
const want = (n) => !ONLY || ONLY.includes(n);

const catalog = JSON.parse(fs.readFileSync('catalog.json', 'utf8'));
const BASES = [
  { nom: 'Mossy Rock', categorie: 'ressources', rarete: 'commun', attaque: 4, defense: 7 },
  { nom: 'Oak Leaf', categorie: 'plantes', rarete: 'commun', attaque: 3, defense: 5 },
  { nom: 'Rusty Scissors', categorie: 'fight', rarete: 'commun', attaque: 5, defense: 3 },
];
const BY_NAME = new Map([...catalog, ...BASES].map((o) => [o.nom, o]));
const RP = { commun: 10, peu_commun: 20, rare: 30, epique: 40, legendaire: 50, secret_rare: 60 };
const CYCLE = ['fight', 'animaux', 'plantes', 'ressources', 'vehicules', 'espace'];
const NET = { 0: 0, 1: 22, 2: 17, 3: 0 };
const bonus = (a, b) => { const d = (CYCLE.indexOf(b) - CYCLE.indexOf(a) + 6) % 6; return d <= 3 ? NET[d] : -NET[6 - d]; };
const score = (card, enemy, mom = 0) => RP[card.rarete] + (enemy ? bonus(card.categorie, enemy.categorie) : 0) + mom;

const PACK = ['Hot Air Balloon', 'Neutron Star', 'Chainsaw', 'Uranium Ore', 'Tyrannosaurus Rex'];
const DECK = ['Tyrannosaurus Rex', 'Uranium Ore', 'Chainsaw', 'Neutron Star', 'Hot Air Balloon'];

const r = await launch({ fresh: !process.env.KEEP });
const { p, wait, cap, uncap, tag, clickLoc, clickAt, moveTo, btn, goto } = r;

// ---------- 1. Sign in + warm-up ----------
if (want('welcome')) {
  await goto('/profile', 900);
  await r.start('02_welcome');
  r.capTop = false;
  await tag('1', 'Premier login');
  await cap('Connecte-toi avec <b>Google</b>… et c\'est parti', '', 1300);
  await clickLoc(p.getByText('virgile').first(), 600, 1400);
  r.capTop = true;
  await cap('Échauffement : un <b>pierre-feuille-ciseaux</b> classique', 'Contre le Coach, en 2 manches gagnantes', 900);
  for (const [i, t] of ['Paper', 'Scissors', 'Rock'].entries()) {
    await clickLoc(btn(new RegExp('^' + t)), 380, 900);
    await clickLoc(btn(/Next|See my reward/), 380, 450);
  }
  await cap('Gagné ! Ta récompense : ton <b>premier booster</b>', '', 600);
  await clickLoc(btn(/Claim it/), 400, 1300);
  await uncap();
  await clickLoc(btn(/Open my booster/), 450, 600);
  r.capTop = false;
  await r.stop();
}

// ---------- 2. Boosters ----------
if (want('boosters')) {
  if (!p.url().includes('/boosters')) await goto('/boosters', 800);
  await wait(500);
  await r.start('04_boosters');
  await tag('2', 'Boosters');
  await cap('<b>5 cartes</b> par booster', 'Un nouveau booster toutes les 10 min · jusqu\'à 8 en stock', 1600);
  // Flip the pack to show the odds on the back
  const pack = p.locator('[role=button][aria-label*="flip" i], [role=button][aria-label*="booster" i]').first();
  if (await pack.count()) {
    await clickLoc(pack, 450, 200);
    await cap('6 raretés : de <b>Commune</b> à <b>Secret Rare</b>', 'Plus c\'est rare, plus c\'est fort', 1900);
    await clickLoc(pack, 300, 500);
  }
  await cap('Déchire le paquet !', '', 300);
  // Rig this pack only, so the reveal climbs up to a Legendary.
  await p.evaluate(async (names) => {
    const m = await import('/src/mocks/objetsBooster.ts');
    const all = m.OBJETS_BOOSTER_MOCK;
    const CUM = { commun: [0, 45], peu_commun: [45, 73], rare: [73, 88], epique: [88, 96], legendaire: [96, 99], secret_rare: [99, 100] };
    const q = [];
    for (const n of names) {
      const o = all.find((x) => x.nom === n);
      const [lo, hi] = CUM[o.rarete];
      q.push(((lo + hi) / 2) / 100);
      const pool = all.filter((x) => x.rarete === o.rarete);
      q.push((pool.indexOf(o) + 0.5) / pool.length);
    }
    const orig = Math.random;
    Math.random = () => (q.length ? q.shift() : orig());
  }, PACK);
  const strip = p.locator('[role=button][aria-label^="Tear strip"]').first();
  const bb = await strip.boundingBox();
  await moveTo(bb.x + bb.width - 12, bb.y + bb.height / 2, 450);
  await p.mouse.down();
  for (let i = 1; i <= 40; i++) { await p.mouse.move(bb.x + bb.width - 12 - i * 3.5, bb.y + bb.height / 2 + Math.sin(i / 4) * 2); await wait(16); }
  await p.mouse.up();
  r.pos = { x: bb.x + bb.width - 12 - 140, y: bb.y + bb.height / 2 };
  await uncap();
  await wait(1200);
  const caps = [
    ['Commune…', ''],
    ['Peu commune…', ''],
    ['<b>Rare</b> !', ''],
    ['<b>Épique</b> !!', ''],
  ];
  for (let i = 0; i < 4; i++) {
    await cap(...caps[i]);
    await wait(i < 2 ? 900 : 1300);
    await clickAt(760, 360, 300, 400);
  }
  await cap('<b>LÉGENDAIRE !!!</b>', 'Tyrannosaurus Rex rejoint ta collection');
  await wait(4200);
  await clickAt(760, 360, 300, 900);
  await uncap();
  await wait(900);
  await r.stop();
}

// ---------- 3. Card anatomy close-up (inventory) ----------
if (want('inventory')) {
  await goto('/item/' + catalog.find((o) => o.nom === 'Tyrannosaurus Rex').id, 900);
  await r.start('06_item');
  await tag('3', 'Tes cartes');
  await cap('Chaque carte : une <b>catégorie</b>, une <b>rareté</b>,', 'une <b>attaque</b> et une <b>défense</b>', 2600);
  await r.scrollBy(260, 700);
  await cap('Sa fiche : stats, <b>recette</b> et historique de combats', '', 2200);
  await uncap();
  await r.stop();
}

// ---------- 4. Deck builder ----------
if (want('deck')) {
  await goto('/battle', 700);
  await r.start('08_deck');
  await tag('4', 'Ton deck');
  await cap('Prépare un <b>deck de 5 cartes</b>', '', 700);
  await clickLoc(btn(/Build your deck/), 450, 900);
  for (const n of DECK) {
    const card = p.getByRole('button', { name: new RegExp(n) }).last();
    await clickLoc(card, 320, 250);
    await r.scrollBy(0, 1);
  }
  await p.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  await wait(500);
  await cap('Varie les <b>catégories</b> :', 'l\'adversaire voit ton champion et va le contrer !', 2400);
  await clickLoc(btn(/Save · Choose opponent/), 450, 900);
  await cap('Duel <b>classé en ligne</b> contre un joueur…', '…ou entraînement contre le <b>Coach</b>', 1800);
  await uncap();
  await r.stop();
}

// ---------- 5. Battle ----------
async function readSide(label) {
  // Card names shown right before "THEIR CHAMPION" / "YOUR CHAMPION".
  const text = await p.locator('main').innerText().catch(() => '');
  const lines = text.split('\n').map((s) => s.trim()).filter(Boolean);
  const idx = lines.indexOf(label);
  if (idx < 0) return null;
  const start = label === 'YOUR CHAMPION' ? lines.indexOf('THEIR CHAMPION') + 1 : 0;
  for (let i = idx - 1; i >= start; i--) if (BY_NAME.has(lines[i])) return BY_NAME.get(lines[i]);
  return null;
}
async function handNames() {
  const out = [];
  for (const n of DECK) if (await p.getByRole('button', { name: new RegExp(n) }).count()) out.push(n);
  return out;
}

if (want('battle')) {
  let won = false;
  for (let attempt = 0; attempt < 6 && !won; attempt++) {
    await goto('/battle/opponent', 700);
    await r.start('10_battle');
    r.capTop = 6;
    await tag('5', 'Le combat');
    await clickLoc(btn(/Start practice/), 400, 1200);
    let retreated = false, turn = 0, shownHold = false, shownKnown = false;
    while (turn < 10) {
      turn++;
      const holdBtn = await p.getByRole('button', { name: /^Hold/ }).count();
      const enemy = await readSide('THEIR CHAMPION');
      if (!holdBtn) {
        const hand = await handNames();
        let pick = hand[0];
        if (turn === 1) {
          pick = hand.includes('Chainsaw') ? 'Chainsaw' : hand[0];
          await cap('Les deux joueurs posent une carte <b>face cachée</b>', 'Révélation en même temps', 0);
        } else if (enemy) {
          pick = hand.slice().sort((a, b) => score(BY_NAME.get(b), enemy) - score(BY_NAME.get(a), enemy))[0];
          if (!shownKnown) { shownKnown = true; await cap('Ta carte est tombée : tu renvoies en <b>connaissant</b> son champion', 'Choisis le bon contre !', 0); }
        }
        await wait(turn === 1 ? 1300 : 900);
        await clickLoc(p.getByRole('button', { name: new RegExp(pick) }).first(), 380, 300);
        await clickLoc(btn(/^Send/), 380, 200);
      } else {
        // I have a champion on the field: hold, or retreat once for the show.
        const mine = await readSide('YOUR CHAMPION');
        const hand = await handNames();
        const best = hand.slice().sort((a, b) => RP[BY_NAME.get(b).rarete] - RP[BY_NAME.get(a).rarete])[0];
        if (!retreated && best && mine && RP[BY_NAME.get(best).rarete] > RP[mine.rarete] + 10) {
          retreated = true;
          await cap('Ton champion reste <b>visible</b>. Tu peux le garder…', '…ou <b>battre en retraite</b> 1 fois : le bluff !', 1500);
          await clickLoc(btn(/^Retreat$/), 380, 300);
          await clickLoc(p.getByRole('button', { name: new RegExp(best) }).first(), 380, 300);
          await clickLoc(btn(/^Retreat to/), 380, 200);
        } else {
          if (!shownHold) { shownHold = true; await cap('Ton champion a gagné : il <b>reste</b> sur le terrain', 'Tu le gardes ? <b>Hold</b> !', 1200); }
          else await wait(500);
          await clickLoc(btn(/^Hold/), 380, 200);
        }
      }
      const cont = p.getByRole('button', { name: /Continue|See the result/ });
      await cont.first().waitFor({ timeout: 30000 });
      if (turn === 1) { await wait(600); await cap('Le plus de <b>points de combat</b> gagne', 'Rareté + catégorie + élan · jamais de match nul', 2600); }
      else if (turn === 2) { await wait(500); await cap('Le perdant sort. Le gagnant reste avec <b>+1 d\'élan</b>', 'Enchaîne les victoires, frappe plus fort', 2400); }
      else await wait(1300);
      const fin = /result/i.test(await cont.first().innerText());
      await clickLoc(cont.first(), 300, 500);
      if (fin) break;
    }
    await wait(800);
    const body = await p.locator('body').innerText();
    won = /VICTORY/i.test(body);
    console.log('attempt', attempt, won ? 'WIN' : 'lose');
    if (won) {
      await cap('Victoire ! Tes <b>points</b> deviennent des <b>boosters</b>', 'Et personne ne perd jamais de carte', 3400);
      await uncap();
      await r.stop();
      r.capTop = false;
    } else {
      r.capTop = false;
      await r.stop();
    }
  }
}

// ---------- 6. Crafting ----------
if (want('crafting')) {
  await goto('/crafting', 800);
  await r.start('14_crafting');
  await tag('6', 'Crafting');
  await cap('Combine <b>2 cartes</b> pour en créer une nouvelle', 'Glisser-déposer ou deux clics', 700);
  await clickLoc(p.getByRole('button', { name: /Mossy Rock/ }).last(), 450, 400);
  await clickLoc(p.getByRole('button', { name: /Rusty Scissors/ }).last(), 450, 400);
  await wait(300);
  await clickLoc(btn(/^Combine/), 400, 500);
  await r.scrollBy(330, 700);
  await cap('Pierre + Ciseaux = <b>Minerai de fer</b> !', 'Pierre, feuille et ciseaux sont <b>infinis</b>', 2400);
  await uncap();
  await r.stop();
  await goto('/recipes', 800);
  await r.start('15_recipes');
  await tag('6', 'Recettes');
  await cap('237 cartes à découvrir', 'Chaque découverte révèle sa <b>recette</b>', 2000);
  await r.scrollBy(380, 900);
  await wait(900);
  await uncap();
  await r.stop();
}

// ---------- 7. Leaderboard ----------
if (want('leaderboard')) {
  await goto('/leaderboard', 800);
  await r.start('17_leaderboard');
  await tag('7', 'Classement');
  await cap('Grimpe au <b>classement</b>', 'Score, parties, taux de victoire', 2400);
  await uncap();
  await r.stop();
}

await r.ctx.close();
