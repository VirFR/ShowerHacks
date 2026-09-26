import { Link } from 'react-router-dom'
import { useSession } from '@/lib/session'
import { Bouton } from './Bouton'
import { GoogleMark, Icon } from './Icon'

/**
 * Main sign-in call to action. Google in supabase mode; in mock mode it
 * leads to the account picker on /profile so each player picks their own.
 */
export function BoutonConnexion() {
  const { mode, connecterGoogle } = useSession()
  if (mode === 'mock') {
    return (
      <Link to="/profile">
        <Bouton taille="lg" variante="clair">
          <Icon name="users" size={18} />
          Choose your account
        </Bouton>
      </Link>
    )
  }
  return (
    <Bouton taille="lg" onClick={() => connecterGoogle()} variante="clair">
      <GoogleMark />
      Continue with Google
    </Bouton>
  )
}
