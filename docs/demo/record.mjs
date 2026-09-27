// RPS demo video: a scripted play-through of the app (offline mode), captured
// frame by frame through Chrome's screencast, with captions, title cards,
// scene wipes and zooms drawn inside the page. Writes frames/, events.json
// (sound cues with timestamps) and, unless --dry, video-silent.mp4.
// See docs/demo/README.md.
//
//   node docs/demo/record.mjs [--dry] [--booster N] [--battle N] [--out dir]
// Env: BASE_URL (default http://localhost:4173), CHROME_PATH, FFMPEG.
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
const OUT = opt('--out', path.join(path.dirname(new URL(import.meta.url).pathname), 'frames'))
const BASE = process.env.BASE_URL ?? 'http://localhost:4173'
const SITE = process.env.SITE_URL ?? 'rock-paper-shower.vercel.app'
const W = 1920, H = 1080
const speed = DRY ? 0.12 : 1

const b = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined, args: ['--no-proxy-server'] })
const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 })
const page = await ctx.newPage()
page.on('pageerror', (e) => console.log('PAGEERR', e.message))

const BURST = '62,32 52.3,37.4 58,47 46.8,46.8 47,58 37.4,52.3 32,62 26.6,52.3 17,58 17.2,46.8 6,47 11.7,37.4 2,32 11.7,26.6 6,17 17.2,17.2 17,6 26.6,11.7 32,2 37.4,11.7 47,6 46.8,17.2 58,17 52.3,26.6'

