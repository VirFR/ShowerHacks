import { NavLink } from 'react-router-dom'
import { useSession } from '@/lib/session'
import { Icon, type IconName } from './Icon'

interface LienNav {
  to: string
  label: string
  icone: IconName
}

/** Links of the navigation bar shared by every page. */
const LIENS_NAV: LienNav[] = [
  { to: '/home', label: 'Home', icone: 'home' },
  { to: '/battle', label: 'Battle', icone: 'swords' },
  { to: '/inventory', label: 'Inventory', icone: 'bag' },
  { to: '/boosters', label: 'Boosters', icone: 'gift' },
  { to: '/crafting', label: 'Crafting', icone: 'flask' },
  { to: '/leaderboard', label: 'Leaderboard', icone: 'trophy' },
  { to: '/profile', label: 'Profile', icone: 'user' },
]

/**
 * Shared navigation: bottom bar on mobile, side column from the `md`
 * breakpoint up. One component, two layouts via Tailwind.
 */
export function Navigation() {
  const { joueur } = useSession()

  return (
    <nav
      aria-label="Main navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-bordure bg-fond-2/95 backdrop-blur md:inset-y-0 md:left-0 md:w-56 md:border-t-0 md:border-r"
    >
      <div className="hidden items-center gap-3 px-5 py-6 md:flex">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/20 text-accent-2">
          <Icon name="swords" size={22} />
        </span>
        <div>
          <p className="font-display text-lg font-bold tracking-tight">PFC</p>
          <p className="text-xs text-texte-2">Objects at war</p>
        </div>
      </div>

      <ul className="flex justify-around px-1 py-1 md:flex-col md:gap-1 md:px-3 md:py-0">
        {LIENS_NAV.map((lien) => (
          <li key={lien.to} className="min-w-0 flex-1 md:flex-none">
            <NavLink
              to={lien.to}
              end={lien.to === '/battle'}
              className={({ isActive }) =>
                [
                  'flex flex-col items-center gap-0.5 rounded-lg px-1 py-2 text-[11px] transition-colors md:flex-row md:gap-3 md:px-3 md:py-2.5 md:text-sm',
                  isActive
                    ? 'bg-accent/20 text-accent-2 md:font-semibold'
                    : 'text-texte-2 hover:bg-carte hover:text-texte',
                ].join(' ')
              }
            >
              <Icon name={lien.icone} size={20} />
              <span className="max-w-full truncate">{lien.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="hidden px-5 pt-6 text-xs text-texte-2 md:block">
        {joueur ? (
          <>
            Signed in as <span className="font-semibold text-texte">{joueur.pseudo}</span>
          </>
        ) : (
          'Not signed in'
        )}
      </div>
    </nav>
  )
}
