import { NavLink } from 'react-router-dom'
import { useSession } from '@/lib/session'
import { Icon, type IconName } from './Icon'
import { LogoMark } from './Logo'

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
  { to: '/recipes', label: 'Recipes', icone: 'book' },
  { to: '/leaderboard', label: 'Leaderboard', icone: 'trophy' },
  { to: '/profile', label: 'Profile', icone: 'user' },
]

/**
 * Shared navigation, styled like a handheld's bottom screen: a row of icon
 * tiles at the bottom on mobile, a framed side panel from `md` up.
 */
export function Navigation() {
  const { joueur } = useSession()

  return (
    <nav
      aria-label="Main navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t-4 border-ink bg-carte md:inset-y-6 md:left-6 md:w-52 md:rounded-2xl md:border-4 md:shadow-hard"
    >
      <div className="hidden items-center gap-3 border-b-2 border-ink px-4 py-4 md:flex">
        <LogoMark size={44} />
        <div className="min-w-0">
          <p className="font-pixel text-sm">RPS</p>
          <p className="text-[11px] font-semibold text-texte-2">Objects at war</p>
        </div>
      </div>

      <ul className="flex justify-around gap-1 px-1 py-1.5 md:flex-col md:gap-1.5 md:px-3 md:py-3">
        {LIENS_NAV.map((lien) => (
          <li key={lien.to} className="min-w-0 flex-1 md:flex-none">
            <NavLink
              to={lien.to}
              end={lien.to === '/battle'}
              title={lien.label}
              aria-label={lien.label}
              className={({ isActive }) =>
                [
                  'flex flex-col items-center justify-center gap-0.5 rounded-lg border-2 px-1 py-2 text-[10px] font-bold transition-all md:flex-row md:justify-start md:gap-3 md:px-3 md:py-2 md:text-sm',
                  isActive
                    ? 'border-ink bg-accent text-white shadow-hard-sm'
                    : 'border-transparent text-texte-2 hover:border-ink hover:bg-carte-2 hover:text-texte',
                ].join(' ')
              }
            >
              <Icon name={lien.icone} size={22} strokeWidth={2.4} />
              <span className="hidden max-w-full truncate sm:block">{lien.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="hidden border-t-2 border-ink px-4 py-3 text-xs font-medium text-texte-2 md:block">
        {joueur ? (
          <>
            Signed in as <span className="font-bold text-texte">{joueur.pseudo}</span>
          </>
        ) : (
          'Not signed in'
        )}
        <p className="mt-2 text-[10px] font-medium text-texte-2/80">
          Icons by{' '}
          <a href="https://game-icons.net" target="_blank" rel="noreferrer" className="underline hover:text-texte">
            game-icons.net
          </a>{' '}
          (CC BY 3.0)
        </p>
      </div>
    </nav>
  )
}
