/**
 * RPS brand marks: the "clash burst" (a comic-style impact star) and the
 * wordmark lockups built on it. Everything is inline SVG + the pixel font,
 * so it stays crisp at any size and follows the theme tokens.
 */
const BURST =
  '62,32 52.3,37.4 58,47 46.8,46.8 47,58 37.4,52.3 32,62 26.6,52.3 17,58 17.2,46.8 6,47 11.7,37.4 2,32 11.7,26.6 6,17 17.2,17.2 17,6 26.6,11.7 32,2 37.4,11.7 47,6 46.8,17.2 58,17 52.3,26.6'

interface LogoMarkProps {
  size?: number
  className?: string
}

/** The burst alone (nav, favicon-sized uses). */
export function LogoMark({ size = 40, className = '' }: LogoMarkProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 66 66" aria-hidden className={`shrink-0 ${className}`}>
      <polygon fill="var(--color-ink)" transform="translate(3 3)" points={BURST} />
      <polygon fill="var(--color-ink)" points={BURST} />
      <polygon fill="#ffcc33" transform="translate(32 32) scale(0.9) translate(-32 -32)" points={BURST} />
      <polygon fill="#ff9f1c" transform="translate(32 32) scale(0.64) translate(-32 -32)" points={BURST} />
      <polygon fill="#ffffff" opacity="0.55" points="20,20 27,17 24,24" />
    </svg>
  )
}

interface LogoLockupProps {
  /** Burst diameter in px; the wordmark scales with it. */
  size?: number
  /** Show the "Objects at war" ribbon under the burst. */
  ribbon?: boolean
  className?: string
}

/** Burst with "RPS" punched through it, and optionally the tagline ribbon. */
export function LogoLockup({ size = 220, ribbon = true, className = '' }: LogoLockupProps) {
  const fontSize = Math.round(size * 0.25)
  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <LogoMark size={size} className="absolute inset-0" />
        <span
          className="relative font-pixel text-ink"
          style={{
            fontSize,
            lineHeight: 1,
            paddingTop: Math.round(size * 0.015),
            textShadow: `${Math.round(size * 0.016)}px ${Math.round(size * 0.016)}px 0 #ffffff, ${Math.round(size * 0.025)}px ${Math.round(size * 0.025)}px 0 var(--color-ink)`,
          }}
        >
          RPS
        </span>
      </div>
      {ribbon && (
        <div className="relative flex items-center justify-center">
          <div
            className="absolute bg-ink"
            style={{ inset: '-3px -5px', clipPath: 'polygon(0 0, 100% 0, calc(100% - 13px) 50%, 100% 100%, 0 100%, 13px 50%)' }}
          />
          <div
            className="relative bg-accent px-9 py-2 font-display text-sm font-bold uppercase tracking-[0.26em] text-white"
            style={{ clipPath: 'polygon(0 0, 100% 0, calc(100% - 11px) 50%, 100% 100%, 0 100%, 11px 50%)' }}
          >
            Objects at war
          </div>
        </div>
      )}
    </div>
  )
}
