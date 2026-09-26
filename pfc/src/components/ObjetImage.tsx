import { useState } from 'react'
import type { Objet } from '@/types'

interface ObjetImageProps {
  objet: Pick<Objet, 'nom' | 'imageUrl' | 'icone'>
  className?: string
}

/** Image d'un objet avec repli sur son emoji si le fichier ne charge pas. */
export function ObjetImage({ objet, className = 'h-16 w-16' }: ObjetImageProps) {
  const [erreur, setErreur] = useState(false)

  if (erreur) {
    return (
      <div
        className={`flex items-center justify-center rounded-xl bg-fond text-3xl ${className}`}
        role="img"
        aria-label={objet.nom}
      >
        {objet.icone}
      </div>
    )
  }

  return (
    <img
      src={objet.imageUrl}
      alt={objet.nom}
      className={`rounded-xl object-cover ${className}`}
      onError={() => setErreur(true)}
      draggable={false}
    />
  )
}
