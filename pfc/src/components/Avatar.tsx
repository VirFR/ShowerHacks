interface AvatarProps {
  pseudo: string
  avatarUrl?: string
  taille?: 'sm' | 'md' | 'lg'
  className?: string
}

const TAILLES = {
  sm: 'h-9 w-9 text-sm',
  md: 'h-12 w-12 text-lg',
  lg: 'h-24 w-24 text-4xl',
}

/** Player avatar: the Google picture when there is one, else a monogram. */
export function Avatar({ pseudo, avatarUrl, taille = 'md', className = '' }: AvatarProps) {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt=""
        referrerPolicy="no-referrer"
        className={`shrink-0 rounded-full object-cover ${TAILLES[taille]} ${className}`}
      />
    )
  }
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-defense font-black text-white shadow-lg ${TAILLES[taille]} ${className}`}
      aria-hidden
    >
      {pseudo.charAt(0).toUpperCase()}
    </div>
  )
}
