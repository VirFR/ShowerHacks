// Scripted walkthrough of the RPS app (offline mode), captured frame by frame
// through the Chrome DevTools screencast, then encoded to MP4 with ffmpeg.
// See docs/demo/README.md. Usage:
//   node record-demo.mjs [--dry] [--booster N] [--battle N] [--out dir]
// Env: BASE_URL (default http://localhost:4173), CHROME_PATH, FFMPEG (default ffmpeg).
import { chromium } from 'playwright'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const args = process.argv.slice(2)
const opt = (k, d) => (args.includes(k) ? args[args.indexOf(k) + 1] : d)
const DRY = args.includes('--dry')
const SEED = Number(opt('--seed', 7))
const BATTLE = Number(opt('--battle', 123456789))
const BOOSTER = Number(opt('--booster', 73))
const OUT = opt('--out', 'frames')
const BASE = process.env.BASE_URL ?? 'http://localhost:4173'
const W = 1280, H = 720
const speed = DRY ? 0.15 : 1

const b = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined, args: ['--no-proxy-server'] })
const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 })
const page = await ctx.newPage()
page.on('pageerror', (e) => console.log('PAGEERR', e.message))

await page.addInitScript(({ seed }) => {
  // Seeded Math.random so the booster draw is reproducible.
  let s = seed >>> 0
  Math.random = () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  window.__reseed = (n) => { s = n >>> 0 }
  // One-shot fixed clock, to seed the Coach's battle RNG.
  const realNow = Date.now.bind(Date)
  window.__fixNow = null
  window.__fixCount = 0
  Date.now = () => {
    if (window.__fixNow !== null && window.__fixCount > 0) {
      window.__fixCount--
      return window.__fixNow
    }
    return realNow()
  }
  const css = `
    #demo-cursor{position:fixed;z-index:2147483647;width:22px;height:22px;margin:-11px 0 0 -11px;border-radius:50%;
      background:rgba(255,255,255,.35);border:3px solid #111;box-shadow:0 0 0 2px #fff,0 4px 12px rgba(0,0,0,.35);pointer-events:none;
      transition:transform .12s;left:-50px;top:-50px}
    #demo-cursor.down{transform:scale(.7);background:rgba(255,200,0,.8)}
    #demo-cap{position:fixed;z-index:2147483646;left:50%;bottom:28px;transform:translateX(-50%) translateY(20px);opacity:0;
      max-width:1000px;padding:14px 26px;border-radius:16px;background:rgba(10,16,34,.9);color:#fff;
      font:600 22px/1.35 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;text-align:center;pointer-events:none;
      border:2px solid rgba(255,255,255,.18);box-shadow:0 10px 30px rgba(0,0,0,.35);transition:opacity .35s,transform .35s}
    #demo-cap.on{opacity:1;transform:translateX(-50%) translateY(0)}
    #demo-cap b{color:#fbbf24}
    #demo-cap small{display:block;font-weight:500;font-size:16px;color:#cbd5e1;margin-top:4px}
    #demo-title{position:fixed;inset:0;z-index:2147483645;display:flex;flex-direction:column;align-items:center;justify-content:center;
      gap:18px;background:radial-gradient(ellipse at 50% 35%,#2a4a8c 0%,#0f1a33 65%);color:#fff;text-align:center;
      font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;opacity:0;pointer-events:none;transition:opacity .6s}
    #demo-title.on{opacity:1}
    #demo-title h1{font-size:76px;margin:0;letter-spacing:.02em;font-weight:900}
    #demo-title h1 span{color:#fbbf24}
    #demo-title p{font-size:28px;margin:0;color:#dbeafe;max-width:900px;line-height:1.35}
    #demo-title .tags{display:flex;gap:14px;flex-wrap:wrap;justify-content:center;margin-top:10px}
    #demo-title .tags span{font-size:19px;font-weight:700;padding:8px 16px;border-radius:999px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.25)}
    #demo-title img{width:120px;height:120px;image-rendering:pixelated}
  `
  const mount = () => {
    if (document.getElementById('demo-cursor')) return
    const st = document.createElement('style'); st.textContent = css; document.documentElement.appendChild(st)
    for (const id of ['demo-cursor', 'demo-cap', 'demo-title']) {
      const d = document.createElement('div'); d.id = id; document.documentElement.appendChild(d)
    }
    const cur = document.getElementById('demo-cursor')
    const pos = JSON.parse(sessionStorage.getItem('demo-cur') || '[-50,-50]')
    cur.style.left = pos[0] + 'px'; cur.style.top = pos[1] + 'px'
    window.addEventListener('mousemove', (e) => {
      cur.style.left = e.clientX + 'px'; cur.style.top = e.clientY + 'px'
      sessionStorage.setItem('demo-cur', JSON.stringify([e.clientX, e.clientY]))
    }, true)
    window.addEventListener('mousedown', () => cur.classList.add('down'), true)
    window.addEventListener('mouseup', () => cur.classList.remove('down'), true)
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount)
  else mount()
}, { seed: SEED })

