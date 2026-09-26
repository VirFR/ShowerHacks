import type { HTMLAttributes } from 'react'

/** Conteneur générique à fond sombre et bordure, utilisé pour les sections. */
export function Carte({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <section
      className={`rounded-2xl border border-bordure bg-carte p-4 md:p-5 ${className}`}
      {...props}
    />
  )
}
