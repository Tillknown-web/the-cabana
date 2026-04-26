import SeatCount from '@/components/landing/SeatCount'

export default function LandingPage() {
  return (
    <>
      {/* ── Nav ───────────────────────────────────────────── */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
        height: '60px',
        backgroundColor: '#F5F0E8',
      }}>
        <span style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '1.1rem',
          color: '#2D1B47',
          fontWeight: 400,
          letterSpacing: '0.02em',
        }}>
          The Cabana
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <a href="#menu" style={navLinkStyle}>Menu</a>
          <a href="#chefs" style={navLinkStyle}>Chefs</a>
          <a href="/experience" style={{
            backgroundColor: '#2D1B47',
            color: '#F5F0E8',
            fontFamily: 'var(--font-sans)',
            fontSize: '11px',
            fontWeight: 500,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            textDecoration: 'none',
            padding: '0.6rem 1.25rem',
          }}>
            Enter
          </a>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────────── */}
      <main style={{
        minHeight: '100dvh',
        backgroundColor: '#F5F0E8',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        paddingTop: '60px',
        overflow: 'hidden',
      }}>

        {/* Decorative circle */}
        <div style={{
          position: 'absolute',
          width: 'min(520px, 90vw)',
          height: 'min(520px, 90vw)',
          borderRadius: '50%',
          border: '1px solid rgba(45, 27, 71, 0.12)',
          pointerEvents: 'none',
        }} />

        {/* Content */}
        <div style={{
          position: 'relative',
          textAlign: 'center',
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 0,
        }}>

          {/* est. 2026 */}
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '11px',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: '#D4AF37',
            marginBottom: '1rem',
          }}>
            Est. 2026
          </p>

          {/* Wordmark */}
          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(5rem, 18vw, 9rem)',
            fontWeight: 400,
            color: '#2D1B47',
            lineHeight: 0.9,
            letterSpacing: '-0.01em',
            marginBottom: '1.5rem',
          }}>
            The<br />Cabana
          </h1>

          {/* Gold divider */}
          <div style={{
            width: '40px',
            height: '1px',
            backgroundColor: '#D4AF37',
            opacity: 0.6,
            marginBottom: '1.25rem',
          }} />

          {/* Tagline */}
          <p style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '1.1rem',
            fontStyle: 'italic',
            color: '#2D1B47',
            opacity: 0.75,
            marginBottom: '1rem',
            letterSpacing: '0.02em',
          }}>
            poolside, after dark
          </p>

          {/* Date */}
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '11px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: '#2D1B47',
            opacity: 0.45,
            marginBottom: '2.5rem',
          }}>
            July 12, 2026
          </p>

          {/* Seat count */}
          <SeatCount sessionId="2026-july" />

          {/* CTA */}
          <a href="/experience" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.75rem',
            backgroundColor: '#2D1B47',
            color: '#F5F0E8',
            fontFamily: 'var(--font-sans)',
            fontSize: '11px',
            fontWeight: 500,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            textDecoration: 'none',
            padding: '1rem 2rem',
            marginTop: '0.5rem',
          }}>
            Enter The Cabana
            <span style={{ fontSize: '14px', letterSpacing: 0 }}>→</span>
          </a>
        </div>

        {/* Scroll indicator */}
        <div style={{
          position: 'absolute',
          bottom: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.5rem',
        }}>
          <div style={{
            width: '1px',
            height: '40px',
            backgroundColor: '#2D1B47',
            opacity: 0.2,
          }} />
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '9px',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: '#2D1B47',
            opacity: 0.35,
          }}>
            Scroll
          </p>
        </div>
      </main>

      {/* ── Section 2: Menu ───────────────────────────────── */}
      <section id="menu" style={{
        backgroundColor: '#2D1B47',
        padding: '6rem 2rem',
      }}>
        <div style={{ maxWidth: '480px', margin: '0 auto', textAlign: 'center' }}>
          <p style={sectionLabelStyle}>tonight&apos;s menu</p>

          <div style={{ marginTop: '3rem' }}>
            <CourseItem label="the pour" dish="Sunset Spritz" ingredients="mango · pineapple · tajín" />
            <Divider />
            <CourseItem label="the bite" dish="Slider Trio" ingredients="three sauces · slaw · brioche" />
            <Divider />
            <CourseItem label="the cut" dish="Steak, tableside" ingredients="compound butter · truffle fries" />
            <Divider />
            <CourseItem label="the finish" dish="???" ingredients="revealed at the table" isHidden />
          </div>
        </div>
      </section>

      {/* ── Section 3: Chefs ──────────────────────────────── */}
      <section id="chefs" style={{
        backgroundColor: '#2D1B47',
        padding: '4rem 2rem 6rem',
        borderTop: '1px solid rgba(212, 175, 55, 0.15)',
      }}>
        <div style={{ maxWidth: '480px', margin: '0 auto', textAlign: 'center' }}>
          <p style={sectionLabelStyle}>your chefs tonight</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', marginTop: '2.5rem', flexWrap: 'wrap' }}>
            <ChefAvatar initials="K" name="King" />
            <ChefAvatar initials="?" name="Guest Chef" />
          </div>
        </div>
      </section>
    </>
  )
}

// ── Styles ────────────────────────────────────────────────────

const navLinkStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: '11px',
  letterSpacing: '0.15em',
  textTransform: 'uppercase',
  color: '#2D1B47',
  textDecoration: 'none',
  opacity: 0.6,
}

const sectionLabelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: '11px',
  letterSpacing: '0.3em',
  textTransform: 'uppercase',
  color: '#D4AF37',
}

// ── Sub-components ────────────────────────────────────────────

function Divider() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', margin: '2rem 0' }}>
      <div style={{ width: '40px', height: '1px', backgroundColor: '#D4AF37', opacity: 0.4 }} />
    </div>
  )
}

function CourseItem({ label, dish, ingredients, isHidden = false }: {
  label: string; dish: string; ingredients: string; isHidden?: boolean
}) {
  return (
    <div style={{ textAlign: 'center' }}>
      <p style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#D4AF37', marginBottom: '0.5rem' }}>
        {label}
      </p>
      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', fontWeight: 400, color: '#F5F0E8', marginBottom: '0.4rem', letterSpacing: '0.02em' }}>
        {dish}
      </h2>
      <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', fontStyle: 'italic', color: '#A8C5DA', opacity: isHidden ? 0.8 : 1 }}>
        {ingredients}
      </p>
    </div>
  )
}

function ChefAvatar({ initials, name }: { initials: string; name: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
      <div style={{ width: '72px', height: '72px', borderRadius: '50%', border: '1px solid #D4AF37', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(212, 175, 55, 0.08)' }}>
        <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: '#D4AF37', fontWeight: 400 }}>{initials}</span>
      </div>
      <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: '#F5F0E8', letterSpacing: '0.05em' }}>{name}</p>
    </div>
  )
}
