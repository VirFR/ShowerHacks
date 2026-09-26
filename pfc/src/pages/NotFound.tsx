import { Link } from 'react-router-dom'
import { Bouton } from '@/components/Bouton'

export function NotFound() {
  return (
    <div className="flex flex-col items-center gap-4 py-20 text-center">
      <p className="text-6xl">🫥</p>
      <h1 className="text-2xl font-bold">Page not found</h1>
      <p className="text-sm text-texte-2">This route doesn’t exist (yet).</p>
      <Link to="/home">
        <Bouton>Back to home</Bouton>
      </Link>
    </div>
  )
}
