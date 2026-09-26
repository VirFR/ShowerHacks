/**
 * One drawing per item, painted onto a 64×64 pixel canvas (see raster.mjs).
 * Keep shapes inside 2..62 so the automatic 1px outline fits.
 * A drawing may return { shadow: false } or { outline: false } to opt out.
 */
import { dark, light } from './raster.mjs'

// Palette
const K = '#1b1730', W = '#ffffff', X = '#0b0a14'
const G = '#8b90a0', GD = '#5c6070', GL = '#c3c7d3'          // stone gray
const S = '#c9d1dc', SD = '#8a94a6', SL = '#f1f4f8'          // steel
const B = '#8b5a2b', BD = '#5a381a', BL = '#b97d43', T = '#d9a066', TL = '#f3d9a4'
const R = '#dc2626', RD = '#8f1a1a', RL = '#f87171'
const O = '#f97316', OL = '#fdba74', Y = '#facc15', YL = '#fef08a', GOLD = '#f5b301'
const E = '#22c55e', ED = '#15803d', EL = '#86efac', F = '#166534'
const U = '#2563eb', C = '#38bdf8', CL = '#bae6fd', A = '#67e8f9'
const V = '#6d28d9', P = '#a855f7', PL = '#d8b4fe'
const I = '#ec4899', IL = '#f9a8d4', H = '#f6cfa8'
const MOSS = '#4ade80'

const deg = (d) => (d * Math.PI) / 180

