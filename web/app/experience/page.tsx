// Coming soon — full guest experience app
// This placeholder prevents a 404 while the experience is being built.

export default function ExperiencePage() {
  return (
    <main style={{
      minHeight: '100dvh',
      backgroundColor: '#2D1B47',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '2rem',
    }}>
      <p style={{
        fontFamily: 'var(--font-sans)',
        fontSize: '11px',
        letterSpacing: '0.3em',
        textTransform: 'uppercase',
        color: '#D4AF37',
        marginBottom: '1.5rem',
      }}>
        coming soon
      </p>

      <h1 style={{
        fontFamily: 'var(--font-serif)',
        fontSize: 'clamp(2.5rem, 8vw, 4rem)',
        fontWeight: 400,
        color: '#F5F0E8',
        marginBottom: '1rem',
      }}>
        The Cabana
      </h1>

      <p style={{
        fontFamily: 'var(--font-sans)',
        fontSize: '13px',
        color: '#F5F0E8',
        opacity: 0.5,
        marginBottom: '3rem',
      }}>
        The guest experience opens the night of the event.
      </p>

      <a href="/" style={{
        fontFamily: 'var(--font-sans)',
        fontSize: '11px',
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        color: '#D4AF37',
        textDecoration: 'none',
        opacity: 0.7,
      }}>
        ← Back
      </a>
    </main>
  )
}
