# Explainer video

`RPS_video_explicative.mp4`: 2:17 explainer of the game (1080p, French captions, generated soundtrack).
It covers first login and the warm-up, boosters, cards, the category circle, deck building, fighting points, the Gauntlet, rewards, crafting, recipes and the leaderboard.

## How it is made

Real footage of the app (offline mode) is filmed with Playwright over a CDP screencast. Captions, a chapter tag and a visible cursor are injected into the page. Rule explanations are HTML motion scenes (`motion/index.html`). Everything is cut and joined with ffmpeg, and the music is synthesized with numpy.

| File | Role |
| --- | --- |
| `rec.mjs` | Capture helpers: screencast → clip, captions, cursor, smooth clicks |
| `app.mjs` | Films the app scene by scene (`ONLY=welcome,boosters,...`, `KEEP=1` reuses the browser profile) |
| `motion.mjs` + `motion/index.html` | Records the animated rule scenes |
| `dump.mjs` | Writes `catalog.json` (item catalog) used by `app.mjs` |
| `badge.mjs` | "Fast forward" overlay |
| `edit.py` → `xf.py` → `music.py` | Trim/speed segments, transitions, soundtrack |

## Regenerate

```bash
cd pfc && npm run dev                      # app on :5173, no .env (offline mode)
cd video && npm i playwright
mkdir -p motion/assets && cp ../pfc/public/fonts/* ../pfc/public/brand/rps-burst.svg motion/assets/
for i in 01 04 07 97 251 238 34 179 105 98 162 99 200 116 178 154 46; do cp ../pfc/public/objets/obj-$i.svg motion/assets/; done
(cd motion && python3 -m http.server 8765 &)
node dump.mjs && node app.mjs && node motion.mjs && node badge.mjs
python3 edit.py && python3 xf.py && python3 music.py
ffmpeg -i video_noaudio.mp4 -i music.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 160k \
  -af "lowpass=f=13000,alimiter=limit=0.7:level=false,volume=0.95" -shortest -movflags +faststart RPS_video_explicative.mp4
```

Set `FFMPEG` if `ffmpeg` is not on the PATH. The demo booster is scripted (`PACK` in `app.mjs`) so it climbs up to a Legendary; the practice battle against the Coach is played for real and retried until a win.
