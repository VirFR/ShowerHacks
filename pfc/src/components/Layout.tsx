import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { estOnboarde, useSession } from '@/lib/session'
import { Navigation } from './Navigation'

/**
 * Shared shell: navigation + content area.
 * The content sits inside a framed "top screen" panel; the bottom (mobile)
 * or left (desktop) padding leaves room for the nav.
 * A signed-in player who has not done the first-login warm-up is sent
 * to /welcome; visitors can browse everything.
 */
export function Layout() {
  const { joueur, chargement } = useSession()
  const { pathname } = useLocation()

  if (!chargement && joueur && !estOnboarde(joueur) && pathname !== '/welcome') {
    return <Navigate to="/welcome" replace />
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="px-3 pb-24 pt-3 md:pb-6 md:pl-64 md:pr-6 md:pt-6">
        <main className="mx-auto w-full max-w-5xl rounded-2xl border-4 border-ink bg-fond-2/60 px-4 py-6 shadow-hard md:px-8 md:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
