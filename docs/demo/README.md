# Demo video

[`rps-demo.mp4`](./rps-demo.mp4): a scripted play-through of the app, 1920×1080, about 100 seconds,
with an original chiptune soundtrack and 8-bit sound effects. It is recorded from the real app in
offline mode (no Supabase), so it signs in with a test account and fights the Coach instead of a
live opponent. The booster draw and the battle are seeded so the demo always lands the same way:
common, rare, epic, epic, **secret rare (Railgun)** in the pack, then a practice battle won in six turns.

## What it shows

| Time | Scene | Caption |
| --- | --- | --- |
| 0:00 | Title card | RPS, Objects at war |
| 0:05 | Landing | Everyone knows rock-paper-scissors. We turned it into a collectible card game. |
| 0:09 | Sign in, warm-up | A classic best of three against the Coach. Win, and your first booster is yours. |
| 0:25 | Booster | Tear it open. Five cards, sorted by rarity. The last one is a Secret Rare. |
| 0:44 | Collection | 240 objects in six categories. Zoom on a card. |
| 0:50 | Crafting | Rock + Rock = Brick. Brick + Rock = Ancient Menhir. Recipe book unlocks. |
| 1:08 | Deck | Build your deck of five. |
| 1:15 | Battle | Face-down reveal, category chart, momentum, victory. |
| 1:35 | Rewards | Points become boosters. Leaderboard. |
| 1:40 | Outro | Logo, tags, site URL. |

## Regenerating it

Three scripts, all dependency-free apart from Playwright and ffmpeg:

- `record.mjs` drives the app with Playwright (visible cursor, captions, title cards, scene wipes,
  zooms, all drawn inside the page), captures frames through Chrome's screencast, writes
  `events.json` (timestamped sound cues) and encodes `video-silent.mp4`.
- `audio.mjs` synthesizes the soundtrack from `events.json`: a chiptune loop whose mood follows the
  scene markers (calm, battle, title, outro) and the sound effects at their cue times. Pure math,
  no samples, so there is nothing to license.
- ffmpeg muxes the two into `rps-demo.mp4`.

```bash
# 1. Serve the app in offline mode (no .env)
cd pfc && npm install && npm run build && npx vite preview --port 4173

# 2. In another terminal, from the repo root
npm i --no-save playwright ffmpeg-static && npx playwright install chromium
node docs/demo/record.mjs            # frames/, events.json, video-silent.mp4
node docs/demo/audio.mjs             # audio.wav
npx ffmpeg -y -i docs/demo/video-silent.mp4 -i docs/demo/audio.wav -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart docs/demo/rps-demo.mp4

# Quick rehearsal without recording: 10× speed, screenshots in shots/
node docs/demo/record.mjs --dry
```

Options: `--booster N` and `--battle N` change the seeds (73 and 123456789 by default), `SITE_URL`
sets the address shown on the outro, `BASE_URL`, `CHROME_PATH` and `FFMPEG` point at a different
server or binaries. Captions and pacing live in `record.mjs`; the music and effects in `audio.mjs`.
The script finds buttons by their visible labels, so renaming a button in the app means updating it here.
