import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { estOnboarde, useSession } from '@/lib/session'
import { Navigation } from './Navigation'

/**
 * Shared shell: navigation + content area.
 * Bottom (mobile) / left (desktop) padding leaves room for the nav.
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
      <main className="mx-auto w-full max-w-5xl px-4 pb-24 pt-6 md:pb-10 md:pl-64 md:pr-8 md:pt-10">
        <Outlet />
      </main>
    </div>
  )
}
