import { Icon } from './Icon'

interface StatBadgeProps {
  type: 'attaque' | 'defense'
  valeur: number
  taille?: 'sm' | 'md'
}

const CONFIG = {
  attaque: { icone: 'swords', label: 'ATK', classe: 'text-attaque' },
  defense: { icone: 'shield', label: 'DEF', classe: 'text-defense' },
} as const

/** Displays an attack or defense stat with its icon. */
export function StatBadge({ type, valeur, taille = 'sm' }: StatBadgeProps) {
  const { icone, label, classe } = CONFIG[type]
  return (
    <span
      className={[
        'inline-flex items-center gap-1 rounded-md bg-fond/60 font-semibold tabular-nums',
        taille === 'sm' ? 'px-1.5 py-0.5 text-xs' : 'px-2.5 py-1 text-sm',
        classe,
      ].join(' ')}
      title={type === 'attaque' ? 'Attack' : 'Defense'}
    >
      <Icon name={icone} size={taille === 'sm' ? 12 : 14} />
      <span className="sr-only">{type === 'attaque' ? 'Attack' : 'Defense'} </span>
      <span className="text-texte-2">{label}</span> {valeur}
    </span>
  )
}
