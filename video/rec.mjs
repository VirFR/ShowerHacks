// Recording helpers: CDP screencast capture (1080p), injected captions,
// chapter tag and a visible cursor, plus smooth mouse helpers.
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';

export const FFMPEG = process.env.FFMPEG || 'ffmpeg';
export const BASE = 'http://localhost:5173';
const W = 1280, H = 720, SCALE = 1.5;

const OVERLAY_CSS = `
@font-face{font-family:'VFredoka';src:url('/fonts/fredoka.woff2') format('woff2');font-weight:300 700}
#vo-root{position:fixed;inset:0;pointer-events:none;z-index:2147483647;font-family:'VFredoka','Fredoka',system-ui,sans-serif}
#vo-cap{position:absolute;left:50%;bottom:34px;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:6px;width:max-content;max-width:1100px}
.vo-line{background:#15193a;color:#fff;border:3px solid #0b0d22;box-shadow:0 6px 0 #0b0d22, 0 14px 40px rgba(0,0,0,.35);border-radius:16px;padding:10px 22px;font-weight:700;font-size:31px;line-height:1.15;letter-spacing:.2px;text-align:center;animation:vo-pop .42s cubic-bezier(.34,1.56,.64,1) both}
.vo-sub{background:#ffd23f;color:#15193a;font-size:23px;padding:6px 16px;border-radius:12px;box-shadow:0 5px 0 #0b0d22;animation-delay:.12s}
.vo-line b{color:#ffd23f}
.vo-sub b{color:#e5484d}
.vo-out{animation:vo-out .22s ease-in both !important}
@keyframes vo-pop{0%{opacity:0;transform:translateY(26px) scale(.7) rotate(-2deg)}100%{opacity:1;transform:none}}
@keyframes vo-out{to{opacity:0;transform:translateY(12px) scale(.9)}}
#vo-tag{position:absolute;right:26px;top:22px;display:flex;align-items:center;gap:10px;background:#2f7de1;color:#fff;border:3px solid #0b0d22;box-shadow:0 5px 0 #0b0d22;border-radius:14px;padding:6px 16px 6px 8px;font-weight:700;font-size:21px;letter-spacing:1px;text-transform:uppercase;animation:vo-slide .5s cubic-bezier(.34,1.56,.64,1) both}
#vo-tag span{background:#ffd23f;color:#15193a;border-radius:9px;min-width:34px;height:34px;display:grid;place-items:center;font-size:20px}
@keyframes vo-slide{from{opacity:0;transform:translateX(60px)}to{opacity:1;transform:none}}
#vo-cur{position:absolute;left:0;top:0;width:34px;height:34px;transform:translate(-4px,-3px);transition:none;filter:drop-shadow(0 3px 3px rgba(0,0,0,.45))}
.vo-ring{position:absolute;width:56px;height:56px;margin:-28px 0 0 -28px;border-radius:50%;border:4px solid #ffd23f;animation:vo-ring .5s ease-out both}
@keyframes vo-ring{from{transform:scale(.3);opacity:1}to{transform:scale(1.4);opacity:0}}
#vo-flash{position:absolute;inset:0;background:#fff;opacity:0}
.vo-flash{animation:vo-fl .35s ease-out}
@keyframes vo-fl{0%{opacity:.85}100%{opacity:0}}
`;

const OVERLAY_JS = (css) => {
  const install = () => {
    if (document.getElementById('vo-root')) return;
    const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    const root = document.createElement('div'); root.id = 'vo-root';
    root.innerHTML = `<div id="vo-flash"></div><div id="vo-cap"></div><svg id="vo-cur" viewBox="0 0 24 24"><path d="M4 2 L4 19 L8.5 14.8 L11.6 21.5 L14.6 20.2 L11.6 13.6 L17.8 13.6 Z" fill="#fff" stroke="#0b0d22" stroke-width="1.6" stroke-linejoin="round"/></svg>`;
    document.body.appendChild(root);
    const cur = root.querySelector('#vo-cur');
    const saved = window.__voPos || { x: 640, y: 420 };
    cur.style.left = saved.x + 'px'; cur.style.top = saved.y + 'px';
    document.addEventListener('mousemove', (e) => { cur.style.left = e.clientX + 'px'; cur.style.top = e.clientY + 'px'; try { sessionStorage.setItem('voPos', JSON.stringify({ x: e.clientX, y: e.clientY })); } catch {} }, true);
    document.addEventListener('mousedown', (e) => { const r = document.createElement('div'); r.className = 'vo-ring'; r.style.left = e.clientX + 'px'; r.style.top = e.clientY + 'px'; root.appendChild(r); setTimeout(() => r.remove(), 600); }, true);
  };
  try { window.__voPos = JSON.parse(sessionStorage.getItem('voPos')); } catch {}
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install); else install();
  window.__voInstall = install;
};

