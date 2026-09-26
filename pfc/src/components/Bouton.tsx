import type { ButtonHTMLAttributes } from 'react'

type Variante = 'primaire' | 'secondaire' | 'danger' | 'fantome' | 'clair' | 'or'

interface BoutonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante
  taille?: 'sm' | 'md' | 'lg'
}

/** Chunky handheld-style buttons: solid fill, dark outline, a 3px edge that presses in. */
const CLASSES_VARIANTE: Record<Variante, string> = {
  primaire: 'border-ink bg-accent text-white hover:bg-accent-2 disabled:bg-accent/50',
  secondaire: 'border-ink bg-carte text-texte hover:bg-carte-2 disabled:text-texte-2',
  danger: 'border-ink bg-echec text-white hover:brightness-110 disabled:bg-echec/50',
  fantome: 'border-transparent bg-transparent text-texte-2 shadow-none hover:bg-carte-2 hover:text-texte active:translate-y-0',
  clair: 'border-ink bg-white text-ink hover:bg-carte-2 disabled:bg-white/60',
  or: 'border-ink bg-or text-ink hover:brightness-110 disabled:bg-or/50',
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
        'inline-flex items-center justify-center gap-2 rounded-lg border-2 font-display font-bold tracking-wide transition-all',
        'shadow-[0_3px_0_0_var(--color-ink)] active:translate-y-[3px] active:shadow-none',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-or',
        'disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0',
        CLASSES_VARIANTE[variante],
        CLASSES_TAILLE[taille],
        className,
      ].join(' ')}
      {...props}
    />
  )
}
