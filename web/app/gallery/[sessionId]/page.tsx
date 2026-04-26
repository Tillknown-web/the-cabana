import CourseSection from '@/components/gallery/CourseSection'
import KeepsakeReceipt from '@/components/gallery/KeepsakeReceipt'

interface PhotoEntry {
  id: string
  course: string
  signed_url: string | null
  guest: { id: string; name: string } | null
  reaction: { id: string; from_guest_id: string; reaction_type: string } | null
}

interface GalleryData {
  session: { session_id: string; event_date: string }
  guests: { id: string; name: string }[]
  sections: Record<string, PhotoEntry[]>
}

const SECTION_ORDER = ['guest', 'pour', 'bite', 'cut', 'finish', 'booth']

async function fetchGallery(sessionId: string): Promise<GalleryData | null> {
  try {
    const url = new URL(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/gallery`)
    url.searchParams.set('sessionId', sessionId)
    const res = await fetch(url.toString(), { next: { revalidate: 300 } })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export default async function GalleryPage({
  params,
}: {
  params: Promise<{ sessionId: string }>
}) {
  const { sessionId } = await params
  const data = await fetchGallery(sessionId)

  if (!data) {
    return (
      <main style={{
        minHeight: '100dvh',
        backgroundColor: '#2D1B47',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        textAlign: 'center',
      }}>
        <div>
          <p style={labelStyle}>The Cabana</p>
          <p style={notFoundStyle}>Gallery not found.</p>
          <p style={subStyle}>Check that the session ID is correct.</p>
        </div>
      </main>
    )
  }

  const presentSections = SECTION_ORDER.filter((s) => data.sections[s]?.length)
  const eventDate = new Date(data.session.event_date)
  const formattedDate = eventDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <main style={{ minHeight: '100dvh', backgroundColor: '#2D1B47', paddingBottom: '6rem' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', padding: '4rem 1.5rem 2rem' }}>
        <p style={labelStyle}>The Cabana</p>
        <h1 style={headingStyle}>An Evening Together</h1>
        <div style={dividerStyle} />
        <p style={guestNamesStyle}>{data.guests.map((g) => g.name).join(' & ')}</p>
        <p style={dateStyle}>{formattedDate}</p>
      </div>

      {/* Course sections */}
      <div style={{ maxWidth: '520px', margin: '0 auto', padding: '0 1.5rem' }}>
        {presentSections.map((key, i) => (
          <div key={key}>
            <CourseSection
              sectionKey={key}
              photos={data.sections[key]}
              guests={data.guests}
            />
            {i < presentSections.length - 1 && (
              <div style={{ height: '1px', backgroundColor: 'rgba(212, 175, 55, 0.12)', margin: '2.5rem 0' }} />
            )}
          </div>
        ))}
      </div>

      {/* Keepsake receipt */}
      <div style={{ maxWidth: '520px', margin: '3rem auto 0', padding: '0 1.5rem' }}>
        <div style={{ height: '1px', backgroundColor: 'rgba(212, 175, 55, 0.12)', marginBottom: '2.5rem' }} />
        <KeepsakeReceipt
          guests={data.guests}
          eventDate={formattedDate}
          sessionId={sessionId}
        />
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', marginTop: '4rem' }}>
        <div style={{ ...dividerStyle, margin: '0 auto 1rem' }} />
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#F5F0E8', opacity: 0.2 }}>
          The Cabana · {eventDate.getFullYear()}
        </p>
      </div>
    </main>
  )
}

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: '11px',
  letterSpacing: '0.3em',
  textTransform: 'uppercase',
  color: '#D4AF37',
  margin: '0 0 1rem',
}

const headingStyle: React.CSSProperties = {
  fontFamily: 'var(--font-serif)',
  fontSize: 'clamp(2.5rem, 10vw, 4rem)',
  fontWeight: 400,
  color: '#F5F0E8',
  margin: 0,
}

const dividerStyle: React.CSSProperties = {
  width: '40px',
  height: '1px',
  backgroundColor: '#D4AF37',
  opacity: 0.4,
  margin: '1.25rem auto',
}

const guestNamesStyle: React.CSSProperties = {
  fontFamily: 'var(--font-serif)',
  fontSize: '1.1rem',
  fontStyle: 'italic',
  color: '#F5F0E8',
  opacity: 0.75,
  margin: 0,
}

const dateStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: '11px',
  letterSpacing: '0.15em',
  color: '#F5F0E8',
  opacity: 0.35,
  margin: '0.4rem 0 0',
}

const notFoundStyle: React.CSSProperties = {
  fontFamily: 'var(--font-serif)',
  fontSize: '2rem',
  color: '#F5F0E8',
  margin: '0.5rem 0',
}

const subStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: '12px',
  color: '#F5F0E8',
  opacity: 0.4,
}
