import { Link } from 'react-router-dom'
import { Bouton } from '@/components/Bouton'
import { Icon } from '@/components/Icon'

export function NotFound() {
  return (
    <div className="flex flex-col items-center gap-4 py-20 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-xl border-2 border-ink bg-carte text-texte-2 shadow-hard-sm">
        <Icon name="ghost" size={32} />
      </span>
      <h1 className="font-pixel text-base md:text-xl">Page not found</h1>
      <p className="text-sm text-texte-2">This route doesn’t exist (yet).</p>
      <Link to="/home">
        <Bouton>Back to home</Bouton>
      </Link>
    </div>
  )
}
