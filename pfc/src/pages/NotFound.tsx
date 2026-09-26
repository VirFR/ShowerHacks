import { Link } from 'react-router-dom'
import { Bouton } from '@/components/Bouton'

export function NotFound() {
  return (
    <div className="flex flex-col items-center gap-4 py-20 text-center">
      <p className="text-6xl">🫥</p>
      <h1 className="text-2xl font-bold">Page introuvable</h1>
      <p className="text-sm text-texte-2">Cette route n’existe pas (encore).</p>
      <Link to="/accueil">
        <Bouton>Retour à l’accueil</Bouton>
      </Link>
    </div>
  )
}