export async function launch({ dir = 'profile-rec', fresh = true } = {}) {
  if (fresh) fs.rmSync(dir, { recursive: true, force: true });
  const ctx = await chromium.launchPersistentContext(dir, { viewport: { width: W, height: H }, deviceScaleFactor: SCALE });
  await ctx.addInitScript(OVERLAY_JS, OVERLAY_CSS);
  const p = ctx.pages()[0] || await ctx.newPage();
  const cdp = await ctx.newCDPSession(p);
  let rec = null;
  cdp.on('Page.screencastFrame', async (f) => {
    cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }).catch(() => {});
    if (!rec) return;
    const file = path.join(rec.dir, String(rec.frames.length).padStart(6, '0') + '.jpg');
    fs.writeFileSync(file, Buffer.from(f.data, 'base64'));
    rec.frames.push({ file, t: f.metadata.timestamp });
  });

  const api = {
    ctx, p,
    wait: (ms) => p.waitForTimeout(ms),
    async start(name) {
      const dir = path.resolve('frames', name);
      fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
      rec = { name, dir, frames: [] };
      await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 88, maxWidth: W * SCALE, maxHeight: H * SCALE, everyNthFrame: 1 });
      // force a first frame
      await p.evaluate(() => { document.body.style.outline = '0px solid transparent'; });
      await p.waitForTimeout(80);
    },
    async stop() {
      const endT = Date.now() / 1000;
      await cdp.send('Page.stopScreencast');
      const r = rec; rec = null;
      // Build concat list with per-frame durations, then a CFR 30 fps clip.
      const lines = [];
      for (let i = 0; i < r.frames.length; i++) {
        const d = (i + 1 < r.frames.length ? r.frames[i + 1].t : endT) - r.frames[i].t;
        lines.push(`file '${r.frames[i].file}'`, `duration ${Math.max(0.001, d).toFixed(4)}`);
      }
      lines.push(`file '${r.frames[r.frames.length - 1].file}'`);
      fs.writeFileSync(path.join(r.dir, 'list.txt'), lines.join('\n'));
      fs.mkdirSync('clips', { recursive: true });
      const out = path.resolve('clips', r.name + '.mp4');
      execFileSync(FFMPEG, ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', path.join(r.dir, 'list.txt'),
        '-vf', 'scale=1920:1080:flags=lanczos,fps=30,format=yuv420p', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', out]);
      const dur = (endT - r.frames[0].t).toFixed(2);
      console.log(`clip ${r.name}: ${r.frames.length} frames, ${dur}s -> ${out}`);
      return out;
    },
    async goto(route, settle = 700) {
      await p.goto(route.startsWith('http') || route.startsWith('file') ? route : BASE + route);
      await p.waitForLoadState('networkidle').catch(() => {});
      await p.evaluate(() => window.__voInstall && window.__voInstall());
      await p.waitForTimeout(settle);
    },
    capTop: false,
    async cap(main, sub = '', hold = 0) {
      await p.evaluate(([m, s, top]) => {
        window.__voInstall && window.__voInstall();
        const c = document.getElementById('vo-cap'); if (!c) return;
        c.style.bottom = top ? 'auto' : '34px'; c.style.top = top ? (top === true ? 84 : top) + 'px' : 'auto';
        c.innerHTML = '';
        if (m) { const d = document.createElement('div'); d.className = 'vo-line'; d.innerHTML = m; c.appendChild(d); }
        if (s) { const d = document.createElement('div'); d.className = 'vo-line vo-sub'; d.innerHTML = s; c.appendChild(d); }
      }, [main, sub, api.capTop]);
      if (hold) await p.waitForTimeout(hold);
    },
    async uncap() {
      await p.evaluate(() => { document.querySelectorAll('#vo-cap .vo-line').forEach((e) => e.classList.add('vo-out')); });
      await p.waitForTimeout(230);
      await p.evaluate(() => { const c = document.getElementById('vo-cap'); if (c) c.innerHTML = ''; });
    },
    async tag(num, label) {
      await p.evaluate(([n, l]) => {
        window.__voInstall && window.__voInstall();
        const root = document.getElementById('vo-root'); if (!root) return;
        root.querySelector('#vo-tag')?.remove();
        if (!l) return;
        const t = document.createElement('div'); t.id = 'vo-tag'; t.innerHTML = `<span>${n}</span>${l}`; root.appendChild(t);
      }, [num, label]);
    },
    async flash() { await p.evaluate(() => { const f = document.getElementById('vo-flash'); if (!f) return; f.classList.remove('vo-flash'); void f.offsetWidth; f.classList.add('vo-flash'); }); },
    pos: { x: 640, y: 420 },
    async moveTo(x, y, ms = 450) {
      const steps = Math.max(8, Math.round(ms / 16));
      const { x: x0, y: y0 } = api.pos;
      for (let i = 1; i <= steps; i++) {
        const t = i / steps, e = t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        await p.mouse.move(x0 + (x - x0) * e, y0 + (y - y0) * e);
        await p.waitForTimeout(ms / steps);
      }
      api.pos = { x, y };
    },
    async clickAt(x, y, ms = 450, after = 250) {
      await api.moveTo(x, y, ms); await p.mouse.down(); await p.waitForTimeout(70); await p.mouse.up(); await p.waitForTimeout(after);
    },
    async clickLoc(loc, ms = 450, after = 300) {
      await loc.scrollIntoViewIfNeeded({ timeout: 400 }).catch(() => {});
      const b = await loc.boundingBox();
      if (!b) throw new Error('no box');
      await api.clickAt(b.x + b.width / 2, b.y + b.height / 2, ms, after);
    },
    btn: (re) => p.getByRole('button', { name: re }).first(),
    async scrollBy(dy, ms = 600) {
      const steps = Math.round(ms / 16);
      for (let i = 0; i < steps; i++) { await p.mouse.wheel(0, dy / steps); await p.waitForTimeout(16); }
    },
  };
  return api;
}
