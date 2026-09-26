import type { Rang } from '@/types'
import { CLASSE_RANG, formaterNombre } from '@/lib/format'

interface CarteRangProps {
  rang: Rang
  score: number
  taille?: 'sm' | 'lg'
}

/** Rank medallion with a gradient, reused on the home and profile pages. */
export function CarteRang({ rang, score, taille = 'sm' }: CarteRangProps) {
  const grand = taille === 'lg'
  return (
    <div className="flex items-center gap-3">
      <div
        className={[
          'flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br font-black text-fond shadow-lg',
          CLASSE_RANG[rang],
          grand ? 'h-20 w-20 text-3xl' : 'h-12 w-12 text-lg',
        ].join(' ')}
        aria-hidden
      >
        {rang.charAt(0)}
      </div>
      <div>
        <p className={`font-bold ${grand ? 'text-2xl' : 'text-base'}`}>{rang}</p>
        <p className="text-sm text-texte-2 tabular-nums">{formaterNombre(score)} pts</p>
      </div>
    </div>
  )
}
