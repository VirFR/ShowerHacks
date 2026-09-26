interface StatBadgeProps {
  type: 'attaque' | 'defense'
  valeur: number
  taille?: 'sm' | 'md'
}

const CONFIG = {
  attaque: { icone: '⚔️', label: 'ATQ', classe: 'text-attaque' },
  defense: { icone: '🛡️', label: 'DEF', classe: 'text-defense' },
}

/** Affiche une stat d'attaque ou de défense avec son icône. */
export function StatBadge({ type, valeur, taille = 'sm' }: StatBadgeProps) {
  const { icone, label, classe } = CONFIG[type]
  return (
    <span
      className={[
        'inline-flex items-center gap-1 rounded-md bg-fond/60 font-semibold tabular-nums',
        taille === 'sm' ? 'px-1.5 py-0.5 text-xs' : 'px-2.5 py-1 text-sm',
        classe,
      ].join(' ')}
      title={type === 'attaque' ? 'Attaque' : 'Défense'}
    >
      <span aria-hidden>{icone}</span>
      <span className="sr-only">{type === 'attaque' ? 'Attaque' : 'Défense'} </span>
      <span className="text-texte-2">{label}</span> {valeur}
    </span>
  )
}
