import type { ReactNode } from 'react'

interface PageHeaderProps {
  titre: string
  sousTitre?: string
  /** Element rendered to the right of the title (button, badge…). */
  action?: ReactNode
}

/** Page title in the pixel font on a blue tab, subtitle in the body font below. */
export function PageHeader({ titre, sousTitre, action }: PageHeaderProps) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <h1 className="inline-block max-w-full rounded-lg border-2 border-ink bg-accent px-3 py-2 font-pixel text-sm text-white shadow-hard-sm md:text-lg">
          {titre}
        </h1>
        {sousTitre && <p className="mt-2 text-sm font-medium text-texte-2">{sousTitre}</p>}
      </div>
      {action}
    </header>
  )
}