export const ITEMS = {
  // ── Starters ───────────────────────────────────────────────────────────
  'obj-01': (c) => { // Mossy Rock
    c.poly([[8, 40], [12, 26], [24, 14], [40, 12], [54, 22], [58, 40], [50, 55], [30, 58], [14, 53]], G)
    c.poly([[14, 30], [24, 18], [40, 16], [48, 26], [36, 30], [24, 36]], GL)
    c.poly([[28, 44], [54, 38], [50, 55], [30, 58]], GD)
    c.path([[30, 30], [35, 38], [31, 47]], 1.6, GD)
    c.path([[44, 30], [48, 36]], 1.6, GD)
    c.poly([[16, 26], [24, 14], [40, 12], [50, 20], [42, 24], [30, 22], [22, 28]], MOSS)
    c.circle(20, 30, 3.5, MOSS); c.circle(46, 24, 3, MOSS); c.circle(34, 16, 2.5, light(MOSS, 0.4))
    c.circle(26, 18, 2, light(MOSS, 0.4))
  },
  'obj-04': (c) => { // Oak Leaf
    const leftPts = [[32, 4], [25, 11], [20, 11], [23, 18], [15, 20], [19, 27], [12, 31], [19, 35], [15, 42], [23, 43], [25, 50], [32, 52]]
    const rightPts = leftPts.slice(1, -1).reverse().map(([x, y]) => [64 - x, y])
    c.poly([...leftPts, ...rightPts], E)
    c.poly(leftPts, EL)
    c.line(32, 8, 32, 52, 2, ED)
    for (const [y, dx] of [[16, 8], [24, 12], [32, 14], [40, 10]]) {
      c.line(32, y + 2, 32 - dx, y - 1, 1.2, ED)
      c.line(32, y + 2, 32 + dx, y - 1, 1.2, F)
    }
    c.line(32, 52, 35, 61, 3, B)
  },
  'obj-07': (c) => { // Rusty Scissors
    c.poly([[29, 37], [12, 8], [18, 4], [36, 31]], S)
    c.poly([[35, 37], [52, 8], [46, 4], [28, 31]], S)
    c.line(14, 10, 32, 32, 1.4, SL)
    c.line(50, 10, 32, 32, 1.4, SL)
    for (const [x, y, r] of [[18, 14, 2.5], [24, 22, 2], [44, 12, 2.2], [40, 20, 1.8], [30, 30, 1.6], [22, 10, 1.4]]) c.circle(x, y, r, O)
    for (const [x, y, r] of [[19, 15, 1.2], [45, 13, 1.1], [41, 21, 1]]) c.circle(x, y, r, BD)
    c.line(32, 36, 22, 46, 5, R); c.line(32, 36, 42, 46, 5, R)
    c.ring(20, 52, 10, 5.5, R); c.ring(44, 52, 10, 5.5, R)
    c.arc(20, 52, 10, 5.5, deg(200), deg(320), RL); c.arc(44, 52, 10, 5.5, deg(200), deg(320), RL)
    c.circle(32, 35, 3.5, GD); c.circle(32, 35, 1.5, GL)
  },

  // ── Booster pool ───────────────────────────────────────────────────────
  'obj-02': (c) => { // Ancient Menhir
    c.rect(6, 54, 52, 6, ED)
    for (const x of [8, 14, 22, 40, 48, 54]) c.line(x, 55, x + 1, 50, 1.6, E)
    c.poly([[22, 56], [20, 22], [26, 8], [38, 5], [45, 16], [46, 56]], G)
    c.poly([[22, 56], [20, 22], [26, 8], [33, 7], [31, 56]], GL)
    c.poly([[40, 56], [46, 56], [45, 16], [41, 14]], GD)
    for (const [x, y] of [[27, 18], [36, 26], [26, 34], [37, 42], [30, 48]]) {
      c.line(x, y, x + 4, y, 1.5, GOLD); c.line(x + 2, y - 2, x + 2, y + 3, 1.5, GOLD)
    }
    c.circle(24, 52, 3, MOSS); c.circle(43, 53, 2.5, MOSS)
  },
  'obj-03': (c) => { // Meteorite
    c.poly([[2, 2], [30, 20], [46, 40], [42, 48], [26, 34], [10, 14]], RD)
    c.poly([[4, 4], [32, 22], [46, 40], [36, 40], [24, 30], [10, 12]], O)
    c.poly([[8, 8], [34, 26], [42, 38], [30, 32], [16, 18]], Y)
    c.poly([[12, 10], [30, 24], [36, 32], [22, 22]], YL)
    c.circle(44, 44, 13, GD)
    c.circle(40, 40, 8, G)
    c.circle(48, 50, 3, dark(GD, 0.4)); c.circle(38, 50, 2.2, dark(GD, 0.4)); c.circle(50, 40, 2, dark(GD, 0.4))
    c.circle(38, 36, 2.5, GL)
    for (const [x, y] of [[54, 22], [58, 34], [22, 44], [12, 52]]) c.circle(x, y, 1.5, O)
  },
  'obj-08': (c) => { // Sharpened Katana
    c.poly([[24, 42], [56, 6], [59, 8], [58, 12], [28, 46]], S)
    c.poly([[24, 42], [56, 6], [57, 7], [26, 44]], SL)
    c.line(19, 39, 30, 50, 4, GOLD)
    c.line(22, 46, 8, 58, 7, RD)
    for (let i = 0; i < 4; i++) c.line(20 - i * 3.2, 47 + i * 3.2, 17 - i * 3.2, 44 + i * 3.2, 1.4, K)
    c.circle(7, 59, 3, GOLD)
  },
  'obj-09': (c) => { // Crab Claw
    c.line(12, 56, 24, 42, 9, R)
    c.line(6, 60, 14, 56, 5, R)
    c.ellipse(32, 36, 13, 11, R)
    c.poly([[36, 40], [58, 30], [61, 36], [52, 46], [38, 47]], R)
    c.poly([[26, 28], [34, 8], [42, 5], [48, 12], [46, 22], [40, 32]], R)
    c.poly([[36, 42], [54, 34], [50, 42], [40, 44]], RL)
    c.ellipse(28, 32, 5, 4, RL)
    c.poly([[32, 22], [37, 10], [41, 9], [38, 22]], RL)
    for (const [x, y] of [[40, 38], [46, 36], [52, 34]]) c.poly([[x, y], [x + 3, y - 1], [x + 1, y + 3]], W)
    for (const [x, y] of [[38, 28], [40, 22], [42, 16]]) c.poly([[x, y], [x + 4, y - 2], [x + 4, y + 1]], W)
    for (const [x, y] of [[20, 44], [16, 50], [44, 12], [30, 44]]) c.circle(x, y, 1.3, RD)
  },
  'obj-12': (c) => { // Chaos Die
    c.poly([[32, 6], [56, 19], [32, 32], [8, 19]], PL)
    c.poly([[8, 19], [32, 32], [32, 58], [8, 45]], P)
    c.poly([[32, 32], [56, 19], [56, 45], [32, 58]], V)
    c.circle(32, 19, 2.6, W)
    for (const [x, y] of [[15, 31], [25, 37], [15, 43], [25, 49]]) c.circle(x, y, 2.4, W)
    for (const [x, y] of [[39, 40], [49, 34], [44, 43], [39, 52], [49, 46]]) c.circle(x, y, 2.4, W)
    c.star(6, 8, 4, 1.5, 4, Y); c.star(58, 54, 4, 1.5, 4, Y); c.star(56, 8, 2.5, 1, 4, YL)
  },
  'obj-05': (c) => { // Cursed Scroll
    c.rect(14, 12, 36, 40, TL)
    c.rect(9, 5, 46, 9, T, 4); c.rect(9, 50, 46, 9, T, 4)
    c.rect(9, 5, 46, 3, light(T, 0.3), 2); c.rect(9, 50, 46, 3, light(T, 0.3), 2)
    c.circle(11, 9.5, 3, BL); c.circle(53, 9.5, 3, BL); c.circle(11, 54.5, 3, BL); c.circle(53, 54.5, 3, BL)
    c.circle(11, 9.5, 1.2, BD); c.circle(53, 9.5, 1.2, BD); c.circle(11, 54.5, 1.2, BD); c.circle(53, 54.5, 1.2, BD)
    for (const [y, xs] of [[20, [18, 26, 34, 42]], [28, [20, 30, 40]], [36, [18, 28, 36, 44]], [44, [22, 32, 40]]])
      for (const x of xs) { c.line(x, y, x + 4, y, 1.6, P); c.line(x + 2, y - 2, x + 2, y + 2, 1.6, P) }
    c.path([[20, 24], [26, 26], [32, 24], [38, 26], [44, 24]], 1.2, V)
    c.path([[20, 40], [26, 42], [32, 40], [38, 42], [44, 40]], 1.2, V)
    for (const [x, y] of [[6, 24], [58, 40], [5, 44], [59, 20]]) c.star(x, y, 2.5, 1, 4, P)
  },
  'obj-06': (c) => { // Armored Paper
    c.rect(12, 5, 40, 54, W)
    c.poly([[44, 5], [52, 5], [52, 13]], GL)
    c.poly([[44, 5], [52, 13], [44, 13]], SL)
    for (const y of [12, 30, 52]) c.line(16, y, 46, y, 1.2, GL)
    c.rect(12, 18, 40, 7, S); c.rect(12, 40, 40, 7, S); c.rect(29, 5, 7, 54, S)
    c.rect(12, 18, 40, 2, SL); c.rect(12, 40, 40, 2, SL); c.rect(29, 5, 2, 54, SL)
    for (const x of [16, 24, 40, 48]) for (const y of [21.5, 43.5]) { c.circle(x, y, 1.8, SD); c.circle(x - 0.5, y - 0.5, 0.8, SL) }
    for (const y of [9, 32, 56]) { c.circle(32.5, y, 1.8, SD); c.circle(32, y - 0.5, 0.8, SL) }
    c.circle(32.5, 21.5, 2.4, GOLD); c.circle(32.5, 43.5, 2.4, GOLD)
  },
  'obj-10': (c) => { // Storm Lightning
    const CL1 = '#6b7280', CL2 = '#9ca3af'
    c.circle(18, 18, 9, CL1); c.circle(31, 13, 11, CL1); c.circle(45, 15, 10, CL1); c.circle(54, 21, 7, CL1)
    c.rect(10, 20, 50, 8, CL1)
    c.circle(31, 12, 7, CL2); c.circle(18, 17, 5, CL2); c.circle(45, 14, 6, CL2)
    c.poly([[38, 26], [22, 44], [32, 44], [24, 61], [46, 38], [36, 38], [44, 26]], Y)
    c.poly([[39, 29], [29, 41], [35, 41], [30, 53], [40, 40], [34, 40], [40, 29]], YL)
    for (const [x, y] of [[14, 36], [52, 46], [10, 50], [56, 32]]) c.line(x, y, x + 1, y + 5, 1.6, C)
  },
  'obj-11': (c) => { // Ice Shield
    c.poly([[8, 6], [56, 6], [58, 30], [32, 60], [6, 30]], CL)
    c.poly([[12, 10], [52, 10], [54, 30], [32, 55], [10, 30]], C)
    c.poly([[14, 12], [30, 12], [30, 30], [12, 30]], light(C, 0.15))
    for (const a of [90, 30, 150]) {
      const dx = Math.cos(deg(a)) * 15, dy = Math.sin(deg(a)) * 15
      c.line(32 - dx, 30 - dy, 32 + dx, 30 + dy, 2.2, W)
      for (const s of [-1, 1]) for (const t of [0.55, 0.85]) {
        const px = 32 + s * dx * t, py = 30 + s * dy * t
        const bx = Math.cos(deg(a + 60)) * 4, by = Math.sin(deg(a + 60)) * 4
        c.line(px, py, px + s * bx, py + s * by, 1.6, W)
        const bx2 = Math.cos(deg(a - 60)) * 4, by2 = Math.sin(deg(a - 60)) * 4
        c.line(px, py, px + s * bx2, py + s * by2, 1.6, W)
      }
    }
    c.circle(32, 30, 2.5, W)
    c.dither((x, y) => x < 22 && y < 22, W, [12, 10, 22, 22])
  },
  'obj-13': (c) => { // Hatchet
    c.line(12, 58, 40, 24, 6.5, B)
    c.line(13, 56, 39, 25, 1.6, BL)
    for (const t of [0, 4, 8]) c.line(36 - t * 0.8 - 2, 27 + t * 0.8 + 2, 40 - t * 0.8 + 2, 31 + t * 0.8 - 2, 1.6, BD)
    c.poly([[36, 6], [58, 10], [61, 26], [46, 32], [36, 22]], S)
    c.poly([[38, 8], [56, 12], [58, 24], [50, 26], [40, 20]], SL)
    c.poly([[56, 10], [61, 26], [46, 32], [50, 24]], light(S, 0.55))
    c.rect(34, 12, 6, 12, SD, 2)
  },
  'obj-14': (c) => { // Shield
    c.poly([[8, 6], [56, 6], [58, 30], [32, 60], [6, 30]], SD)
    c.poly([[12, 10], [52, 10], [54, 29], [32, 55], [10, 29]], S)
    c.poly([[14, 12], [30, 12], [30, 28], [12, 28]], SL)
    c.rect(29, 10, 6, 45, R); c.poly([[10, 26], [54, 26], [54, 32], [10, 32]], R)
    c.rect(29, 10, 2, 45, RL); c.rect(10, 26, 44, 2, RL)
    c.circle(32, 29, 7, GOLD); c.circle(30, 27, 3, YL)
    for (const [x, y] of [[14, 12], [50, 12], [12, 28], [52, 28], [22, 46], [42, 46]]) c.circle(x, y, 1.5, GD)
  },
  'obj-15': (c) => { // Net
    for (let i = -6; i <= 6; i++) {
      c.line(8 + i * 8, 8, 8 + i * 8 + 48, 56, 1.4, T)
      c.line(56 - i * 8, 8, 56 - i * 8 - 48, 56, 1.4, T)
    }
    c.fillWhere((x, y) => x < 8 || x > 56 || y < 8 || y > 56, null)
    c.rect(6, 6, 52, 3, B); c.rect(6, 55, 52, 3, B); c.rect(6, 6, 3, 52, B); c.rect(55, 6, 3, 52, B)
    for (let x = 8; x <= 56; x += 8) for (let y = 8; y <= 56; y += 8) c.circle(x, y, 1.3, BD)
    for (const x of [14, 26, 38, 50]) c.circle(x, 7, 3, O)
    c.line(32, 4, 32, 2, 2, B)
  },
  'obj-16': (c) => { // Torch
    c.poly([[32, 3], [44, 18], [43, 32], [32, 37], [21, 32], [20, 18]], R)
    c.poly([[32, 8], [40, 20], [39, 31], [32, 34], [25, 31], [24, 20]], O)
    c.poly([[32, 14], [36, 22], [36, 30], [32, 32], [28, 30], [28, 22]], Y)
    c.poly([[32, 20], [34, 25], [33, 30], [31, 30], [30, 25]], YL)
    c.rect(24, 35, 16, 9, GD, 2); c.line(24, 38, 40, 38, 1.4, G); c.line(24, 41, 40, 41, 1.4, G)
    c.rect(28, 44, 8, 17, B, 1); c.rect(29, 44, 2, 17, BL)
    for (const [x, y] of [[14, 10], [50, 12], [48, 30], [16, 28]]) c.circle(x, y, 1.6, O)
  },
  'obj-17': (c) => { // Hammer
    c.rect(11, 9, 42, 15, S, 2)
    c.rect(11, 9, 42, 4, SL, 2)
    c.rect(11, 20, 42, 4, SD, 2)
    c.rect(11, 9, 4, 15, SL, 2); c.rect(49, 9, 4, 15, SD, 2)
    c.rect(28, 24, 8, 37, B, 1); c.rect(29, 24, 2, 37, BL)
    c.rect(26, 24, 12, 4, SD, 1)
    c.rect(27, 52, 10, 9, BD, 2)
  },
  'obj-18': (c) => { // Rope
    c.ring(30, 30, 25, 17, T)
    c.ring(30, 30, 14, 7, T)
    for (let a = 0; a < 360; a += 18) {
      const r1 = 17.5, r2 = 24.5
      c.line(30 + Math.cos(deg(a)) * r1, 30 + Math.sin(deg(a)) * r1, 30 + Math.cos(deg(a + 14)) * r2, 30 + Math.sin(deg(a + 14)) * r2, 1.4, B)
    }
    for (let a = 0; a < 360; a += 30) {
      const r1 = 7.5, r2 = 13.5
      c.line(30 + Math.cos(deg(a)) * r1, 30 + Math.sin(deg(a)) * r1, 30 + Math.cos(deg(a + 22)) * r2, 30 + Math.sin(deg(a + 22)) * r2, 1.4, B)
    }
    c.path([[48, 40], [56, 48], [54, 58]], 6, T)
    c.line(54, 60, 58, 56, 2, B)
    c.arc(30, 30, 25, 17, deg(200), deg(290), light(T, 0.25))
  },
  'obj-19': (c) => { // Magnet
    c.arc(32, 30, 23, 11, deg(0), deg(180), R)
    c.rect(9, 8, 12, 23, R); c.rect(43, 8, 12, 23, R)
    c.rect(9, 6, 12, 9, S); c.rect(43, 6, 12, 9, S)
    c.rect(9, 6, 12, 3, SL); c.rect(43, 6, 12, 3, SL)
    c.rect(11, 15, 3, 16, RL)
    c.arc(32, 30, 23, 20, deg(120), deg(180), RL)
    for (const [x1, y1, x2, y2] of [[6, 4, 3, 1], [15, 3, 15, 0], [24, 4, 27, 1], [40, 4, 37, 1], [49, 3, 49, 0], [58, 4, 61, 1]]) c.line(x1, y1, x2, y2, 1.6, A)
  },
  'obj-20': (c) => { // Water Bucket
    c.arc(32, 24, 20, 17.5, deg(190), deg(350), SD)
    c.poly([[12, 24], [52, 24], [46, 59], [18, 59]], S)
    c.poly([[14, 24], [22, 24], [22, 59], [18, 59]], SL)
    c.poly([[44, 24], [52, 24], [46, 59], [42, 59]], SD)
    c.poly([[13, 36], [51, 36], [50, 40], [14, 40]], SD)
    c.poly([[15, 50], [49, 50], [48, 53], [16, 53]], SD)
    c.ellipse(32, 24, 21, 6, SD)
    c.ellipse(32, 24, 18, 4.5, C)
    c.ellipse(28, 23, 6, 1.6, CL)
    c.circle(32, 4, 2.5, SD)
  },
  'obj-21': (c) => { // Kitchen Knife
    c.line(8, 58, 22, 44, 9, X)
    c.line(9, 56, 21, 44, 1.6, GD)
    c.poly([[20, 42], [58, 4], [61, 9], [52, 24], [30, 46]], S)
    c.poly([[22, 42], [57, 6], [59, 8], [24, 43]], SL)
    c.line(30, 46, 52, 24, 1.4, W)
    c.circle(12, 54, 1.6, S); c.circle(17, 49, 1.6, S)
  },
  'obj-22': (c) => { // Shovel
    c.rect(20, 3, 24, 7, B, 3); c.rect(20, 3, 24, 2.5, BL, 2)
    c.rect(29, 8, 6, 30, B); c.rect(30, 8, 2, 30, BL)
    c.poly([[16, 36], [48, 36], [47, 50], [32, 61], [17, 50]], S)
    c.poly([[18, 36], [30, 36], [30, 58], [18, 50]], SL)
    c.rect(16, 34, 32, 5, SD, 1)
    c.line(32, 40, 32, 56, 1.6, SD)
  },
  'obj-23': (c) => { // Umbrella
    c.arc(32, 30, 27, 0, deg(180), deg(360), R)
    for (const x of [10, 21, 43, 54]) c.circle(x, 30, 5.5, R)
    c.arc(32, 30, 27, 0, deg(200), deg(250), RL)
    for (const a of [200, 225, 250, 270, 290, 315, 340]) c.line(32, 6, 32 + Math.cos(deg(a)) * 26, 30 + Math.sin(deg(a)) * 26, 1.2, RD)
    c.line(32, 2, 32, 8, 2.5, GD)
    c.rect(31, 30, 3, 24, B)
    c.arc(26, 54, 7, 4, deg(0), deg(180), B)
    c.line(19, 50, 19, 54, 3, B)
  },
  'obj-24': (c) => { // Fire Extinguisher
    c.rect(20, 17, 24, 43, R, 5)
    c.rect(22, 19, 4, 38, RL, 2)
    c.rect(23, 32, 18, 12, W, 1)
    c.poly([[32, 34], [37, 39], [35, 43], [29, 43], [27, 39]], O); c.poly([[32, 37], [34, 40], [32, 42], [30, 40]], Y)
    c.rect(26, 9, 12, 9, X, 2)
    c.rect(20, 5, 22, 5, X, 2); c.line(22, 7, 40, 3, 3, GD)
    c.path([[20, 12], [10, 12], [8, 24], [10, 38], [14, 44]], 3, X)
    c.poly([[10, 42], [18, 44], [16, 52], [8, 50]], GD)
    c.circle(44, 14, 4, W); c.circle(44, 14, 2, R)
  },
  'obj-25': (c) => { // Brick
    const q = '#b5452b', Q = '#d9634a', q1 = '#7a2e1c'
    c.poly([[6, 24], [46, 24], [58, 12], [18, 12]], Q)
    c.rect(6, 24, 40, 24, q)
    c.poly([[46, 24], [58, 12], [58, 36], [46, 48]], q1)
    for (const [x, y] of [[14, 30], [30, 40], [40, 28], [22, 44], [36, 34]]) c.rect(x, y, 3, 1.5, light(q, 0.18))
    for (const [x, y] of [[26, 30], [12, 42], [42, 42]]) c.rect(x, y, 2, 1.5, dark(q, 0.25))
    for (const x of [16, 28, 40]) c.ellipse(x + 6, 18, 3.5, 2, light(Q, 0.2))
  },
  'obj-26': (c) => { // Duct Tape
    c.ring(35, 33, 24, 12, SD)
    c.ring(30, 30, 24, 12, S)
    c.arc(30, 30, 24, 12, deg(190), deg(300), SL)
    c.arc(30, 30, 15, 12, deg(0), deg(360), GL)
    c.poly([[42, 50], [61, 52], [61, 59], [40, 56]], S)
    c.poly([[42, 50], [61, 52], [61, 54], [42, 52]], SL)
  },
  'obj-27': (c) => { // Flashlight
    c.poly([[52, 12], [63, 2], [63, 62], [52, 52]], '#8a7a2c')
    c.poly([[52, 20], [63, 14], [63, 50], [52, 44]], YL)
    c.rect(4, 24, 34, 16, Y, 4)
    c.rect(6, 26, 30, 3, YL, 2)
    for (const x of [10, 16, 22]) c.rect(x, 24, 2, 16, dark(Y, 0.3))
    c.poly([[36, 18], [50, 12], [50, 52], [36, 46]], GD)
    c.poly([[38, 20], [48, 15], [48, 26], [38, 30]], G)
    c.rect(49, 13, 4, 38, CL, 1)
    c.rect(28, 20, 6, 4, X, 1)
  },
  'obj-28': (c) => { // Power Drill
    c.rect(16, 16, 32, 16, Y, 4)
    c.rect(18, 18, 26, 3, YL, 2)
    c.poly([[30, 32], [46, 32], [43, 58], [32, 58]], dark(Y, 0.15))
    c.rect(30, 54, 15, 7, X, 2)
    c.rect(26, 34, 4, 9, X, 1)
    c.rect(6, 19, 11, 10, GD, 3); c.rect(6, 19, 11, 3, G, 2)
    c.line(0, 24, 7, 24, 3, S); c.line(1, 24, 6, 24, 1, SL)
    for (const x of [36, 40, 44]) c.rect(x, 22, 1.5, 7, dark(Y, 0.35))
    c.circle(45, 30, 2, X)
  },
  'obj-29': (c) => { // Crossbow
    c.path([[4, 22], [12, 12], [32, 7], [52, 12], [60, 22]], 4, S)
    c.path([[6, 24], [32, 20], [58, 24]], 1.4, W)
    c.rect(28, 8, 8, 52, B, 2); c.rect(29, 8, 2, 52, BL)
    c.rect(24, 34, 16, 6, BD, 2)
    c.ring(32, 48, 6, 3.5, GD)
    c.line(32, 4, 32, 40, 2.6, T)
    c.poly([[32, 2], [29, 8], [35, 8]], S)
    c.poly([[29, 36], [35, 36], [35, 42], [32, 40], [29, 42]], R)
  },
  'obj-30': (c) => { // Grappling Hook
    c.line(32, 2, 32, 14, 3.2, T)
    for (const y of [3, 6, 9, 12]) c.line(31, y, 33, y + 1.5, 1, B)
    c.rect(28, 12, 8, 24, SD, 2); c.rect(29, 12, 2, 24, SL)
    c.ring(32, 12, 5, 2.5, SD)
    c.path([[32, 34], [18, 40], [12, 50], [14, 58]], 4.2, S)
    c.path([[32, 34], [46, 40], [52, 50], [50, 58]], 4.2, S)
    c.path([[32, 34], [32, 46], [32, 58]], 4.2, S)
    c.poly([[10, 56], [17, 56], [20, 62]], S); c.poly([[47, 56], [54, 56], [44, 62]], S); c.poly([[29, 56], [35, 56], [32, 63]], S)
    c.circle(32, 36, 4, GD)
  },
  'obj-31': (c) => { // Slingshot
    c.line(32, 61, 32, 36, 7.5, B)
    c.line(32, 36, 13, 10, 6, B); c.line(32, 36, 51, 10, 6, B)
    c.line(33, 60, 33, 38, 1.6, BL); c.line(31, 34, 15, 12, 1.6, BL); c.line(33, 34, 49, 12, 1.6, BL)
    c.path([[13, 8], [22, 24], [30, 29]], 2.6, RD); c.path([[51, 8], [42, 24], [34, 29]], 2.6, RD)
    c.ellipse(32, 30, 6, 3.5, BD)
    c.circle(32, 28, 3, G); c.circle(31, 27, 1, GL)
    c.rect(28, 40, 8, 3, BD); c.rect(28, 46, 8, 3, BD)
  },
  'obj-32': (c) => { // Boxing Glove
    c.circle(35, 26, 20, R)
    c.ellipse(15, 34, 9, 11, R)
    c.ellipse(28, 17, 8, 6, RL)
    c.ellipse(13, 30, 3.5, 4, RL)
    c.path([[20, 30], [26, 26], [34, 26], [42, 28], [50, 32]], 1.6, RD)
    c.rect(22, 44, 26, 16, W, 4)
    c.rect(22, 47, 26, 4, RD)
    c.rect(22, 54, 26, 2, RD)
    c.rect(44, 46, 3, 14, GL)
  },
  'obj-33': (c) => { // Circular Saw
    c.star(32, 32, 30, 25, 26, SD)
    c.ring(32, 32, 26, 8, S)
    c.arc(32, 32, 26, 8, deg(195), deg(260), SL)
    for (let a = 0; a < 360; a += 45) c.line(32 + Math.cos(deg(a)) * 10, 32 + Math.sin(deg(a)) * 10, 32 + Math.cos(deg(a + 25)) * 24, 32 + Math.sin(deg(a + 25)) * 24, 1.4, SD)
    c.ring(32, 32, 9, 4, GD)
    c.circle(32, 32, 3, X)
  },
  'obj-34': (c) => { // Chainsaw
    c.rect(4, 26, 30, 18, O, 4)
    c.rect(6, 28, 24, 3, OL, 2)
    c.arc(18, 26, 12, 8, deg(180), deg(360), X)
    c.ring(10, 50, 8, 4.5, X)
    c.rect(28, 16, 4, 12, X, 1)
    c.rect(4, 36, 30, 3, dark(O, 0.3))
    c.circle(26, 40, 2.5, X)
    c.poly([[32, 27], [60, 29], [61, 34], [61, 36], [60, 41], [32, 43]], S)
    c.poly([[34, 29], [58, 31], [58, 39], [34, 41]], SD)
    c.rect(34, 33, 24, 3, S)
    for (let x = 33; x < 61; x += 4) { c.rect(x, 26, 2, 2, X); c.rect(x + 1, 42, 2, 2, X) }
    c.arc(61, 35, 6, 4, deg(270), deg(450), X)
  },
  'obj-35': (c) => { // Flamethrower
    c.poly([[48, 33], [62, 20], [59, 34], [62, 50], [48, 40]], R)
    c.poly([[49, 34], [59, 24], [57, 35], [59, 46], [49, 39]], O)
    c.poly([[50, 35], [56, 30], [55, 36], [56, 42], [50, 38]], Y)
    c.rect(10, 16, 24, 12, R, 5); c.rect(12, 18, 20, 3, RL, 2); c.rect(12, 26, 20, 2, RD)
    c.rect(30, 18, 6, 8, S, 1)
    c.rect(8, 30, 34, 10, GD, 2); c.rect(10, 31, 30, 2, G)
    c.rect(40, 32, 10, 6, SD, 1); c.rect(48, 31, 3, 8, S, 1)
    c.rect(14, 40, 7, 14, X, 2); c.rect(30, 40, 6, 9, X, 2)
    c.rect(22, 40, 4, 5, dark(GD, 0.3))
    c.circle(20, 22, 3, W); c.line(20, 22, 22, 20, 1, R)
  },
  'obj-36': (c) => { // Heavy Armor
    c.poly([[14, 10], [50, 10], [57, 24], [52, 50], [32, 61], [12, 50], [7, 24]], S)
    c.poly([[16, 12], [30, 12], [30, 56], [14, 48], [10, 26]], SL)
    c.circle(12, 16, 10, SD); c.circle(52, 16, 10, SD)
    c.circle(10, 14, 5, S); c.circle(50, 14, 5, S)
    c.arc(32, 8, 9, 0, deg(0), deg(180), K)
    c.line(32, 18, 32, 56, 2, SD)
    c.rect(12, 42, 40, 6, BD); c.rect(28, 41, 8, 8, GOLD, 1)
    for (const [x, y] of [[20, 22], [44, 22], [18, 36], [46, 36]]) c.circle(x, y, 1.6, GD)
  },
  'obj-37': (c) => { // Industrial Drill
    c.rect(10, 6, 44, 22, Y, 5); c.rect(12, 8, 40, 4, YL, 2); c.rect(10, 24, 44, 4, dark(Y, 0.3))
    for (const x of [16, 22, 28]) c.rect(x, 15, 2, 7, dark(Y, 0.4))
    c.circle(46, 17, 4, R); c.circle(45, 16, 1.5, RL)
    c.rect(20, 28, 24, 5, GD)
    c.poly([[14, 33], [50, 33], [32, 62]], S)
    c.poly([[16, 33], [30, 33], [30, 58]], SL)
    for (let i = 0; i < 5; i++) { const y = 36 + i * 5, w = 34 - i * 6; c.line(32 - w / 2, y, 32 + w / 2, y + 3, 1.6, SD) }
  },
  'obj-38': (c) => { // Cannon
    c.poly([[6, 24], [50, 20], [56, 24], [56, 40], [50, 44], [6, 40]], '#2d2d3a')
    c.poly([[8, 26], [48, 22], [50, 26], [10, 30]], '#585868')
    c.rect(4, 22, 6, 20, '#3d3d4c', 2); c.rect(28, 21, 4, 22, '#3d3d4c'); c.rect(46, 20, 5, 24, '#3d3d4c')
    c.poly([[18, 42], [52, 42], [56, 50], [20, 50]], B); c.rect(20, 42, 4, 8, BL)
    c.ring(38, 52, 9, 4, B); for (let a = 0; a < 180; a += 45) c.line(38 + Math.cos(deg(a)) * 5, 52 + Math.sin(deg(a)) * 5, 38 - Math.cos(deg(a)) * 5, 52 - Math.sin(deg(a)) * 5, 1.6, BD)
    c.circle(38, 52, 2, GD)
    c.circle(12, 56, 5, X); c.circle(10, 54, 1.5, G)
  },
  'obj-39': (c) => { // Tesla Generator
    c.rect(12, 50, 40, 11, GD, 3); c.rect(14, 52, 36, 2, G)
    c.rect(24, 26, 16, 24, O, 2)
    for (let y = 28; y < 50; y += 4) c.rect(24, y, 16, 1.5, dark(O, 0.4))
    c.rect(26, 27, 2, 22, OL)
    c.ellipse(32, 22, 20, 7, S); c.ellipse(32, 20, 12, 3, SL); c.ellipse(32, 24, 20, 3, SD)
    c.path([[12, 20], [6, 14], [10, 8], [4, 2]], 1.8, A)
    c.path([[52, 20], [58, 12], [54, 8], [60, 2]], 1.8, A)
    c.path([[32, 14], [30, 8], [34, 4]], 1.8, YL)
    c.path([[20, 30], [12, 34], [16, 40]], 1.4, A); c.path([[44, 34], [52, 38], [48, 44]], 1.4, A)
  },
  'obj-40': (c) => { // Bottled Tornado
    c.rect(27, 2, 10, 6, T, 1)
    c.rect(25, 7, 14, 10, CL, 2)
    c.rect(13, 15, 38, 46, CL, 11)
    for (const [y, rx, ry] of [[26, 13, 4], [33, 10, 3.5], [40, 7, 3], [47, 4.5, 2.5], [53, 2.5, 2]]) {
      c.ellipse(32, y, rx, ry, G); c.ellipse(32 - rx / 3, y - 1, rx / 2, ry / 2.5, GL)
    }
    for (const [x, y] of [[20, 30], [44, 36], [22, 44], [42, 50]]) c.circle(x, y, 1.2, GD)
    c.rect(17, 20, 4, 32, W, 2); c.rect(44, 22, 2, 20, light(CL, 0.5))
  },
  'obj-41': (c) => { // Iron Ore
    c.poly([[8, 42], [10, 26], [22, 12], [40, 10], [56, 22], [58, 42], [48, 56], [26, 58], [12, 54]], G)
    c.poly([[14, 30], [24, 18], [40, 14], [46, 24], [34, 28], [22, 34]], GL)
    c.poly([[26, 44], [54, 40], [48, 56], [26, 58]], GD)
    for (const [x, y, r] of [[22, 26, 4], [40, 22, 3.5], [30, 40, 4.5], [46, 42, 3], [18, 44, 3], [38, 50, 2.5]]) { c.circle(x, y, r, SD); c.circle(x - 1, y - 1, r / 2, SL) }
    for (const [x, y] of [[28, 22], [48, 30], [24, 52]]) c.circle(x, y, 1.8, '#b45309')
  },
  'obj-42': (c) => { // Wood Log
    c.rect(4, 22, 46, 20, B, 3)
    for (const [y, x0, x1] of [[26, 8, 40], [31, 14, 46], [36, 6, 32], [39, 20, 44]]) c.line(x0, y, x1, y, 1.4, BD)
    c.rect(6, 23, 40, 2, BL)
    c.ellipse(18, 32, 3, 4, BD); c.ellipse(18, 32, 1.5, 2, BL)
    c.ellipse(50, 32, 9, 11, T)
    c.ring(50, 32, 6.5, 5, BL); c.ring(50, 32, 3.5, 2, BL); c.circle(50, 32, 1, BL)
  },
  'obj-43': (c) => { // Coal
    const c0 = '#2a2a38', c1 = '#41415a', c2 = '#5e5e7a'
    c.poly([[8, 38], [12, 22], [26, 10], [42, 8], [56, 18], [58, 36], [50, 54], [30, 58], [14, 52]], c0)
    c.poly([[14, 26], [26, 14], [42, 12], [38, 24], [24, 30]], c1)
    c.poly([[42, 12], [56, 18], [52, 30], [40, 26]], c1)
    c.poly([[16, 44], [30, 34], [44, 40], [40, 54], [22, 52]], c1)
    c.poly([[18, 24], [26, 16], [34, 15], [24, 26]], c2)
    c.poly([[46, 16], [52, 20], [48, 26]], c2)
    c.poly([[20, 44], [30, 38], [26, 48]], c2)
    for (const [x, y] of [[48, 44], [36, 30], [50, 34]]) c.circle(x, y, 1.6, O)
  },
  'obj-44': (c) => { // Gold Ingot
    c.poly([[18, 20], [46, 20], [54, 32], [10, 32]], YL)
    c.poly([[10, 32], [54, 32], [58, 46], [6, 46]], GOLD)
    c.poly([[46, 20], [54, 32], [58, 46], [50, 46], [46, 32]], dark(GOLD, 0.3))
    c.poly([[20, 22], [40, 22], [44, 30], [16, 30]], light(YL, 0.5))
    c.rect(14, 36, 30, 2, dark(GOLD, 0.3)); c.rect(14, 40, 20, 2, dark(GOLD, 0.3))
    c.star(8, 14, 4, 1.5, 4, W); c.star(56, 12, 3, 1.2, 4, W); c.star(60, 52, 2.5, 1, 4, W)
  },
  'obj-45': (c) => { // Raw Diamond
    c.poly([[22, 8], [42, 8], [46, 22], [18, 22]], CL)
    c.poly([[8, 22], [22, 8], [18, 22]], C); c.poly([[42, 8], [56, 22], [46, 22]], C)
    c.poly([[8, 22], [18, 22], [32, 58]], dark(C, 0.15))
    c.poly([[18, 22], [46, 22], [32, 58]], A)
    c.poly([[46, 22], [56, 22], [32, 58]], dark(C, 0.35))
    c.poly([[24, 24], [32, 24], [30, 44]], light(A, 0.45))
    c.line(8, 22, 56, 22, 1.2, W)
    c.star(14, 10, 4, 1.5, 4, W); c.star(50, 40, 3, 1.2, 4, W)
  },
  'obj-46': (c) => { // Ancient Oak
    c.poly([[26, 40], [38, 40], [42, 60], [50, 62], [14, 62], [22, 60]], B)
    c.rect(28, 38, 3, 22, BL)
    c.ellipse(32, 48, 3, 4, BD)
    for (const [x, y, r] of [[18, 24, 11], [32, 14, 13], [46, 22, 11], [24, 34, 10], [42, 34, 10], [32, 28, 12]]) c.circle(x, y, r, ED)
    for (const [x, y, r] of [[20, 22, 7], [32, 13, 9], [45, 21, 7], [26, 32, 6], [41, 32, 6]]) c.circle(x, y, r, E)
    for (const [x, y, r] of [[22, 18, 3], [34, 9, 4], [46, 18, 3]]) c.circle(x, y, r, EL)
    for (const [x, y] of [[26, 26], [40, 28], [33, 22]]) c.circle(x, y, 1.6, F)
  },
  'obj-47': (c) => { // Thorny Bramble
    c.path([[4, 52], [14, 32], [28, 26], [42, 36], [60, 22]], 3.6, ED)
    c.path([[6, 18], [20, 38], [40, 50], [60, 44]], 3.6, F)
    c.path([[28, 60], [30, 44], [42, 36]], 3, ED)
    const thorn = (x, y, dx, dy, col) => c.poly([[x - 2, y], [x + 2, y], [x + dx, y + dy]], col)
    for (const [x, y, dx, dy] of [[12, 36, -3, -5], [22, 28, 0, -6], [36, 32, 2, -6], [50, 30, 3, -6], [16, 30, 6, 3], [48, 24, -4, 6]]) thorn(x, y, dx, dy, T)
    for (const [x, y, dx, dy] of [[14, 30, -4, -5], [24, 42, 0, 6], [34, 46, 4, 6], [50, 44, 3, -6], [44, 50, -2, 6]]) thorn(x, y, dx, dy, T)
    for (const [x, y] of [[30, 44], [44, 42], [18, 44]]) { c.circle(x, y, 2.4, V); c.circle(x - 0.7, y - 0.7, 0.8, PL) }
    for (const [x, y] of [[8, 46], [56, 20]]) c.ellipse(x, y, 3, 1.6, E)
  },
  'obj-48': (c) => { // Poison Mushroom
    c.rect(24, 30, 16, 30, TL, 5); c.rect(26, 32, 3, 26, W)
    c.ellipse(32, 30, 18, 4, T)
    c.ellipse(32, 26, 26, 17, P)
    c.fillWhere((x, y) => y > 31 && Math.abs(x - 32) > 8, null, [0, 31, 64, 44])
    c.fillWhere((x, y) => y > 31 && Math.abs(x - 32) <= 8, TL, [24, 31, 40, 34])
    c.ellipse(32, 30, 26, 3, dark(P, 0.35))
    c.ellipse(22, 18, 10, 5, PL)
    for (const [x, y, r] of [[16, 26, 3], [30, 14, 4], [46, 22, 3.5], [38, 27, 2.5], [10, 30, 2]]) c.circle(x, y, r, EL)
    c.line(20, 31, 20, 38, 2.4, E); c.circle(20, 39, 1.6, E); c.line(44, 31, 44, 36, 2.4, E); c.circle(44, 37, 1.6, E)
  },
  'obj-49': (c) => { // Desert Cactus
    c.ellipse(32, 58, 26, 4, T)
    c.rect(26, 8, 12, 50, E, 6); c.rect(28, 10, 2, 46, EL); c.rect(34, 10, 2, 46, ED)
    c.rect(8, 20, 8, 20, E, 4); c.rect(8, 34, 20, 8, E, 4); c.rect(10, 22, 2, 16, EL)
    c.rect(48, 12, 8, 22, E, 4); c.rect(36, 28, 20, 8, E, 4); c.rect(50, 14, 2, 18, EL)
    for (const [x, y] of [[24, 16], [40, 20], [24, 30], [40, 44], [24, 48], [6, 26], [58, 20], [18, 34], [46, 28]]) c.line(x, y, x + (x < 32 ? -3 : 3), y - 1, 1.2, W)
    c.circle(32, 7, 4, I); c.circle(31, 6, 1.5, IL)
  },
  'obj-50': (c) => { // Climbing Vine
    c.path([[30, 62], [24, 50], [36, 40], [26, 28], [36, 16], [30, 4]], 3.2, ED)
    for (const [x, y, s] of [[20, 52, -1], [42, 42, 1], [18, 30, -1], [42, 18, 1], [24, 10, -1]]) {
      c.ellipse(x + s * 3, y, 7, 4, E); c.ellipse(x + s * 3, y - 1, 4, 2, EL); c.line(x - s * 4, y, x + s * 9, y, 1, ED)
    }
    c.arc(44, 30, 4, 2.5, deg(90), deg(360), ED); c.arc(14, 42, 4, 2.5, deg(180), deg(450), ED)
  },
  'obj-51': (c) => { // Asteroid
    c.poly([[6, 36], [10, 20], [24, 8], [44, 6], [58, 18], [60, 38], [48, 56], [26, 60], [10, 52]], G)
    c.poly([[12, 26], [24, 12], [42, 10], [40, 20], [24, 28]], GL)
    c.poly([[24, 46], [56, 40], [48, 56], [26, 60]], GD)
    for (const [x, y, r] of [[22, 38, 6], [44, 26, 5], [40, 46, 4], [18, 22, 3], [50, 44, 2.5]]) { c.circle(x, y, r, GD); c.circle(x + 1, y + 1, r - 1.5, dark(GD, 0.35)); c.arc(x, y, r, r - 1.5, deg(200), deg(320), GL) }
  },
  'obj-52': (c) => { // Icy Comet
    c.poly([[2, 2], [40, 30], [52, 46], [46, 50], [28, 34], [10, 12]], dark(CL, 0.15))
    c.poly([[4, 4], [42, 32], [50, 44], [38, 40], [26, 30], [10, 10]], CL)
    c.poly([[8, 8], [40, 34], [44, 40], [32, 36], [18, 20]], W)
    c.circle(44, 44, 14, CL); c.circle(40, 40, 8, W); c.circle(48, 50, 4, A); c.circle(38, 50, 2.5, A); c.circle(52, 40, 2, A)
    for (const [x, y] of [[56, 22], [60, 34], [24, 46], [14, 54]]) c.star(x, y, 2.2, 0.8, 4, W)
  },
  'obj-53': (c) => { // Moon
    const M = '#f1ebc4', MD = '#d2ca97', ML = '#fffbe6'
    c.circle(32, 32, 27, M)
    c.arc(32, 32, 27, 18, deg(300), deg(430), MD)
    for (const [x, y, r] of [[22, 22, 6], [40, 18, 4], [26, 42, 5], [44, 40, 7], [36, 30, 3], [16, 34, 3]]) { c.circle(x, y, r, MD); c.circle(x + 1, y + 1, r - 1.5, dark(MD, 0.12)); c.arc(x, y, r, r - 1.5, deg(200), deg(320), ML) }
    c.arc(32, 32, 25, 20, deg(200), deg(260), ML)
  },
  'obj-54': (c) => { // Sun
    for (let a = 0; a < 360; a += 30) {
      const r1 = 20, r2 = 31, a0 = deg(a - 5), a1 = deg(a + 5), am = deg(a)
      c.poly([[32 + Math.cos(a0) * r1, 32 + Math.sin(a0) * r1], [32 + Math.cos(a1) * r1, 32 + Math.sin(a1) * r1], [32 + Math.cos(am) * r2, 32 + Math.sin(am) * r2]], a % 60 ? Y : O)
    }
    c.circle(32, 32, 19, O); c.circle(32, 32, 16, Y); c.circle(28, 28, 9, YL); c.circle(26, 26, 4, W)
  },
  'obj-55': (c) => { // Shooting Star
    c.path([[42, 22], [6, 58]], 6, dark(Y, 0.1)); c.path([[42, 22], [8, 56]], 3.5, YL); c.path([[40, 24], [12, 52]], 1.4, W)
    c.path([[46, 30], [24, 60]], 2.5, YL); c.path([[36, 16], [4, 44]], 2.5, YL)
    c.star(44, 20, 16, 7, 5, Y); c.star(44, 20, 9, 4, 5, YL); c.circle(41, 16, 2.5, W)
    for (const [x, y] of [[12, 40], [22, 30], [56, 40], [54, 6]]) c.star(x, y, 2.2, 0.9, 4, W)
  },
  'obj-56': (c) => { // Miniature Black Hole
    const inRing = (x, y) => { const e = ((x - 32) / 30) ** 2 + ((y - 32) / 11) ** 2; return e <= 1 && e >= 0.25 }
    c.fillWhere(inRing, V); c.fillWhere((x, y) => inRing(x, y) && ((x - 32) / 26) ** 2 + ((y - 32) / 8.5) ** 2 <= 1, O)
    c.fillWhere((x, y) => inRing(x, y) && ((x - 32) / 20) ** 2 + ((y - 32) / 6.5) ** 2 <= 1, Y)
    c.circle(32, 32, 14, X); c.ring(32, 32, 14, 12.5, '#2d2d3a')
    c.fillWhere((x, y) => y > 32 && inRing(x, y) && (x - 32) ** 2 + (y - 32) ** 2 <= 14 * 14, O)
    c.fillWhere((x, y) => y > 33 && inRing(x, y) && ((x - 32) / 20) ** 2 + ((y - 32) / 6.5) ** 2 <= 1 && (x - 32) ** 2 + (y - 32) ** 2 <= 14 * 14, Y)
    c.arc(32, 32, 16, 14, deg(200), deg(340), light(P, 0.3))
    for (const [x, y] of [[6, 10], [58, 8], [10, 54], [56, 56]]) c.star(x, y, 2, 0.8, 4, W)
  },
  'obj-57': (c) => { // Nebula
    for (const [x, y, r, col] of [[24, 28, 16, V], [40, 26, 14, V], [30, 40, 14, V], [44, 40, 11, V], [20, 40, 9, V]]) c.circle(x, y, r, col)
    for (const [x, y, r, col] of [[26, 28, 11, P], [40, 30, 10, P], [32, 40, 9, P], [44, 40, 7, I], [22, 38, 6, U]]) c.circle(x, y, r, col)
    c.dither((x, y) => ((x - 30) / 20) ** 2 + ((y - 34) / 14) ** 2 <= 1, PL, [8, 18, 52, 50])
    for (const [x, y, r] of [[30, 30, 5, IL], [42, 36, 3, IL]]) c.circle(x, y, r, IL)
    for (const [x, y] of [[6, 8], [56, 6], [10, 56], [58, 52], [50, 16]]) c.star(x, y, 2.5, 1, 4, W)
    c.circle(20, 20, 1.2, W); c.circle(48, 48, 1.2, W); c.circle(34, 48, 1, W)
  },
  'obj-58': (c) => { // Tralalero Tralala
    const BLU = '#3b82f6', BLD = '#1d4ed8'
    c.poly([[26, 18], [32, 4], [38, 18]], BLU)
    c.poly([[54, 30], [62, 16], [60, 32], [62, 44]], BLU)
    c.ellipse(30, 30, 26, 12, BLU)
    c.fillWhere((x, y) => y > 30 && ((x - 30) / 24) ** 2 + ((y - 30) / 10) ** 2 <= 1, W, [4, 30, 56, 42])
    c.ellipse(24, 22, 10, 4, light(BLU, 0.35))
    c.circle(14, 26, 3, W); c.circle(15, 26, 1.5, X)
    for (const x of [8, 13, 18, 23]) c.poly([[x, 31], [x + 3, 31], [x + 1.5, 35]], W)
    c.line(6, 31, 26, 31, 1.4, BLD)
    for (const x of [14, 30, 46]) {
      c.rect(x - 2, 40, 4, 8, BLD)
      c.rect(x - 6, 47, 12, 7, W, 3); c.rect(x - 6, 52, 12, 2, BLU); c.line(x - 5, 49, x + 5, 51, 1.4, BLD)
    }
  },
  'obj-59': (c) => { // Bombardiro Crocodilo
    c.poly([[26, 22], [60, 20], [62, 24], [26, 26]], S)
    c.poly([[50, 22], [58, 10], [60, 22]], SD)
    c.ellipse(32, 30, 22, 9, E)
    c.poly([[4, 30], [22, 24], [22, 36]], E)
    c.line(4, 31, 22, 31, 1.4, ED)
    for (const x of [7, 12, 17]) { c.poly([[x, 31], [x + 3, 31], [x + 1.5, 34.5]], W); c.poly([[x + 1, 31], [x + 4, 31], [x + 2.5, 27.5]], W) }
    c.circle(26, 26, 3, W); c.circle(27, 26, 1.5, X)
    for (const x of [28, 36, 44]) c.rect(x, 22, 3, 3, ED)
    c.ellipse(24, 33, 12, 3, EL)
    for (const x of [22, 40]) { c.ellipse(x, 48, 5, 7, X); c.rect(x - 1, 40, 2, 3, GD); c.poly([[x - 4, 54], [x + 4, 54], [x, 59]], GD); c.circle(x - 2, 45, 1.2, G) }
  },
  'obj-60': (c) => { // Tung Tung Tung Sahur
    c.rect(18, 8, 26, 50, B, 6); c.rect(20, 10, 22, 3, BL, 2)
    for (const [y, x0, x1] of [[22, 20, 30], [40, 32, 42], [50, 20, 34]]) c.line(x0, y, x1, y, 1.2, BD)
    c.circle(26, 22, 5, W); c.circle(38, 22, 5, W); c.circle(27, 23, 2.2, X); c.circle(39, 23, 2.2, X)
    c.rect(27, 32, 10, 3, BD, 1); c.rect(29, 32, 6, 1.5, W)
    c.line(44, 30, 54, 22, 4, B)
    c.line(50, 60, 58, 6, 4.5, T); c.circle(58, 5, 3, T); c.rect(48, 54, 6, 6, BD, 2)
    c.line(18, 34, 10, 42, 4, B)
    c.rect(20, 56, 8, 5, BD, 2); c.rect(36, 56, 8, 5, BD, 2)
  },
  'obj-61': (c) => { // Chimpanzini Bananini
    c.path([[10, 46], [18, 26], [34, 12], [54, 10]], 13, Y)
    c.path([[12, 44], [20, 26], [34, 14], [52, 12]], 3, YL)
    c.circle(8, 50, 3, BD); c.circle(57, 10, 3, BD)
    c.circle(34, 32, 11, B)
    c.circle(24, 30, 4, B); c.circle(44, 30, 4, B); c.circle(24, 30, 2, H); c.circle(44, 30, 2, H)
    c.ellipse(34, 33, 8, 7, H)
    c.circle(30, 30, 2.2, W); c.circle(38, 30, 2.2, W); c.circle(30.5, 30.5, 1.1, X); c.circle(38.5, 30.5, 1.1, X)
    c.circle(33, 34, 0.9, BD); c.circle(35, 34, 0.9, BD)
    c.arc(34, 36, 4, 2.5, deg(10), deg(170), BD)
  },
  'obj-62': (c) => { // Ballerina Cappuccina
    c.rect(20, 8, 22, 17, W, 3); c.rect(21, 12, 3, 12, GL)
    c.ring(46, 16, 5, 2.5, W)
    c.ellipse(31, 9, 10, 3.5, B); c.ellipse(29, 8.5, 5, 1.8, T)
    c.poly([[29, 7], [31, 5], [33, 7], [31, 9]], IL)
    c.rect(27, 25, 10, 12, IL, 2)
    c.line(27, 28, 16, 18, 3, H); c.line(37, 28, 48, 18, 3, H)
    c.poly([[8, 42], [56, 42], [48, 50], [16, 50]], I)
    for (const x of [12, 20, 28, 36, 44, 52]) c.circle(x, 42, 4, IL)
    c.rect(26, 36, 12, 6, I, 1)
    c.line(28, 50, 26, 60, 3, H); c.line(36, 50, 38, 60, 3, H)
    c.ellipse(26, 61, 3.5, 2, I); c.ellipse(38, 61, 3.5, 2, I)
  },
  'obj-63': (c) => { // Lirili Larila
    c.circle(14, 18, 8, G); c.circle(50, 18, 8, G); c.circle(14, 18, 4.5, IL); c.circle(50, 18, 4.5, IL)
    c.circle(32, 18, 13, G); c.circle(28, 14, 5, GL)
    c.circle(27, 16, 2.2, W); c.circle(37, 16, 2.2, W); c.circle(27.5, 16.5, 1.1, X); c.circle(37.5, 16.5, 1.1, X)
    c.path([[32, 24], [32, 32], [40, 36], [44, 32]], 5, G); c.circle(44, 31, 2.5, GD)
    c.rect(22, 30, 20, 26, E, 7); c.rect(24, 32, 3, 22, EL); c.rect(31, 32, 2, 22, ED); c.rect(37, 32, 2, 22, ED)
    for (const [x, y] of [[20, 36], [20, 46], [44, 38], [44, 48]]) c.line(x, y, x + (x < 32 ? -3 : 3), y - 1, 1.2, W)
    c.ellipse(26, 59, 5, 2.5, T); c.ellipse(38, 59, 5, 2.5, T); c.line(26, 57, 26, 59, 1.5, B); c.line(38, 57, 38, 59, 1.5, B)
  },
  'obj-64': (c) => { // Cappuccino Assassino
    c.line(6, 58, 30, 30, 4, S); c.line(58, 58, 34, 30, 4, S)
    c.line(6, 58, 12, 52, 5, BD); c.line(58, 58, 52, 52, 5, BD)
    c.ellipse(32, 50, 22, 5, W); c.ellipse(32, 49, 16, 2.5, GL)
    c.rect(18, 16, 28, 30, W, 4); c.rect(20, 20, 3, 22, GL)
    c.ring(49, 30, 6, 3, W)
    c.ellipse(32, 17, 13, 4, T); c.ellipse(30, 16.5, 7, 2, TL); c.circle(36, 17, 1.5, B)
    c.rect(18, 24, 28, 9, X)
    c.line(18, 28, 6, 22, 3, X); c.line(18, 30, 8, 34, 3, X)
    c.rect(24, 27, 5, 3, W); c.rect(35, 27, 5, 3, W)
    c.rect(26, 27, 2, 3, X); c.rect(37, 27, 2, 3, X)
  },
  'obj-65': (c) => { // Boneca Ambalabu
    const TIRE = '#2d2d3a'
    c.ring(32, 46, 16, 8, TIRE)
    for (let a = 0; a < 360; a += 30) c.line(32 + Math.cos(deg(a)) * 12, 46 + Math.sin(deg(a)) * 12, 32 + Math.cos(deg(a)) * 15.5, 46 + Math.sin(deg(a)) * 15.5, 2, '#4b4b5c')
    c.ring(32, 46, 8, 3, S); c.circle(32, 46, 3, GD)
    c.line(24, 60, 22, 63, 4, H); c.line(40, 60, 42, 63, 4, H)
    c.ellipse(32, 22, 16, 11, E)
    c.ellipse(32, 26, 11, 5, EL)
    c.circle(23, 12, 6, E); c.circle(41, 12, 6, E); c.circle(23, 12, 3.5, W); c.circle(41, 12, 3.5, W); c.circle(24, 12, 1.8, X); c.circle(42, 12, 1.8, X)
    c.arc(32, 24, 9, 7.5, deg(20), deg(160), ED)
    c.circle(28, 20, 1, ED); c.circle(36, 20, 1, ED)
  },
}
