// Soundtrack for the demo video, synthesized from scratch (no samples, no
// libraries): an original chiptune loop whose mood follows the scene markers
// in events.json, plus 8-bit sound effects placed at the recorded cue times.
// Writes audio.wav next to events.json.
//
//   node docs/demo/audio.mjs [events.json] [audio.wav]
import fs from 'node:fs'
import path from 'node:path'

const here = path.dirname(new URL(import.meta.url).pathname)
const eventsPath = process.argv[2] ?? path.join(here, 'events.json')
const outPath = process.argv[3] ?? path.join(here, 'audio.wav')
const { duration, events } = JSON.parse(fs.readFileSync(eventsPath, 'utf8'))

const SR = 44100
const TOTAL = Math.ceil((duration + 1.5) * SR)
const L = new Float32Array(TOTAL)
const R = new Float32Array(TOTAL)

// ---------- tiny synth ----------
const TAU = Math.PI * 2
const note = (n) => 440 * 2 ** ((n - 69) / 12) // MIDI -> Hz
let noiseState = 0x9e3779b9
const rnd = () => { noiseState ^= noiseState << 13; noiseState ^= noiseState >>> 17; noiseState ^= noiseState << 5; return ((noiseState >>> 0) / 4294967296) * 2 - 1 }

/** Adds a tone. wave: square|pulse|tri|sine|noise. env: {a,d,s,r} seconds/level. pan -1..1. */
function tone({ t, dur, freq, freqEnd = freq, wave = 'square', vol = 0.2, env = { a: 0.005, d: 0.05, s: 0.7, r: 0.05 }, pan = 0, duty = 0.5, vib = 0 }) {
  const start = Math.floor(t * SR)
  const n = Math.floor((dur + env.r) * SR)
  let phase = 0
  let lp = 0
  const gl = Math.min(1, 1 - pan) , gr = Math.min(1, 1 + pan)
  for (let i = 0; i < n; i++) {
    const idx = start + i
    if (idx >= TOTAL) break
    const s = i / SR
    const k = Math.min(1, s / dur)
    const f = freq * (freqEnd / freq) ** k * (1 + vib * Math.sin(TAU * 6 * s))
    phase += f / SR
    const p = phase - Math.floor(phase)
    let v
    if (wave === 'square') v = p < 0.5 ? 1 : -1
    else if (wave === 'pulse') v = p < duty ? 1 : -1
    else if (wave === 'tri') v = 4 * Math.abs(p - 0.5) - 1
    else if (wave === 'sine') v = Math.sin(TAU * p)
    else { lp += 0.35 * (rnd() - lp); v = lp * 2.5 }
    // ADSR
    let e
    if (s < env.a) e = s / env.a
    else if (s < env.a + env.d) e = 1 - (1 - env.s) * ((s - env.a) / env.d)
    else if (s < dur) e = env.s
    else e = env.s * Math.max(0, 1 - (s - dur) / env.r)
    const out = v * e * vol
    L[idx] += out * gl
    R[idx] += out * gr
  }
}

// ---------- music ----------
const BPM = 128
const BEAT = 60 / BPM
const BAR = BEAT * 4
const scenes = events.filter((e) => e.scene)
const moodAt = (t) => { let m = 'calm'; for (const s of scenes) if (s.t <= t) m = s.mood; return m }

// I–V–vi–IV in C for the calm loop, vi–IV–I–V driven for battle. Roots as MIDI.
const PROG = { calm: [48, 43, 45, 41], battle: [45, 41, 48, 43], title: [48], outro: [41, 43, 48, 48] }
const CHORD = { 48: [0, 4, 7], 43: [0, 4, 7], 45: [0, 3, 7], 41: [0, 4, 7] } // major/minor triads
// Lead riffs (semitone offsets from the bar's root, per 8th note; null = rest)
const RIFF = {
  calm: [[12, null, 16, 19, null, 16, 12, null], [12, 14, 16, null, 19, null, 16, 14], [12, null, 15, 19, null, 15, 12, null], [12, 16, 19, 24, null, 19, 16, 12]],
  battle: [[12, 12, 15, 12, 19, 12, 15, 17], [12, 12, 15, 12, 19, 22, 19, 15], [12, 12, 16, 12, 19, 12, 16, 17], [12, 12, 16, 12, 19, 23, 24, 19]],
}

