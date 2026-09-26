import { Outlet } from 'react-router-dom'
import { Navigation } from './Navigation'

/**
 * Gabarit commun : navigation + zone de contenu.
 * Le padding bas (mobile) / gauche (desktop) réserve la place de la nav.
 */
export function Layout() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="mx-auto w-full max-w-5xl px-4 pb-24 pt-6 md:pb-10 md:pl-64 md:pr-8 md:pt-10">
        <Outlet />
      </main>
    </div>
  )
}
