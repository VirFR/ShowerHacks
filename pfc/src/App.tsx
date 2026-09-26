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

/**
 * Table des routes. Chaque page est un composant indépendant dans `src/pages`,
 * ce qui permet de se répartir le travail page par page.
 */
const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <Navigate to="/accueil" replace /> },
      { path: '/accueil', element: <Accueil /> },
      { path: '/combat', element: <Combat /> },
      { path: '/inventaire', element: <Inventaire /> },
      { path: '/objet/:id', element: <ObjetDetail /> },
      { path: '/boosters', element: <Boosters /> },
      { path: '/assemblage', element: <Assemblage /> },
      { path: '/classement', element: <Classement /> },
      { path: '/profil', element: <Profil /> },
      { path: '*', element: <NotFound /> },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