const musicEnd = duration
for (let bar = 0, t = 0; t < musicEnd; bar++, t += BAR) {
  const mood = moodAt(t + 0.01)
  if (mood === 'end') break
  const prog = PROG[mood] ?? PROG.calm
  const root = prog[bar % prog.length]
  const chord = CHORD[root] ?? [0, 4, 7]
  const drive = mood === 'battle'
  const vol = mood === 'title' ? 0.16 : mood === 'outro' ? 0.18 : 0.15

  if (mood === 'title' || mood === 'outro') {
    // Held chord with a slow arpeggio on top
    for (const iv of chord) tone({ t, dur: BAR * 0.95, freq: note(root + iv + 12), wave: 'pulse', duty: 0.3, vol: vol * 0.5, env: { a: 0.02, d: 0.3, s: 0.6, r: 0.4 } })
    tone({ t, dur: BAR * 0.95, freq: note(root), wave: 'tri', vol: vol * 1.3, env: { a: 0.01, d: 0.2, s: 0.8, r: 0.3 } })
    for (let i = 0; i < 8; i++) tone({ t: t + i * BEAT / 2, dur: BEAT / 2 * 0.8, freq: note(root + chord[i % 3] + 24 + (i >= 4 ? 12 : 0)), wave: 'square', vol: vol * 0.35, env: { a: 0.003, d: 0.08, s: 0.4, r: 0.08 }, pan: i % 2 ? 0.4 : -0.4 })
    continue
  }
  // Bass: root on every 8th, octave bounce
  for (let i = 0; i < 8; i++) {
    const oct = drive ? (i % 2 ? 12 : 0) : (i % 4 === 2 ? 12 : 0)
    tone({ t: t + i * BEAT / 2, dur: BEAT / 2 * 0.7, freq: note(root - 12 + oct), wave: 'tri', vol: vol * 1.4, env: { a: 0.003, d: 0.05, s: 0.8, r: 0.03 } })
  }
  // Chord stabs on the off-beats
  for (let i = 1; i < 8; i += 2) for (const iv of chord) tone({ t: t + i * BEAT / 2, dur: BEAT / 4, freq: note(root + iv + 12), wave: 'pulse', duty: 0.25, vol: vol * 0.28, env: { a: 0.002, d: 0.06, s: 0.3, r: 0.03 }, pan: iv === 0 ? -0.3 : iv === 7 ? 0.3 : 0 })
  // Lead riff
  const riff = (RIFF[drive ? 'battle' : 'calm'])[bar % 4]
  riff.forEach((iv, i) => { if (iv !== null) tone({ t: t + i * BEAT / 2, dur: BEAT / 2 * 0.85, freq: note(root + iv + 12), wave: 'square', vol: vol * 0.55, env: { a: 0.003, d: 0.06, s: 0.55, r: 0.04 }, vib: 0.004 }) })
  // Drums: kick, snare, hats
  for (let i = 0; i < 4; i++) {
    if (drive || i % 2 === 0) tone({ t: t + i * BEAT, dur: 0.12, freq: 150, freqEnd: 40, wave: 'sine', vol: 0.5, env: { a: 0.001, d: 0.1, s: 0, r: 0.02 } })
    if (i % 2 === 1) tone({ t: t + i * BEAT, dur: 0.09, freq: 1, wave: 'noise', vol: drive ? 0.32 : 0.22, env: { a: 0.001, d: 0.08, s: 0, r: 0.03 } })
  }
  for (let i = 0; i < 8; i++) tone({ t: t + i * BEAT / 2 + (drive ? 0 : BEAT / 4), dur: 0.03, freq: 1, wave: 'noise', vol: drive ? 0.12 : 0.08, env: { a: 0.001, d: 0.03, s: 0, r: 0.01 }, pan: 0.5 })
}