await page.addInitScript(({ seed, burst }) => {
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
    #demo-cursor{position:fixed;z-index:2147483647;width:26px;height:26px;margin:-13px 0 0 -13px;border-radius:50%;
      background:rgba(255,255,255,.4);border:3px solid #1f2337;box-shadow:0 0 0 2px #fff,0 4px 12px rgba(0,0,0,.35);pointer-events:none;
      transition:transform .12s;left:-50px;top:-50px}
    #demo-cursor.down{transform:scale(.7);background:#ffcc33}
    #demo-cap{position:fixed;z-index:2147483646;left:50%;bottom:44px;transform:translateX(-50%) translateY(24px);opacity:0;
      max-width:1300px;padding:18px 34px;border-radius:16px;background:#fff;color:#1f2337;border:3px solid #1f2337;box-shadow:6px 6px 0 #1f2337;
      font:700 32px/1.3 Fredoka,Nunito,system-ui,sans-serif;text-align:center;pointer-events:none;transition:opacity .3s,transform .3s}
    #demo-cap.on{opacity:1;transform:translateX(-50%) translateY(0)}
    #demo-cap b{color:#2f7fe3}
    #demo-cap small{display:block;font:600 22px/1.3 Nunito,system-ui,sans-serif;color:#5b6580;margin-top:6px}
    #demo-title{position:fixed;inset:0;z-index:2147483645;display:flex;flex-direction:column;align-items:center;justify-content:center;
      gap:22px;background:#dbe4f0;background-image:radial-gradient(rgba(31,35,55,.13) 1px,transparent 1.2px);background-size:14px 14px;
      color:#1f2337;text-align:center;font-family:Nunito,system-ui,sans-serif;opacity:0;pointer-events:none;transition:opacity .45s}
    #demo-title.on{opacity:1}
    #demo-title .mark{position:relative;width:360px;height:360px;display:flex;align-items:center;justify-content:center;transform:scale(.2) rotate(-20deg);transition:transform .55s cubic-bezier(.34,1.56,.64,1)}
    #demo-title.on .mark{transform:scale(1) rotate(0)}
    #demo-title .mark svg{position:absolute;inset:0}
    #demo-title .mark span{position:relative;font:400 88px/1 'Press Start 2P',monospace;color:#1f2337;text-shadow:6px 6px 0 #fff,9px 9px 0 #1f2337;padding-top:6px}
    #demo-title .ribbon{position:relative;background:#2f7fe3;color:#fff;padding:14px 56px;font:700 30px/1 Fredoka,Nunito,sans-serif;letter-spacing:.26em;text-transform:uppercase;
      clip-path:polygon(0 0,100% 0,calc(100% - 16px) 50%,100% 100%,0 100%,16px 50%)}
    #demo-title .ribbon-wrap{position:relative;display:inline-block}
    #demo-title .ribbon-wrap:before{content:'';position:absolute;inset:-4px -6px;background:#1f2337;clip-path:polygon(0 0,100% 0,calc(100% - 18px) 50%,100% 100%,0 100%,18px 50%)}
    #demo-title h2{margin:0;font:700 46px/1.2 Fredoka,Nunito,sans-serif;max-width:1200px}
    #demo-title p{margin:0;font:600 28px/1.4 Nunito,sans-serif;color:#5b6580;max-width:1000px}
    #demo-title .tags{display:flex;gap:16px;flex-wrap:wrap;justify-content:center;margin-top:8px}
    #demo-title .tags span{font:700 22px Fredoka,sans-serif;padding:10px 20px;border-radius:12px;background:#fff;border:3px solid #1f2337;box-shadow:4px 4px 0 #1f2337}
    #demo-title .url{font:400 26px 'Press Start 2P',monospace;color:#1f2337;background:#ffcc33;border:3px solid #1f2337;padding:16px 26px;box-shadow:6px 6px 0 #1f2337;margin-top:10px}
    #demo-wipe{position:fixed;inset:0;z-index:2147483644;pointer-events:none;background:#1f2337;transform:translateX(-102%)}
    #demo-wipe.go{animation:demo-wipe .55s steps(14) forwards}
    @keyframes demo-wipe{0%{transform:translateX(-102%)}45%{transform:translateX(0)}55%{transform:translateX(0)}100%{transform:translateX(102%)}}
    #root{transition:transform .7s cubic-bezier(.4,0,.2,1)}
  `
  const mount = () => {
    if (document.getElementById('demo-cursor')) return
    const st = document.createElement('style'); st.textContent = css; document.documentElement.appendChild(st)
    for (const id of ['demo-wipe', 'demo-title', 'demo-cap', 'demo-cursor']) {
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
    window.__burst = burst
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount)
  else mount()
}, { seed: SEED, burst: BURST })

// ---------- frame capture (CDP screencast) + sound cues ----------
const frames = []
const events = []
let cdp
let t0 = 0
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
  t0 = Date.now()
  if (DRY) return
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 90, maxWidth: W, maxHeight: H, everyNthFrame: 1 })
}
const now = () => (Date.now() - t0) / 1000
const cue = (sfx) => { events.push({ t: now(), sfx }); if (DRY) console.log(`  cue ${sfx} @${now().toFixed(1)}`) }
const scene = (name, mood) => { events.push({ t: now(), scene: name, mood }); console.log(`scene ${name} @${now().toFixed(1)}s`) }

// ---------- helpers ----------
const wait = (ms) => page.waitForTimeout(Math.round(ms * speed))
let cx = W / 2, cy = H / 2
async function moveTo(x, y) {
  const d = Math.hypot(x - cx, y - cy)
  const steps = DRY ? 2 : Math.max(8, Math.round(d / 18))
  await page.mouse.move(x, y, { steps })
  cx = x; cy = y
}
async function click(loc, { pause = 300, sfx = 'click' } = {}) {
  await loc.waitFor({ state: 'visible', timeout: 15000 })
  await loc.scrollIntoViewIfNeeded()
  const bb = await loc.boundingBox()
  await moveTo(bb.x + bb.width / 2, bb.y + bb.height / 2)
  await wait(pause)
  await page.mouse.down(); if (sfx) cue(sfx); await wait(90); await page.mouse.up()
}
const caption = (html, pos = 'bottom') => page.evaluate(([h, pos]) => {
  const c = document.getElementById('demo-cap')
  if (!h) { c.classList.remove('on'); return }
  c.innerHTML = h; c.classList.add('on')
  c.style.bottom = pos === 'top' ? 'auto' : '44px'
  c.style.top = pos === 'top' ? '24px' : 'auto'
}, [html, pos])
const title = (html) => page.evaluate((h) => {
  const t = document.getElementById('demo-title')
  if (!h) { t.classList.remove('on'); return }
  t.innerHTML = h; t.classList.add('on')
}, html)
const logoHtml = () => `<div class="mark"><svg viewBox="0 0 66 66"><polygon fill="#1f2337" transform="translate(3 3)" points="${BURST}"/><polygon fill="#1f2337" points="${BURST}"/><polygon fill="#ffcc33" transform="translate(32 32) scale(0.9) translate(-32 -32)" points="${BURST}"/><polygon fill="#ff9f1c" transform="translate(32 32) scale(0.64) translate(-32 -32)" points="${BURST}"/><polygon fill="#fff" opacity=".55" points="20,20 27,17 24,24"/></svg><span>RPS</span></div>
  <div class="ribbon-wrap"><div class="ribbon">Objects at war</div></div>`
async function wipe() {
  cue('whoosh')
  await page.evaluate(() => { const w = document.getElementById('demo-wipe'); w.classList.remove('go'); void w.offsetWidth; w.classList.add('go') })
  await page.waitForTimeout(DRY ? 20 : 250)
}
const zoom = (scale, x, y) => page.evaluate(([s, x, y]) => {
  const r = document.getElementById('root')
  r.style.transformOrigin = `${x}px ${y}px`
  r.style.transform = s === 1 ? '' : `scale(${s})`
}, [scale, x, y])
async function zoomOn(loc, scale = 1.6) {
  const bb = await loc.boundingBox()
  await zoom(scale, bb.x + bb.width / 2, bb.y + bb.height / 2 + window_scroll_fix())
}
function window_scroll_fix() { return 0 }
const shot = (n) => DRY && page.screenshot({ path: path.join(path.dirname(OUT), 'shots', `dry-${n}.png`) })
if (DRY) fs.mkdirSync(path.join(path.dirname(OUT), 'shots'), { recursive: true })
const btn = (name) => page.getByRole('button', { name, exact: false }).first()
const nav = (name) => page.locator('nav a').filter({ hasText: name }).first()
const goto = async (name) => { await wipe(); await click(nav(name), { sfx: null }); await wait(700) }

// ---------- scenario ----------
await page.goto(BASE + '/home')
await page.evaluate(() => { localStorage.clear(); sessionStorage.clear() })
await page.goto(BASE + '/home')
await page.waitForTimeout(900)
await title(`${logoHtml()}<p>Rock, paper, scissors. Now with 240 objects.</p>`)
await page.waitForTimeout(200)
await startCapture()
scene('title', 'title')
await wait(300); cue('impact')
await wait(3600)
await title(null)
await wait(500)

// 1. Landing + sign in
scene('landing', 'calm')
await caption('Everyone knows rock-paper-scissors.<small>We turned it into a collectible card game.</small>')
await wait(2600)
await caption(null)
await goto('Profile')
await caption('Sign in and pick your player')
await wait(600)
await click(page.getByRole('button').filter({ hasText: 'guilhem' }).first())
await page.waitForURL('**/welcome')
await wait(500)

// 2. Warm-up vs the Coach
scene('warmup', 'calm')
await caption('First login: a classic <b>best of three</b> against the Coach.<small>Zero rules to learn before you start.</small>', 'top')
await wait(2000)
const throws = ['Rock', 'Paper', 'Scissors', 'Rock', 'Paper']
for (let i = 0; !(await btn('See my reward').isVisible()); i++) {
  await click(page.getByRole('button', { name: throws[i % throws.length], exact: true }), { sfx: 'blip' })
  await wait(1900)
  if (await btn('See my reward').isVisible()) break
  await click(btn('Next'), { sfx: null })
  await wait(500)
}
await shot('welcome')
await caption('Win, and your <b>first booster</b> is yours', 'top')
cue('win')
await wait(1400)
await click(btn('See my reward'))
await wait(1300)
await click(btn('Claim it'), { sfx: 'coin' })
await wait(1300)
await click(btn('Open my booster'))
await page.waitForURL('**/boosters')
await caption(null)
await wait(700)

// 3. Booster
scene('booster', 'calm')
await caption('<b>Tear it open</b> like a real pack')
await wait(1200)
const strip = page.locator('[aria-label^="Tear strip"]').first()
await strip.waitFor()
const sb = await strip.boundingBox()
await page.evaluate((n) => window.__reseed(n), BOOSTER)
await moveTo(sb.x + sb.width - 18, sb.y + sb.height / 2)
await wait(400)
await page.mouse.down()
cue('rip')
for (let k = 1; k <= 24; k++) {
  await page.mouse.move(sb.x + sb.width - 18 - k * 6, sb.y + sb.height / 2 + Math.sin(k / 3) * 2)
  await page.waitForTimeout(DRY ? 4 : 32)
}
await page.mouse.up()
cx = sb.x + sb.width - 18 - 144; cy = sb.y + sb.height / 2
await wait(900)
await caption('Five cards, <b>sorted by rarity</b>. The rarer, the slower it spins…')
const rareTxt = []
for (let i = 0; i < 5; i++) {
  const card = page.locator('.animate-card-spin-in button, .animate-card-spin-in a').first()
  await card.waitFor()
  cue(i === 4 ? 'sparkle' : 'ding')
  const txt = (await card.innerText().catch(() => '')).split('\n')[0]
  rareTxt.push(txt)
  if (i === 4) await caption('…and the last one is a <b>Secret Rare</b>')
  await wait(i === 4 ? 3000 : 1600)
  await shot('card' + i)
  await click(card, { pause: 150, sfx: null })
  await wait(250)
}
console.log('booster cards:', rareTxt.join(' | '))
await wait(900)
await caption('Straight into your collection')
await wait(1600)
await caption(null)

// 4. Collection
scene('collection', 'calm')
await goto('Inventory')
await caption('<b>240 objects</b> in six categories.<small>Each card: category art, rarity, attack, defense.</small>')
await wait(1400)
const firstCard = page.locator('a[href^="/item/"], button[aria-pressed]').filter({ hasText: /\d/ }).first()
await zoomOn(firstCard, 1.9)
cue('click')
await wait(2200)
await zoom(1, 0, 0)
await wait(900)
await caption(null)

// 5. Crafting
scene('crafting', 'calm')
await goto('Crafting')
await caption('<b>Crafting</b>: combine two cards.<small>Rock, leaf and scissors are infinite.</small>')
await wait(1800)
const inv = (name) => page.locator('button, [role="button"], [draggable="true"]').filter({ hasText: name }).last()
await click(inv('Mossy Rock'), { sfx: 'clunk' })
await wait(350)
await click(inv('Mossy Rock'), { sfx: 'clunk' })
await wait(500)
await caption('Rock + Rock = <b>?</b>')
await click(btn('Combine'), { sfx: 'chime' })
await wait(700)
await page.mouse.wheel(0, 260)
await wait(1500)
await shot('craft1')
await caption('Rock + Rock = <b>Brick</b>. Add another rock…')
await page.mouse.wheel(0, 300)
await wait(1100)
await click(inv('Brick'), { sfx: 'clunk' })
await wait(350)
await click(inv('Mossy Rock'), { sfx: 'clunk' })
await wait(500)
await page.mouse.wheel(0, -600)
await wait(400)
await click(btn('Combine'), { sfx: 'chime' })
await wait(700)
await page.mouse.wheel(0, 260)
await wait(300)
await caption('Brick + Rock = <b>Ancient Menhir</b><small>266 recipes, all the way back to rock, leaf and scissors.</small>')
await wait(2800)
await shot('craft2')
await caption(null)
await goto('Recipes')
await caption('Every discovery unlocks its <b>recipe</b><small>Online, recipes stay on the server. No cheating.</small>')
await wait(2600)
await caption(null)

// 6. Deck + battle vs Coach
scene('deck', 'calm')
await goto('Battle')
await caption('Battle time: the <b>Gauntlet</b>. Five cards against five.')
await wait(2000)
await click(btn('Start practice'))
await page.waitForURL('**/battle/deck**')
await wait(700)
await caption('Build your <b>deck of five</b><small>The chart shows what you beat and what beats you.</small>')
await wait(1200)
const invCards = page.locator('[data-section="inventory"] button[data-role="card"]')
const names = await invCards.allInnerTexts()
const want = ['Ancient Menhir', 'Railgun', 'Submarine', 'Chaos Die', 'Magnetar']
let picks = want.map((w) => names.findIndex((t) => t.includes(w))).filter((i) => i >= 0)
for (let i = 0; picks.length < 5 && i < names.length; i++) if (!picks.includes(i)) picks.push(i)
picks = picks.slice(0, 5)
for (const i of picks) {
  await click(invCards.nth(i), { pause: 150, sfx: 'blip' })
  await wait(280)
}
await page.mouse.wheel(0, -800)
await wait(1400)
await shot('deck')
await page.evaluate((v) => { window.__fixNow = v; window.__fixCount = 2 }, BATTLE)
await click(btn('Fight the Coach'), { sfx: 'impact' })
await page.waitForURL(/\/battle\/local-/)
await caption(null)
scene('battle', 'battle')
await wait(1000)
await caption('Both players send a card <b>face down</b>. They flip at the same time.', 'top')
await wait(1800)

async function playBattle() {
  let turn = 0
  let narratedHold = false
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
      await click(hand.first(), { pause: 200, sfx: 'blip' })
      await wait(400)
      await click(page.getByRole('button', { name: /^Send / }), { sfx: 'whoosh' })
    } else {
      if (turn >= 1 && !narratedHold) {
        narratedHold = true
        await caption('The winner <b>stays on the field</b> and gains momentum.<small>Keep it, or retreat once per battle. The bluff of the game.</small>', 'top')
      }
      await wait(700)
      await click(hold.first(), { sfx: 'whoosh' })
    }
    turn++
    const cont = page.getByRole('button', { name: /Continue|See the result/ })
    await cont.first().waitFor({ state: 'visible', timeout: 20000 })
    cue('hit')
    if (turn === 1) await caption('The <b>category chart</b> decides first. Neutral matchup? Attack against defense.', 'top')
    await wait(turn <= 2 ? 3000 : 2200)
    await caption(null)
    await shot('turn' + turn)
    if (await btn('See the result').isVisible()) break
    await click(cont.first(), { sfx: null })
    await wait(600)
  }
  cue('fanfare')
  await click(btn('See the result'))
  await wait(900)
  const txt = await page.locator('body').innerText()
  return { turn, won: /VICTORY/i.test(txt) }
}
const res = await playBattle()
console.log('battle result', JSON.stringify(res))
scene('result', 'calm')
await caption('Every battle pays <b>points</b>. Points become <b>boosters</b>.<small>Online: live duels against other players, and a leaderboard.</small>')
cue('coin')
await wait(3600)
await shot('result')
await caption(null)
await page.goto(BASE + '/leaderboard')
await wait(500)
await caption('Climb the <b>leaderboard</b>: six ranks, from Bronze to Master.')
await wait(2400)
await caption(null)
await wait(300)

// 7. Outro
scene('outro', 'outro')
await wipe()
await title(`${logoHtml()}<h2>Understood in three seconds. Strategic in five minutes.</h2>
  <div class="tags"><span>240 objects</span><span>266 recipes</span><span>Live duels</span><span>Boosters every 10 min</span></div>
  <div class="url">${SITE}</div>`)
cue('impact')
await wait(5500)
scene('end', 'end')

fs.writeFileSync(path.join(path.dirname(OUT), 'events.json'), JSON.stringify({ duration: now(), events }, null, 1))
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
  console.log('frames', frames.length, 'duration', (frames.at(-1).t - frames[0].t).toFixed(1), 'cues', now().toFixed(1))
  const outVideo = path.join(path.dirname(OUT), 'video-silent.mp4')
  const ff = spawnSync(process.env.FFMPEG ?? 'ffmpeg', ['-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', path.join(OUT, 'list.txt'),
    '-vf', `fps=30,scale=${W}:${H}:flags=lanczos,format=yuv420p`, '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-movflags', '+faststart', outVideo], { stdio: 'inherit' })
  console.log(ff.status === 0 ? `wrote ${outVideo}` : 'ffmpeg failed')
}
await b.close()
