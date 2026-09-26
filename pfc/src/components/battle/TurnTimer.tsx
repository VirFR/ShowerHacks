import { useEffect, useRef, useState } from 'react'
import { Icon } from '@/components/Icon'

interface TurnTimerProps {
  /** Seconds allowed for the decision. */
  duree: number
  /** Restarts the countdown whenever this changes. */
  cle: string | number
  actif: boolean
  onExpire: () => void
}

/** Countdown for the current decision; calls `onExpire` once at zero. */
export function TurnTimer({ cle, ...props }: TurnTimerProps) {
  return <Compteur key={cle} {...props} />
}

function Compteur({ duree, actif, onExpire }: Omit<TurnTimerProps, 'cle'>) {
  const [restant, setRestant] = useState(duree)
  const expireRef = useRef(onExpire)

  useEffect(() => {
    expireRef.current = onExpire
  }, [onExpire])

  useEffect(() => {
    if (!actif) return
    const debut = Date.now()
    const id = window.setInterval(() => {
      const r = Math.max(0, duree - Math.floor((Date.now() - debut) / 1000))
      setRestant(r)
      if (r === 0) {
        window.clearInterval(id)
        expireRef.current()
      }
    }, 250)
    return () => window.clearInterval(id)
  }, [actif, duree])

  const urgent = actif && restant <= 5
  return (
    <div
      className={[
        'inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 font-display text-base font-bold tabular-nums transition-colors',
        urgent ? 'border-echec/60 bg-echec/15 text-echec' : 'border-bordure bg-carte text-texte',
        !actif ? 'opacity-50' : '',
      ].join(' ')}
      role="timer"
      aria-live={urgent ? 'assertive' : 'off'}
    >
      <Icon name="clock" size={16} className={urgent ? 'text-echec' : 'text-or'} />
      {restant} s
    </div>
  )
}
