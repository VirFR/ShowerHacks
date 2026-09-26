import { Link } from 'react-router-dom'
import { Bouton } from './Bouton'

/** Écran affiché par les pages qui ont besoin d'un joueur connecté. */
export function ConnexionRequise() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-bordure py-16 text-center">
      <p className="text-5xl">🔒</p>
      <h2 className="text-xl font-bold">Choisis un compte pour continuer</h2>
      <p className="max-w-sm text-sm text-texte-2">
        Quatre comptes de test sont disponibles. Sélectionne le tien depuis la page Profil.
      </p>
      <Link to="/profil">
        <Bouton>Se connecter</Bouton>
      </Link>
    </div>
  )
}
