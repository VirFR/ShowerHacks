import type { HTMLAttributes } from 'react'

/** Generic panel: white, hard 2px outline and a flat offset shadow (sticker look). */
export function Carte({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <section
      className={`rounded-xl border-2 border-ink bg-carte p-4 shadow-hard md:p-5 ${className}`}
      {...props}
    />
  )
}