// ---------- sound effects ----------
const SFX = {
  impact: (t) => { tone({ t, dur: 0.35, freq: 140, freqEnd: 35, wave: 'sine', vol: 0.9, env: { a: 0.001, d: 0.3, s: 0, r: 0.05 } }); tone({ t, dur: 0.18, freq: 1, wave: 'noise', vol: 0.5, env: { a: 0.001, d: 0.15, s: 0, r: 0.05 } }) },
  blip: (t) => tone({ t, dur: 0.07, freq: 880, freqEnd: 1320, wave: 'square', vol: 0.32, env: { a: 0.001, d: 0.03, s: 0.6, r: 0.03 } }),
  click: (t) => { tone({ t, dur: 0.025, freq: 1, wave: 'noise', vol: 0.3, env: { a: 0.001, d: 0.02, s: 0, r: 0.01 } }); tone({ t, dur: 0.03, freq: 1800, freqEnd: 1200, wave: 'square', vol: 0.18, env: { a: 0.001, d: 0.02, s: 0.3, r: 0.02 } }) },
  win: (t) => [72, 76, 79, 84].forEach((n, i) => tone({ t: t + i * 0.09, dur: i === 3 ? 0.35 : 0.09, freq: note(n), wave: 'square', vol: 0.32, env: { a: 0.002, d: 0.04, s: 0.7, r: 0.08 } })),
  coin: (t) => { tone({ t, dur: 0.06, freq: 988, wave: 'square', vol: 0.3, env: { a: 0.001, d: 0.02, s: 0.9, r: 0.01 } }); tone({ t: t + 0.06, dur: 0.3, freq: 1319, wave: 'square', vol: 0.3, env: { a: 0.001, d: 0.1, s: 0.5, r: 0.12 } }) },
  rip: (t) => { for (let i = 0; i < 14; i++) tone({ t: t + i * 0.055, dur: 0.05, freq: 1, wave: 'noise', vol: 0.35 + i * 0.02, env: { a: 0.002, d: 0.04, s: 0.2, r: 0.02 }, pan: -0.6 + i * 0.09 }) },
  ding: (t, k) => { const f = note(84 + k * 2); tone({ t, dur: 0.5, freq: f, wave: 'tri', vol: 0.45, env: { a: 0.002, d: 0.4, s: 0.15, r: 0.2 } }); tone({ t, dur: 0.25, freq: f * 2, wave: 'sine', vol: 0.15, env: { a: 0.002, d: 0.2, s: 0, r: 0.05 } }) },
  sparkle: (t) => { [84, 88, 91, 96, 100, 103].forEach((n, i) => tone({ t: t + i * 0.07, dur: 0.5, freq: note(n), wave: 'tri', vol: 0.32, env: { a: 0.002, d: 0.4, s: 0.2, r: 0.3 }, pan: i % 2 ? 0.5 : -0.5 })); tone({ t: t + 0.45, dur: 0.9, freq: note(108), wave: 'sine', vol: 0.18, env: { a: 0.05, d: 0.6, s: 0.2, r: 0.3 }, vib: 0.01 }) },
  clunk: (t) => tone({ t, dur: 0.11, freq: 220, freqEnd: 110, wave: 'square', vol: 0.3, env: { a: 0.001, d: 0.08, s: 0.3, r: 0.03 } }),
  chime: (t) => [79, 84, 88].forEach((n, i) => tone({ t: t + i * 0.12, dur: 0.7, freq: note(n), wave: 'tri', vol: 0.36, env: { a: 0.002, d: 0.5, s: 0.2, r: 0.3 } })),
  whoosh: (t) => { for (let i = 0; i < 10; i++) tone({ t: t + i * 0.028, dur: 0.03, freq: 1, wave: 'noise', vol: 0.06 + Math.sin((i / 9) * Math.PI) * 0.22, env: { a: 0.002, d: 0.02, s: 0.5, r: 0.01 }, pan: -0.8 + i * 0.18 }) },
  hit: (t) => { tone({ t, dur: 0.1, freq: 1, wave: 'noise', vol: 0.45, env: { a: 0.001, d: 0.09, s: 0, r: 0.03 } }); tone({ t, dur: 0.25, freq: 110, freqEnd: 45, wave: 'sine', vol: 0.7, env: { a: 0.001, d: 0.22, s: 0, r: 0.04 } }) },
  fanfare: (t) => { [72, 76, 79, 84].forEach((n, i) => tone({ t: t + i * 0.11, dur: 0.11, freq: note(n), wave: 'square', vol: 0.34, env: { a: 0.002, d: 0.04, s: 0.8, r: 0.04 } })); [72, 76, 79, 84].forEach((n) => tone({ t: t + 0.46, dur: 0.9, freq: note(n), wave: 'pulse', duty: 0.3, vol: 0.22, env: { a: 0.005, d: 0.3, s: 0.6, r: 0.4 } })) },
}
let dings = 0
for (const e of events) {
  if (!e.sfx) continue
  if (e.sfx === 'ding') SFX.ding(e.t, dings++)
  else SFX[e.sfx]?.(e.t)
}

// ---------- master: fade out, soft clip, write WAV ----------
const fadeStart = Math.max(0, (duration - 1.2) * SR)
for (let i = 0; i < TOTAL; i++) {
  const g = i > fadeStart ? Math.max(0, 1 - (i - fadeStart) / (1.5 * SR)) : 1
  L[i] = Math.tanh(L[i] * 1.1) * g
  R[i] = Math.tanh(R[i] * 1.1) * g
}
const buf = Buffer.alloc(44 + TOTAL * 4)
buf.write('RIFF', 0); buf.writeUInt32LE(36 + TOTAL * 4, 4); buf.write('WAVE', 8)
buf.write('fmt ', 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22)
buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34)
buf.write('data', 36); buf.writeUInt32LE(TOTAL * 4, 40)
for (let i = 0; i < TOTAL; i++) {
  buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i])) * 32767), 44 + i * 4)
  buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i])) * 32767), 46 + i * 4)
}
fs.writeFileSync(outPath, buf)
console.log(`wrote ${outPath}: ${(TOTAL / SR).toFixed(1)}s, ${events.filter((e) => e.sfx).length} sound effects`)
