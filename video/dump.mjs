import { chromium } from 'playwright'; import fs from 'fs';
const b = await chromium.launch(); const p = await b.newPage();
await p.goto('http://localhost:5173/home');
const data = await p.evaluate(async () => { const m = await import('/src/mocks/objetsBooster.ts'); return m.OBJETS_BOOSTER_MOCK; });
fs.writeFileSync('catalog.json', JSON.stringify(data)); console.log(data.length);
await b.close();
