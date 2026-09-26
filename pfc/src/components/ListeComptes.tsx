import { Avatar } from './Avatar'
import type { Joueur } from '@/types'

interface ListeComptesProps {
  comptes: Joueur[]
  actuelId?: string
  onChoisir: (id: string) => void
}

/** Mock mode: the test accounts, one button each. */
export function ListeComptes({ comptes, actuelId, onChoisir }: ListeComptesProps) {
  return (
    <div className="grid w-full gap-3 sm:grid-cols-2">
      {comptes.map((c) => {
        const actuel = c.id === actuelId
        return (
          <button
            key={c.id}
            type="button"
            disabled={actuel}
            onClick={() => onChoisir(c.id)}
            aria-pressed={actuel}
            className={[
              'flex items-center gap-4 rounded-2xl border p-4 text-left transition-all',
              actuel
                ? 'cursor-default border-accent-2 bg-accent/15 ring-2 ring-accent/60'
                : 'border-bordure bg-carte hover:border-accent/60 hover:bg-carte-2',
            ].join(' ')}
          >
            <Avatar pseudo={c.pseudo} avatarUrl={c.avatarUrl} taille="md" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{c.pseudo}</p>
              <p className="text-xs text-texte-2">
                {c.rang} · {c.score} pts · {c.inventaire.length} item{c.inventaire.length === 1 ? '' : 's'}
              </p>
            </div>
            <span className="text-xs font-medium text-accent-2">{actuel ? 'Signed in' : 'Sign in →'}</span>
          </button>
        )
      })}
    </div>
  )
}
