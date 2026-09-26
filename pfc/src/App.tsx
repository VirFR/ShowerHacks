import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { Accueil } from '@/pages/Accueil'
import { Assemblage } from '@/pages/Assemblage'
import { Boosters } from '@/pages/Boosters'
import { Classement } from '@/pages/Classement'
import { Combat } from '@/pages/Combat'
import { Inventaire } from '@/pages/Inventaire'
import { NotFound } from '@/pages/NotFound'
import { ObjetDetail } from '@/pages/ObjetDetail'
import { Profil } from '@/pages/Profil'
import { Recettes } from '@/pages/Recettes'

/**
 * Route table. Each page is an independent component in `src/pages`,
 * so the team can split the work page by page.
 */
const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <Navigate to="/home" replace /> },
      { path: '/home', element: <Accueil /> },
      { path: '/battle', element: <Combat /> },
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
])

export default function App() {
  return <RouterProvider router={router} />
}
