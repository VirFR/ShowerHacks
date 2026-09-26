import { NavLink } from 'react-router-dom'
import { useSession } from '@/lib/session'

interface LienNav {
  to: string
  label: string
  icone: string
}

/** Liens de la barre de navigation commune à toutes les pages. */
const LIENS_NAV: LienNav[] = [
  { to: '/accueil', label: 'Accueil', icone: '🏠' },
  { to: '/combat', label: 'Combat', icone: '⚔️' },
  { to: '/inventaire', label: 'Inventaire', icone: '🎒' },
  { to: '/boosters', label: 'Boosters', icone: '🎁' },
  { to: '/assemblage', label: 'Assemblage', icone: '🧪' },
  { to: '/classement', label: 'Classement', icone: '🏆' },
  { to: '/profil', label: 'Profil', icone: '👤' },
]

/**
 * Navigation commune : barre en bas sur mobile, colonne latérale à partir
 * du breakpoint `md`. Un seul composant, deux mises en page via Tailwind.
 */
export function Navigation() {
  const { joueur } = useSession()

  return (
    <nav
      aria-label="Navigation principale"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-bordure bg-fond-2/95 backdrop-blur md:inset-y-0 md:left-0 md:w-56 md:border-t-0 md:border-r"
    >
      <div className="hidden items-center gap-3 px-5 py-6 md:flex">
        <span className="text-3xl">✊</span>
        <div>
          <p className="text-lg font-bold tracking-tight">PFC</p>
          <p className="text-xs text-texte-2">Pierre Feuille Ciseaux</p>
        </div>
      </div>

      <ul className="flex justify-around px-1 py-1 md:flex-col md:gap-1 md:px-3 md:py-0">
        {LIENS_NAV.map((lien) => (
          <li key={lien.to} className="min-w-0 flex-1 md:flex-none">
            <NavLink
              to={lien.to}
              className={({ isActive }) =>
                [
                  'flex flex-col items-center gap-0.5 rounded-lg px-1 py-2 text-[11px] transition-colors md:flex-row md:gap-3 md:px-3 md:py-2.5 md:text-sm',
                  isActive
                    ? 'bg-accent/20 text-accent-2 md:font-semibold'
                    : 'text-texte-2 hover:bg-carte hover:text-texte',
                ].join(' ')
              }
            >
              <span className="text-lg md:text-xl" aria-hidden>
                {lien.icone}
              </span>
              <span className="max-w-full truncate">{lien.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="hidden px-5 pt-6 text-xs text-texte-2 md:block">
        {joueur ? (
          <>
            Connecté : <span className="font-semibold text-texte">{joueur.pseudo}</span>
          </>
        ) : (
          'Non connecté'
        )}
      </div>
    </nav>
  )
}