// ---------- frame capture (CDP screencast) ----------
const frames = []
let cdp
if (!DRY) {
  fs.rmSync(OUT, { recursive: true, force: true })
  fs.mkdirSync(OUT, { recursive: true })
  cdp = await ctx.newCDPSession(page)
  cdp.on('Page.screencastFrame', async ({ data, metadata, sessionId }) => {
    const f = path.join(OUT, `f${String(frames.length).padStart(6, '0')}.jpg`)
    fs.writeFileSync(f, Buffer.from(data, 'base64'))
    frames.push({ f, t: metadata.timestamp })
    try { await cdp.send('Page.screencastFrameAck', { sessionId }) } catch {}
  })
}
const startCapture = async () => {
  if (DRY) return
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 92, maxWidth: W, maxHeight: H, everyNthFrame: 1 })
}

// ---------- helpers ----------
const wait = (ms) => page.waitForTimeout(Math.round(ms * speed))
let cx = W / 2, cy = H / 2
async function moveTo(x, y) {
  const d = Math.hypot(x - cx, y - cy)
  const steps = DRY ? 2 : Math.max(8, Math.round(d / 14))
  await page.mouse.move(x, y, { steps })
  cx = x; cy = y
}
async function click(loc, { pause = 350 } = {}) {
  await loc.waitFor({ state: 'visible', timeout: 15000 })
  await loc.scrollIntoViewIfNeeded()
  const bb = await loc.boundingBox()
  await moveTo(bb.x + bb.width / 2, bb.y + bb.height / 2)
  await wait(pause)
  await page.mouse.down(); await wait(90); await page.mouse.up()
}
const caption = (html, pos = 'bottom') => page.evaluate(([h, pos]) => {
  const c = document.getElementById('demo-cap')
  if (!h) { c.classList.remove('on'); return }
  c.innerHTML = h; c.classList.add('on')
  c.style.bottom = pos === 'top' ? 'auto' : '28px'
  c.style.top = pos === 'top' ? '10px' : 'auto'
}, [html, pos])
const title = (html) => page.evaluate((h) => {
  const t = document.getElementById('demo-title')
  if (!h) { t.classList.remove('on'); return }
  t.innerHTML = h; t.classList.add('on')
}, html)
const shot = (n) => DRY && page.screenshot({ path: `shots/dry-${n}.png` })
if (DRY) fs.mkdirSync('shots', { recursive: true })
const btn = (name) => page.getByRole('button', { name, exact: false }).first()
const nav = (name) => page.locator('nav a, aside a').filter({ hasText: name }).first()

// ---------- scenario ----------
await page.goto(BASE + '/home')
await page.evaluate(() => { localStorage.clear(); sessionStorage.clear() })
await page.goto(BASE + '/home')
await page.waitForTimeout(800)
await title(`<img src="/favicon.svg" onerror="this.remove()"><h1><span>RPS</span> · Objects at war</h1>
  <p>Le pierre-feuille-ciseaux, transformé en jeu de cartes à collectionner</p>`)
await page.waitForTimeout(700)
await startCapture()
await wait(4200)
await title(null)
await wait(700)

// 1. Sign in
await caption('On arrive sur le site et on se connecte<small>Connexion Google en ligne, comptes de test en mode hors ligne</small>')
await wait(1400)
await click(nav('Profile'))
await wait(1000)
await click(page.getByRole('button').filter({ hasText: 'guilhem' }).first())
await page.waitForURL('**/welcome')
await wait(600)

