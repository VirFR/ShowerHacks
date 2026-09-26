import { Link } from 'react-router-dom'
import { Bouton } from './Bouton'

/** Screen shown by pages that need a signed-in player. */
export function ConnexionRequise() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-bordure py-16 text-center">
      <p className="text-5xl">🔒</p>
      <h2 className="text-xl font-bold">Pick an account to continue</h2>
      <p className="max-w-sm text-sm text-texte-2">
        Four test accounts are available. Select yours from the Profile page.
      </p>
      <Link to="/profile">
        <Bouton>Sign in</Bouton>
      </Link>
    </div>
  )
}
