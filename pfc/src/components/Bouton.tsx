import type { ButtonHTMLAttributes } from 'react'

type Variante = 'primaire' | 'secondaire' | 'danger' | 'fantome' | 'clair' | 'or'

interface BoutonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante
  taille?: 'sm' | 'md' | 'lg'
}

const CLASSES_VARIANTE: Record<Variante, string> = {
  primaire:
    'bg-accent text-white shadow-lg shadow-accent/30 hover:bg-accent-2 disabled:bg-accent/40 disabled:shadow-none',
  secondaire:
    'bg-carte text-texte ring-1 ring-bordure hover:bg-carte-2 disabled:text-texte-2',
  danger: 'bg-attaque text-white hover:brightness-110 disabled:bg-attaque/40',
  fantome: 'text-texte-2 hover:bg-carte hover:text-texte',
  clair: 'bg-white text-fond shadow-lg shadow-white/10 hover:bg-slate-200 disabled:bg-white/50',
  or: 'bg-or text-fond shadow-lg shadow-or/30 hover:bg-amber-300 disabled:bg-or/40',
}

const CLASSES_TAILLE = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}

export function Bouton({
  variante = 'primaire',
  taille = 'md',
  className = '',
  type = 'button',
  ...props
}: BoutonProps) {
  return (
    <button
      type={type}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-2',
        'disabled:cursor-not-allowed',
        CLASSES_VARIANTE[variante],
        CLASSES_TAILLE[taille],
        className,
      ].join(' ')}
      {...props}
    />
  )
}
