import { launch } from './rec.mjs';
const SC = { intro: 4.8, goal: 4.3, circle: 7.6, points: 9.8, gauntlet: 5.8, rewards: 6.8, outro: 4.2 };
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : Object.keys(SC);
const r = await launch({ dir: 'profile-motion' });
for (const s of ONLY) {
  await r.p.goto('http://localhost:8765/index.html?s=' + s);
  await r.p.evaluate(() => document.fonts.ready);
  await r.p.evaluate(() => { const x = document.getElementById('vo-root'); if (x) x.style.display = 'none'; });
  await r.wait(400);
  await r.start('m_' + s);
  await r.p.evaluate(() => window.play());
  await r.wait(SC[s] * 1000);
  await r.stop();
}
await r.ctx.close();
