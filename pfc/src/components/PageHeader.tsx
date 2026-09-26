import type { ReactNode } from 'react'

interface PageHeaderProps {
  titre: string
  sousTitre?: string
  /** Élément affiché à droite du titre (bouton, badge…). */
  action?: ReactNode
}

export function PageHeader({ titre, sousTitre, action }: PageHeaderProps) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{titre}</h1>
        {sousTitre && <p className="mt-1 text-sm text-texte-2">{sousTitre}</p>}
      </div>
      {action}
    </header>
  )
}
