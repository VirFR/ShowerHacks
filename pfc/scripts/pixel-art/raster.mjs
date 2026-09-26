/**
 * Tiny pixel rasterizer: draws shapes onto a SIZE×SIZE grid by sampling
 * pixel centers, then adds a 1px outline around the silhouette. No deps.
 */
export const SIZE = 64
export const OUTLINE = '#1b1730'

export function hex(h) {
  const n = parseInt(h.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
export function rgb([r, g, b]) {
  return '#' + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('')
}
/** Mix a color toward black (f<0) or white (f>0). */
export function shade(h, f) {
  const c = hex(h)
  return rgb(c.map((v) => (f < 0 ? v * (1 + f) : v + (255 - v) * f)))
}
export const dark = (h, f = 0.25) => shade(h, -f)
export const light = (h, f = 0.25) => shade(h, f)

export class Canvas {
  constructor() {
    this.px = new Array(SIZE * SIZE).fill(null)
  }
  set(x, y, color) {
    if (x < 0 || y < 0 || x >= SIZE || y >= SIZE) return
    this.px[y * SIZE + x] = color
  }
  get(x, y) {
    if (x < 0 || y < 0 || x >= SIZE || y >= SIZE) return null
    return this.px[y * SIZE + x]
  }
  /** Fill every pixel whose center satisfies `test(cx, cy)`. */
  fillWhere(test, color, bbox) {
    const [x0, y0, x1, y1] = bbox ?? [0, 0, SIZE, SIZE]
    for (let y = Math.max(0, Math.floor(y0)); y < Math.min(SIZE, Math.ceil(y1)); y++)
      for (let x = Math.max(0, Math.floor(x0)); x < Math.min(SIZE, Math.ceil(x1)); x++)
        if (test(x + 0.5, y + 0.5)) this.set(x, y, color)
  }
  rect(x, y, w, h, color, r = 0) {
    this.fillWhere((cx, cy) => {
      if (cx < x || cy < y || cx > x + w || cy > y + h) return false
      if (!r) return true
      const dx = Math.max(x + r - cx, 0, cx - (x + w - r))
      const dy = Math.max(y + r - cy, 0, cy - (y + h - r))
      return dx * dx + dy * dy <= r * r
    }, color, [x, y, x + w, y + h])
  }
  ellipse(cx, cy, rx, ry, color) {
    this.fillWhere((px, py) => ((px - cx) / rx) ** 2 + ((py - cy) / ry) ** 2 <= 1, color, [cx - rx, cy - ry, cx + rx, cy + ry])
  }
  circle(cx, cy, r, color) {
    this.ellipse(cx, cy, r, r, color)
  }
  ring(cx, cy, rOut, rIn, color) {
    this.fillWhere((px, py) => {
      const d = (px - cx) ** 2 + (py - cy) ** 2
      return d <= rOut * rOut && d >= rIn * rIn
    }, color, [cx - rOut, cy - rOut, cx + rOut, cy + rOut])
  }
  /** Polygon from [x,y] pairs, even-odd rule. */
  poly(points, color) {
    const xs = points.map((p) => p[0]), ys = points.map((p) => p[1])
    this.fillWhere((px, py) => {
      let inside = false
      for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
        const [xi, yi] = points[i], [xj, yj] = points[j]
        if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) inside = !inside
      }
      return inside
    }, color, [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)])
  }
  /** Thick line segment with round caps. */
  line(x1, y1, x2, y2, w, color) {
    const hw = w / 2
    this.fillWhere((px, py) => {
      const dx = x2 - x1, dy = y2 - y1
      const len2 = dx * dx + dy * dy || 1
      let t = ((px - x1) * dx + (py - y1) * dy) / len2
      t = Math.max(0, Math.min(1, t))
      const ex = x1 + t * dx - px, ey = y1 + t * dy - py
      return ex * ex + ey * ey <= hw * hw
    }, color, [Math.min(x1, x2) - hw, Math.min(y1, y2) - hw, Math.max(x1, x2) + hw, Math.max(y1, y2) + hw])
  }
  /** Poly-line through points. */
  path(points, w, color) {
    for (let i = 1; i < points.length; i++) this.line(points[i - 1][0], points[i - 1][1], points[i][0], points[i][1], w, color)
  }
  star(cx, cy, rOut, rIn, n, color, rot = -Math.PI / 2) {
    const pts = []
    for (let i = 0; i < n * 2; i++) {
      const r = i % 2 ? rIn : rOut, a = rot + (i * Math.PI) / n
      pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)])
    }
    this.poly(pts, color)
  }
  /** Ellipse wedge between angles (radians). */
  arc(cx, cy, rOut, rIn, a0, a1, color) {
    this.fillWhere((px, py) => {
      const d = (px - cx) ** 2 + (py - cy) ** 2
      if (d > rOut * rOut || d < rIn * rIn) return false
      let a = Math.atan2(py - cy, px - cx)
      while (a < a0) a += Math.PI * 2
      return a <= a1
    }, color, [cx - rOut, cy - rOut, cx + rOut, cy + rOut])
  }
  /** Simple 2×2 checker dither of `color` over a region test. */
  dither(test, color, bbox) {
    this.fillWhere((cx, cy) => ((Math.floor(cx) + Math.floor(cy)) & 1) === 0 && test(cx, cy), color, bbox)
  }
  /** 1px outline around everything drawn so far (4-neighbour). */
  outline(color = OUTLINE) {
    const add = []
    for (let y = 0; y < SIZE; y++)
      for (let x = 0; x < SIZE; x++) {
        if (this.get(x, y)) continue
        if (this.get(x - 1, y) || this.get(x + 1, y) || this.get(x, y - 1) || this.get(x, y + 1)) add.push([x, y])
      }
    for (const [x, y] of add) this.set(x, y, color)
  }
  /** Darken the bottom-right of the silhouette for a cheap 3D feel. */
  shadow(f = 0.18) {
    for (let y = 0; y < SIZE; y++)
      for (let x = 0; x < SIZE; x++) {
        const c = this.get(x, y)
        if (!c || c === OUTLINE) continue
        // Pixel is on the lower/right rim if a neighbour down or right is empty or outline.
        const dr = this.get(x + 1, y), dd = this.get(x, y + 1)
        if (dr === null || dd === null || dr === OUTLINE || dd === OUTLINE) this.set(x, y, dark(c, f))
      }
  }
  toSvg() {
    // Merge horizontal runs, then stack identical runs vertically.
    const runs = []
    let prevRow = new Map()
    for (let y = 0; y < SIZE; y++) {
      const row = new Map()
      let x = 0
      while (x < SIZE) {
        const c = this.get(x, y)
        let w = 1
        while (x + w < SIZE && this.get(x + w, y) === c) w++
        if (c) {
          const key = `${x}:${w}:${c}`
          const above = prevRow.get(key)
          if (above && above.y + above.h === y) {
            above.h++
            row.set(key, above)
          } else {
            const run = { x, y, w, h: 1, c }
            runs.push(run)
            row.set(key, run)
          }
        }
        x += w
      }
      prevRow = row
    }
    const rects = runs.map((r) => `<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" fill="${r.c}"/>`).join('')
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SIZE} ${SIZE}" shape-rendering="crispEdges">${rects}</svg>\n`
  }
}
