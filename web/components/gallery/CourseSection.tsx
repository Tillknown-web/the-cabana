import { COURSE_COURSE_LABELS } from '@/lib/constants'
import { FlameIcon, HeartIcon, StarIcon } from '@/lib/icons'

interface ReactionRow {
  id: string
  from_guest_id: string
  reaction_type: string
}

interface PhotoEntry {
  id: string
  course: string
  signed_url: string | null
  guest: { id: string; name: string } | null
  reactions: ReactionRow[]
}

interface Props {
  sectionKey: string
  photos: PhotoEntry[]
  guests: { id: string; name: string }[]
}

function ReactionIcon({ type }: { type: string }) {
  if (type === 'fire') return <FlameIcon size={16} />
  if (type === 'heart') return <HeartIcon size={16} />
  return <StarIcon size={16} />
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

                {/* Reaction badges — one per guest who reacted */}
                {photo.reactions.length > 0 && (
                  <div style={{ ...reactionStyle, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem' }}>
                    {photo.reactions.map((r) => (
                      <div key={r.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', color: '#D4AF37' }}>
                        <ReactionIcon type={r.reaction_type} />
                        <span style={{ fontSize: '10px', opacity: 0.5, color: '#F5F0E8' }}>
                          from {guests.find((g) => g.id === r.from_guest_id)?.name ?? 'Guest'}
                        </span>
                      </div>
                    ))}
                  </div>
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