// 2. Warm-up vs the Coach
await caption('Premier login : un <b>pierre-feuille-ciseaux classique</b> contre le Coach<small>Tout le monde connaît les règles, zéro friction pour démarrer</small>')
await wait(2600)
const throws = ['Rock', 'Paper', 'Scissors', 'Rock', 'Paper']
for (let i = 0; !(await btn('See my reward').isVisible()); i++) {
  await click(page.getByRole('button', { name: throws[i % throws.length], exact: true }))
  await wait(2300)
  if (await btn('See my reward').isVisible()) break
  await click(btn('Next'))
  await wait(700)
}
await shot('welcome')
await caption('Victoire 2 à 1 : le <b>premier booster</b> est offert')
await wait(1500)
await click(btn('See my reward'))
await wait(1800)
await click(btn('Claim it'))
await wait(1600)
await click(btn('Open my booster'))
await page.waitForURL('**/boosters')
await caption(null)
await wait(900)

// 3. Booster
await caption('On <b>déchire le booster</b> comme un vrai paquet de cartes')
await wait(1800)
const strip = page.locator('[aria-label^="Tear strip"]').first()
await strip.waitFor()
const sb = await strip.boundingBox()
await page.evaluate((n) => window.__reseed(n), BOOSTER)
await moveTo(sb.x + sb.width - 18, sb.y + sb.height / 2)
await wait(500)
await page.mouse.down()
for (let k = 1; k <= 24; k++) {
  await page.mouse.move(sb.x + sb.width - 18 - k * 5, sb.y + sb.height / 2 + Math.sin(k / 3) * 2)
  await page.waitForTimeout(DRY ? 5 : 35)
}
await page.mouse.up()
cx = sb.x + sb.width - 18 - 120; cy = sb.y + sb.height / 2
await wait(1200)
await caption('5 cartes, <b>triées par rareté</b> : plus elle est rare, plus elle tourne lentement')
for (let i = 0; i < 5; i++) {
  const card = page.locator('.animate-card-spin-in button, .animate-card-spin-in [role="button"], .animate-card-spin-in > *').first()
  await card.waitFor()
  await wait(i === 4 ? 3200 : 1900)
  await shot('card' + i)
  await click(card, { pause: 200 })
  await wait(300)
}
await wait(1200)
await caption('Les cartes arrivent dans l’inventaire')
await page.mouse.wheel(0, 250)
await wait(2600)
await shot('recap')
await caption(null)

// 4. Crafting
await click(nav('Crafting'))
await wait(900)
await caption('<b>Crafting</b> façon Little Alchemy : on combine deux cartes<small>Pierre, feuille et ciseaux sont infinis</small>')
await wait(2400)
const inv = (name) => page.locator('button, [role="button"], [draggable="true"]').filter({ hasText: name }).last()
await click(inv('Mossy Rock'))
await wait(500)
await click(inv('Mossy Rock'))
await wait(700)
await caption('Pierre + Pierre = <b>?</b>')
await click(btn('Combine'))
await wait(900)
await page.mouse.wheel(0, 260)
await wait(1900)
await shot('craft1')
await caption('Pierre + Pierre = <b>Brique</b>. Et si on ajoute encore une pierre ?')
await page.mouse.wheel(0, 300)
await wait(1500)
await click(inv('Brick'))
await wait(500)
await click(inv('Mossy Rock'))
await wait(700)
await page.mouse.wheel(0, -600)
await wait(500)
await click(btn('Combine'))
await wait(900)
await page.mouse.wheel(0, 260)
await wait(400)
await caption('Brique + Pierre = <b>Menhir</b><small>248 objets, 266 recettes, toutes reliées à pierre / feuille / ciseaux</small>')
await wait(3400)
await shot('craft2')
await caption(null)
await click(nav('Recipes'))
await wait(900)
await caption('Le <b>livre de recettes</b> se dévoile au fil des découvertes<small>En ligne, les recettes restent côté serveur : impossible de tricher</small>')
await wait(3600)
await caption(null)

// 5. Deck + battle vs Coach
await click(nav('Battle'))
await wait(900)
await caption('Place au combat : le <b>Gauntlet</b>, 5 cartes contre 5, sans points de vie')
await wait(2800)
await click(btn('Start practice'))
await page.waitForURL('**/battle/deck**')
await wait(900)
await caption('On compose son <b>deck de 5 cartes</b><small>L’outil montre quelles catégories on bat et à quoi on est faible</small>')
await wait(1600)
const invCards = page.locator('[data-section="inventory"] button[data-role="card"]')
const n = await invCards.count()
const names = await invCards.allInnerTexts()
const want = ['Ancient Menhir', 'Railgun', 'Submarine', 'Chaos Die', 'Magnetar']
const picks = want.map((w) => names.findIndex((t) => t.includes(w))).filter((i) => i >= 0)
console.log('picks', picks.length)
for (const i of picks) {
  await click(invCards.nth(i), { pause: 180 })
  await wait(350)
}
await page.mouse.wheel(0, -800)
await wait(1800)
await shot('deck')
await page.evaluate((v) => { window.__fixNow = v; window.__fixCount = 2 }, BATTLE)
await click(btn('Fight the Coach'))
await page.waitForURL(/\/battle\/local-/)
await caption(null)
await wait(1200)
await caption('Les deux joueurs posent une carte <b>face cachée</b>, révélées en même temps', 'top')
await wait(2200)

