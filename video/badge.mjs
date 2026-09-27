import { chromium } from 'playwright';
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
await p.goto('http://localhost:8765/index.html?s=none');
await p.setContent(`<html><head><style>@font-face{font-family:F;src:url(http://localhost:8765/assets/fredoka.woff2)}html,body{background:transparent;margin:0}
.b{position:absolute;left:40px;bottom:40px;display:flex;align-items:center;gap:14px;background:#ffd23f;color:#15193a;border:5px solid #0b0d22;box-shadow:0 8px 0 #0b0d22;border-radius:20px;padding:10px 26px;font:700 38px F}</style></head>
<body><div class="b"><svg width="46" height="40" viewBox="0 0 46 40"><path d="M2 2L22 20L2 38Z M24 2L44 20L24 38Z" fill="#15193a"/></svg>AVANCE RAPIDE</div></body></html>`);
await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
await p.screenshot({ path: 'ff_badge.png', omitBackground: true });
await b.close();
