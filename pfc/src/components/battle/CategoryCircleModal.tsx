import { Icon } from '@/components/Icon'
import { categoryCycle, categoryLabel, type Chart } from '@/lib/engine'
import { couleurCategorie } from '@/lib/format'

interface CategoryCircleModalProps {
  chart: Chart
  onClose: () => void
}

const SIZE = 340
const CENTER = SIZE / 2
const NODE_RADIUS = 108
const LABEL_RADIUS = 148
const NODE_SIZE = 9

function pointOn(angle: number, radius: number) {
  return { x: CENTER + radius * Math.cos(angle), y: CENTER + radius * Math.sin(angle) }
}

/**
 * Full category circle: every category's advantage over every other one,
 * not just its single closest counter — the closest neighbor is a strong
 * (+22 fighting points) edge, the next one out a weaker (+17) edge, and the
 * category directly opposite is neutral (both sides' small edges cancel).
 */
export function CategoryCircleModal({ chart, onClose }: CategoryCircleModalProps) {
  const cats = categoryCycle(chart)
  const n = cats.length
  const angleFor = (i: number) => (i / n) * 2 * Math.PI - Math.PI / 2
  const nodes = cats.map((cat, i) => ({
    cat,
    ...pointOn(angleFor(i), NODE_RADIUS),
    label: pointOn(angleFor(i), LABEL_RADIUS),
  }))

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-fond/85 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal
      aria-labelledby="category-circle-title"
      onClick={onClose}
    >
      <div
        className="animate-rise w-full max-w-lg rounded-2xl border-4 border-ink bg-fond-2 p-6 shadow-hard"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="category-circle-title" className="font-display text-xl font-bold">
              The full category circle
            </h2>
            <p className="mt-1 text-sm text-texte-2">Every category's edge over every other — not just who it's "stronger against."</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 rounded-lg border-2 border-ink bg-carte p-1.5 shadow-hard-sm transition-transform hover:-translate-y-0.5"
          >
            <Icon name="x" size={16} />
          </button>
        </div>

        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="mx-auto mt-2 h-80 w-80" role="img" aria-label="Category advantage circle">
          <defs>
            <marker id="circle-arrow-strong" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill="var(--color-ink)" />
            </marker>
            <marker id="circle-arrow-weak" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="5.5" markerHeight="5.5" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill="#9aa3bd" />
            </marker>
          </defs>

          {/* second-closest advantage (+17): curved, thin, dashed */}
          {nodes.map((p, i) => {
            const q = nodes[(i + 2) % n]
            const pull = pointOn((angleFor(i) + angleFor((i + 2) % n)) / 2, NODE_RADIUS * 0.4)
            return (
              <path
                key={`weak-${p.cat}`}
                d={`M ${p.x} ${p.y} Q ${pull.x} ${pull.y} ${q.x} ${q.y}`}
                fill="none"
                stroke="#9aa3bd"
                strokeWidth={1.5}
                strokeDasharray="4 3"
                markerEnd="url(#circle-arrow-weak)"
              />
            )
          })}

          {/* closest advantage (+22): straight hexagon edges, on top */}
          {nodes.map((p, i) => {
            const q = nodes[(i + 1) % n]
            return (
              <line
                key={`strong-${p.cat}`}
                x1={p.x}
                y1={p.y}
                x2={q.x}
                y2={q.y}
                stroke="var(--color-ink)"
                strokeWidth={2.5}
                markerEnd="url(#circle-arrow-strong)"
              />
            )
          })}

          {/* category nodes + labels */}
          {nodes.map((p) => (
            <g key={p.cat}>
              <circle cx={p.x} cy={p.y} r={NODE_SIZE} fill={couleurCategorie(p.cat)} stroke="var(--color-ink)" strokeWidth={2} />
              <text
                x={p.label.x}
                y={p.label.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={12.5}
                fontWeight={800}
                fill="var(--color-ink)"
                className="font-display"
              >
                {categoryLabel(chart, p.cat)}
              </text>
            </g>
          ))}
        </svg>

        <div className="mt-2 space-y-1.5 text-xs text-texte-2">
          <p className="flex items-center gap-2">
            <span className="h-0.5 w-6 shrink-0 rounded bg-ink" aria-hidden />
            Closest advantage — +22 fighting points
          </p>
          <p className="flex items-center gap-2">
            <span className="h-0 w-6 shrink-0 border-t-2 border-dashed border-[#9aa3bd]" aria-hidden />
            Second-closest advantage — +17 fighting points
          </p>
          <p>The category directly opposite is neutral: both sides' small edges cancel out.</p>
          <p>Fighting points (rarity + this bonus) decide most clashes; attack, defense and rarity break the rest.</p>
        </div>
      </div>
    </div>
  )
}