async function playBattle(narrate) {
  let turn = 0
  while (true) {
    if (await btn('See the result').isVisible().catch(() => false)) break
    const send = page.getByRole('button', { name: /Pick a card to send|^Send /i })
    const hold = page.getByRole('button', { name: /Hold · Lock in/ })
    await Promise.race([
      send.first().waitFor({ state: 'visible', timeout: 30000 }).catch(() => {}),
      hold.first().waitFor({ state: 'visible', timeout: 30000 }).catch(() => {}),
    ])
    if (await send.first().isVisible()) {
      const hand = page.locator('footer button[data-role="card"]:not([disabled])')
      await click(hand.first(), { pause: 250 })
      await wait(500)
      await click(page.getByRole('button', { name: /^Send / }))
    } else {
      if (narrate && turn >= 1 && !narrate.hold) {
        narrate.hold = true
        await caption('Le gagnant <b>reste sur le terrain</b> et prend du momentum<small>On le garde, ou on bat en retraite une fois par partie</small>', 'top')
      }
      await wait(900)
      await click(hold.first())
    }
    turn++
    const cont = page.getByRole('button', { name: /Continue|See the result/ })
    await cont.first().waitFor({ state: 'visible', timeout: 20000 })
    if (narrate && turn === 1) await caption('D’abord le <b>tableau des catégories</b>, sinon l’attaque contre la défense', 'top')
    await wait(turn <= 2 ? 3600 : 2600)
    if (narrate) await caption(null)
    await shot('turn' + turn)
    if (await btn('See the result').isVisible()) break
    await click(cont.first())
    await wait(800)
  }
  await click(btn('See the result'))
  await wait(1000)
  const txt = await page.locator('body').innerText()
  return { turn, won: /VICTORY/i.test(txt), sum: txt.replace(/\s+/g, ' ').match(/(VICTORY|DEFEAT|DRAW).{0,260}/i)?.[0] }
}
const res = await playBattle({})
console.log('RESULT', BATTLE, JSON.stringify(res))
await caption('Chaque combat rapporte des <b>points</b>, convertis en <b>boosters</b><small>En ligne : duels en temps réel entre joueurs + classement</small>')
await wait(4500)
await shot('result')
await caption(null)
await wait(600)
await title(`<h1><span>RPS</span> · Objects at war</h1>
  <p>Connu de tous en 3 secondes, stratégique en 5 minutes</p>
  <div class="tags"><span>248 objets</span><span>266 recettes</span><span>Duels en temps réel</span><span>Pixel art généré par code</span></div>`)
await wait(5000)

if (!DRY) {
  await cdp.send('Page.stopScreencast')
  await page.waitForTimeout(300)
  const lines = []
  for (let i = 0; i < frames.length; i++) {
    const d = i + 1 < frames.length ? frames[i + 1].t - frames[i].t : 0.5
    lines.push(`file '${path.resolve(frames[i].f)}'`, `duration ${Math.max(0.001, d).toFixed(4)}`)
  }
  lines.push(`file '${path.resolve(frames[frames.length - 1].f)}'`)
  fs.writeFileSync(path.join(OUT, 'list.txt'), lines.join('\n'))
  console.log('frames', frames.length, 'duration', (frames.at(-1).t - frames[0].t).toFixed(1))
  const ff = spawnSync(process.env.FFMPEG ?? 'ffmpeg', ['-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', path.join(OUT, 'list.txt'),
    '-vf', `fps=30,scale=${W}:${H}:flags=lanczos,format=yuv420p`, '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-movflags', '+faststart', 'demo.mp4'], { stdio: 'inherit' })
  console.log(ff.status === 0 ? 'wrote demo.mp4' : 'ffmpeg failed: encode the frames yourself from ' + path.join(OUT, 'list.txt'))
}
await b.close()
