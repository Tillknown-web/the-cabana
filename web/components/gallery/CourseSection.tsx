import { COURSE_COURSE_LABELS } from '@/lib/constants'

interface PhotoEntry {
  id: string
  course: string
  signed_url: string | null
  guest: { id: string; name: string } | null
  reaction: { id: string; from_guest_id: string; reaction_type: string } | null
}

interface Props {
  sectionKey: string
  photos: PhotoEntry[]
  guests: { id: string; name: string }[]
}

const REACTION_EMOJI: Record<string, string> = {
  fire: '🔥',
  heart: '❤️',
  chefs_kiss: '🤌',
}

export default function CourseSection({ sectionKey, photos, guests }: Props) {
  const label = COURSE_COURSE_LABELS[sectionKey] ?? sectionKey

  return (
    <div>
      {/* Section label */}
      <p style={sectionLabelStyle}>{label}</p>

      {/* Photo grid — 1 or 2 columns */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: photos.length >= 2 ? '1fr 1fr' : '1fr',
        gap: '0.75rem',
      }}>
        {photos.map((photo) => (
          <div key={photo.id}>
            {photo.signed_url ? (
              <div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.signed_url}
                  alt={`${photo.guest?.name ?? 'Photo'} — ${label}`}
                  style={{
                    width: '100%',
                    aspectRatio: '1',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />

                {/* Guest name */}
                <p style={guestNameStyle}>{photo.guest?.name ?? 'Guest'}</p>

                {/* Reaction badge */}
                {photo.reaction && (
                  <p style={reactionStyle}>
                    {REACTION_EMOJI[photo.reaction.reaction_type] ?? ''}
                    &nbsp;
                    <span style={{ fontSize: '10px', opacity: 0.5 }}>
                      from {guests.find((g) => g.id === photo.reaction!.from_guest_id)?.name ?? 'Guest'}
                    </span>
                  </p>
                )}
              </div>
            ) : (
              <div style={{
                width: '100%',
                aspectRatio: '1',
                backgroundColor: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(212, 175, 55, 0.08)',
              }} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

const sectionLabelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: '11px',
  letterSpacing: '0.3em',
  textTransform: 'uppercase',
  color: '#D4AF37',
  marginBottom: '1rem',
}

const guestNameStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: '10px',
  color: '#F5F0E8',
  opacity: 0.4,
  textAlign: 'center',
  marginTop: '0.4rem',
  letterSpacing: '0.05em',
}

const reactionStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: '14px',
  textAlign: 'center',
  marginTop: '0.25rem',
  color: '#F5F0E8',
}
