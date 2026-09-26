import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { Accueil } from '@/pages/Accueil'
import { Assemblage } from '@/pages/Assemblage'
import { Boosters } from '@/pages/Boosters'
import { Classement } from '@/pages/Classement'
import { Inventaire } from '@/pages/Inventaire'
import { NotFound } from '@/pages/NotFound'
import { ObjetDetail } from '@/pages/ObjetDetail'
import { Profil } from '@/pages/Profil'
import { Recettes } from '@/pages/Recettes'
import { Arena } from '@/pages/battle/Arena'
import { DeckBuilder } from '@/pages/battle/DeckBuilder'
import { Hub } from '@/pages/battle/Hub'
import { OpponentPicker } from '@/pages/battle/OpponentPicker'
import { Welcome } from '@/pages/battle/Welcome'

/**
 * Route table. Each page is an independent component in `src/pages`,
 * so the team can split the work page by page. The arena and the
 * first-login warm-up render full screen, outside the shared layout.
 */
const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <Navigate to="/home" replace /> },
      { path: '/home', element: <Accueil /> },
      { path: '/battle', element: <Hub /> },
      { path: '/battle/deck', element: <DeckBuilder /> },
      { path: '/battle/opponent', element: <OpponentPicker /> },
      { path: '/inventory', element: <Inventaire /> },
      { path: '/item/:id', element: <ObjetDetail /> },
      { path: '/boosters', element: <Boosters /> },
      { path: '/crafting', element: <Assemblage /> },
      { path: '/recipes', element: <Recettes /> },
      { path: '/leaderboard', element: <Classement /> },
      { path: '/profile', element: <Profil /> },
      { path: '*', element: <NotFound /> },
    ],
  },
  { path: '/battle/:id', element: <Arena /> },
  { path: '/welcome', element: <Welcome /> },
])

export default function App() {
  return <RouterProvider router={router} />
}
