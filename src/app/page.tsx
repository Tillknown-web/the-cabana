import Link from 'next/link'

const MENU = [
  {
    course: 'the pour',
    dish: 'Sunset Spritz',
    ingredients: 'mango · pineapple · tajín',
  },
  {
    course: 'the bite',
    dish: 'Slider Trio',
    ingredients: 'three sauces · slaw · brioche',
  },
  {
    course: 'the cut',
    dish: 'Steak, tableside',
    ingredients: 'compound butter · truffle fries',
  },
  {
    course: 'the finish',
    dish: '???',
    ingredients: 'revealed at the table',
    hidden: true,
  },
]

const CHEFS = [
  { initial: 'K', name: 'King' },
  { initial: 'A', name: 'Aloire' },
]

const P = '#2D1B47'        // aubergine
const PL = '#3D2860'       // aubergine light
const PM = 'rgba(45,27,71,0.08)'  // aubergine mist — borders
const G = '#D4AF37'        // gold
const EW = '#F7F3EC'       // egg white
const EWD = '#EFE9DF'      // egg white deep — matches --egg-white-deep in globals.css

export default function LandingPage() {
  return (
    <main style={{ backgroundColor: EW, color: P, minHeight: '100vh' }}>

      {/* ── Navigation ── */}
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          backgroundColor: `rgba(247,243,236,0.94)`,
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${PM}`,
          padding: '0 clamp(20px, 5vw, 56px)',
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 20, fontWeight: 400, color: P, letterSpacing: '0.05em' }}>
          The Cabana
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          {['Menu', 'Chefs'].map((label) => (
            <a
              key={label}
              href={`#${label.toLowerCase()}`}
              style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.18em', color: P, textDecoration: 'none', opacity: 0.55 }}
            >
              {label}
            </a>
          ))}
          <Link
            href="/experience"
            style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.18em', color: EW, backgroundColor: P, textDecoration: 'none', padding: '9px 20px', borderRadius: 2 }}
          >
            Enter
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section
        style={{
          minHeight: '100svh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '100px clamp(20px,5vw,60px) 80px',
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: EW,
        }}
      >
        {/* Large purple wash behind heading */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -52%)',
            width: 'clamp(320px, 70vw, 700px)',
            height: 'clamp(320px, 70vw, 700px)',
            borderRadius: '50%',
            background: `radial-gradient(circle, rgba(45,27,71,0.07) 0%, rgba(45,27,71,0) 70%)`,
            pointerEvents: 'none',
          }}
        />
        {/* Outer gold ring */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 580,
            height: 580,
            borderRadius: '50%',
            border: `1px solid rgba(212,175,55,0.2)`,
            pointerEvents: 'none',
          }}
        />
        {/* Inner purple ring */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 380,
            height: 380,
            borderRadius: '50%',
            border: `1px solid rgba(45,27,71,0.1)`,
            pointerEvents: 'none',
          }}
        />

        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.45em', color: G, marginBottom: 28 }}>
          est. 2026
        </p>

        <h1
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 'clamp(72px, 15vw, 120px)',
            fontWeight: 300,
            color: P,
            lineHeight: 0.93,
            letterSpacing: '-0.01em',
            marginBottom: 28,
          }}
        >
          The<br />Cabana
        </h1>

        <div style={{ width: 48, height: 1, backgroundColor: G, opacity: 0.55, margin: '0 auto 22px' }} />

        <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 'clamp(15px, 2.5vw, 19px)', fontStyle: 'italic', fontWeight: 300, color: P, opacity: 0.55, letterSpacing: '0.08em', marginBottom: 44 }}>
          poolside, after dark
        </p>

        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: P, opacity: 0.35, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 52 }}>
          July 12, 2026
        </p>

        <Link
          href="/experience"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 12, fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.22em', color: EW, backgroundColor: P, textDecoration: 'none', padding: '16px 40px', borderRadius: 2 }}
        >
          Enter The Cabana <span style={{ fontSize: 14 }}>→</span>
        </Link>

        {/* Scroll hint */}
        <div style={{ position: 'absolute', bottom: 36, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, opacity: 0.25 }}>
          <div style={{ width: 1, height: 36, backgroundColor: P }} />
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', color: P }}>scroll</p>
        </div>
      </section>

      {/* ── Purple tagline band ── */}
      <div
        style={{
          backgroundColor: P,
          padding: '28px clamp(20px,5vw,60px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'clamp(16px, 4vw, 48px)',
          flexWrap: 'wrap',
        }}
      >
        {['A private cook-off', 'Two teams · Six hours', 'Three courses + a drink', 'You decide who wins'].map((text, i) => (
          <span
            key={i}
            style={{
              fontFamily: i % 2 === 0 ? "'Cormorant Garamond', Georgia, serif" : "'Inter', sans-serif",
              fontSize: i % 2 === 0 ? 17 : 10,
              fontStyle: i % 2 === 0 ? 'italic' : 'normal',
              fontWeight: 300,
              textTransform: i % 2 === 0 ? 'none' : 'uppercase',
              letterSpacing: i % 2 === 0 ? '0.02em' : '0.2em',
              color: i % 2 === 0 ? 'rgba(245,240,232,0.7)' : G,
            }}
          >
            {text}
          </span>
        ))}
      </div>

      {/* ── Tonight's Menu ── */}
      <section
        id="menu"
        style={{ backgroundColor: EW, padding: 'clamp(80px,12vw,140px) clamp(20px,5vw,60px)' }}
      >
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 'clamp(56px,8vw,88px)' }}>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4em', color: G, marginBottom: 20 }}>
              July 12, 2026
            </p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 'clamp(36px,7vw,56px)', fontWeight: 300, color: P, letterSpacing: '-0.01em', lineHeight: 1.1 }}>
              Tonight&apos;s Menu
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {MENU.map((item, i) => (
              <div key={item.course}>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto',
                    alignItems: 'center',
                    padding: 'clamp(28px,4vw,44px) 0',
                    gap: 24,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>
                    {/* Purple left accent bar */}
                    <div
                      style={{
                        width: 3,
                        alignSelf: 'stretch',
                        minHeight: 56,
                        backgroundColor: P,
                        opacity: 0.15,
                        borderRadius: 2,
                        flexShrink: 0,
                        marginTop: 4,
                      }}
                    />
                    <div>
                      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.3em', color: G, marginBottom: 10 }}>
                        {item.course}
                      </p>
                      <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 'clamp(26px,5vw,40px)', fontWeight: 400, color: P, lineHeight: 1.1, marginBottom: 8 }}>
                        {item.dish}
                      </h3>
                      <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 'clamp(14px,2vw,17px)', fontStyle: 'italic', fontWeight: 300, color: item.hidden ? '#A8C5DA' : `rgba(45,27,71,0.45)` }}>
                        {item.ingredients}
                      </p>
                    </div>
                  </div>

                  {/* Course number */}
                  <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 'clamp(44px,7vw,68px)', fontWeight: 300, color: `rgba(45,27,71,0.08)`, lineHeight: 1, flexShrink: 0 }}>
                    0{i + 1}
                  </p>
                </div>

                {i < MENU.length - 1 && (
                  <div style={{ height: 1, backgroundColor: P, opacity: 0.07 }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Quote band ── */}
      <div
        style={{
          backgroundColor: EWD,
          borderTop: `1px solid ${PM}`,
          borderBottom: `1px solid ${PM}`,
          padding: 'clamp(48px,7vw,80px) clamp(20px,5vw,60px)',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          {/* Purple decorative bracket lines */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, justifyContent: 'center', marginBottom: 28 }}>
            <div style={{ height: 1, width: 48, backgroundColor: P, opacity: 0.2 }} />
            <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: G, opacity: 0.8 }} />
            <div style={{ height: 1, width: 48, backgroundColor: P, opacity: 0.2 }} />
          </div>
          <p
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 'clamp(22px,4vw,32px)',
              fontStyle: 'italic',
              fontWeight: 300,
              color: P,
              lineHeight: 1.5,
              marginBottom: 28,
            }}
          >
            &ldquo;Six hours to cook, plate, and serve a 3-course meal from scratch. Then you vote.&rdquo;
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, justifyContent: 'center' }}>
            <div style={{ height: 1, width: 48, backgroundColor: P, opacity: 0.2 }} />
            <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: G, opacity: 0.8 }} />
            <div style={{ height: 1, width: 48, backgroundColor: P, opacity: 0.2 }} />
          </div>
        </div>
      </div>

      {/* ── Chefs ── */}
      <section
        id="chefs"
        style={{ backgroundColor: EW, padding: 'clamp(80px,12vw,140px) clamp(20px,5vw,60px)' }}
      >
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 'clamp(56px,8vw,88px)' }}>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4em', color: G, marginBottom: 20 }}>
              In the kitchen
            </p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 'clamp(36px,7vw,56px)', fontWeight: 300, color: P, letterSpacing: '-0.01em', lineHeight: 1.1 }}>
              Your Chefs Tonight
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 28 }}>
            {CHEFS.map((chef, i) => (
              <div
                key={chef.name}
                style={{
                  backgroundColor: EWD,
                  border: `1px solid ${PM}`,
                  borderTop: `3px solid ${P}`,
                  borderRadius: 4,
                  padding: 'clamp(36px,5vw,52px) 36px',
                  textAlign: 'center',
                  position: 'relative',
                }}
              >
                {/* Avatar */}
                <div
                  style={{
                    width: 96,
                    height: 96,
                    borderRadius: '50%',
                    border: `1.5px solid rgba(45,27,71,0.2)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px',
                    backgroundColor: `rgba(45,27,71,0.05)`,
                  }}
                >
                  <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 40, fontWeight: 300, color: P, opacity: 0.5 }}>
                    {chef.initial}
                  </span>
                </div>

                <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 24, fontWeight: 400, color: P, marginBottom: 6 }}>
                  {chef.name}
                </p>
                <div style={{ width: 28, height: 1, backgroundColor: G, opacity: 0.5, margin: '10px auto' }} />
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.22em', color: `rgba(45,27,71,0.35)` }}>
                  Chef No. {String(i + 1).padStart(2, '0')}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Details strip ── */}
      <div
        style={{
          backgroundColor: P,
          padding: 'clamp(48px,6vw,72px) clamp(20px,5vw,60px)',
        }}
      >
        <div
          style={{
            maxWidth: 820,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 'clamp(32px,4vw,56px)',
            textAlign: 'center',
          }}
        >
          {[
            { label: 'Date', value: 'July 12' },
            { label: 'Format', value: '3 courses + a drink' },
            { label: 'Teams', value: '2 chefs each' },
            { label: 'Decision', value: 'You vote' },
          ].map((item) => (
            <div key={item.label}>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.35em', color: G, marginBottom: 10 }}>
                {item.label}
              </p>
              <div style={{ width: 24, height: 1, backgroundColor: G, opacity: 0.3, margin: '0 auto 10px' }} />
              <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 'clamp(18px,3vw,24px)', fontWeight: 300, color: 'rgba(245,240,232,0.85)' }}>
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── CTA ── */}
      <section
        style={{
          backgroundColor: EWD,
          borderTop: `1px solid ${PM}`,
          padding: 'clamp(80px,12vw,120px) clamp(20px,5vw,60px)',
          textAlign: 'center',
        }}
      >
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4em', color: G, marginBottom: 24 }}>
          July 12, 2026
        </p>
        <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 'clamp(36px,7vw,56px)', fontWeight: 300, color: P, lineHeight: 1.2, marginBottom: 16 }}>
          An evening unlike<br />any other.
        </h2>
        <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 'clamp(15px,2.5vw,18px)', fontStyle: 'italic', fontWeight: 300, color: `rgba(45,27,71,0.45)`, marginBottom: 52 }}>
          poolside, after dark
        </p>
        <Link
          href="/experience"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 12, fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.22em', color: EW, backgroundColor: P, textDecoration: 'none', padding: '16px 44px', borderRadius: 2 }}
        >
          Enter The Cabana <span style={{ fontSize: 14 }}>→</span>
        </Link>
      </section>

      {/* ── Footer ── */}
      <footer
        style={{
          backgroundColor: P,
          padding: '28px clamp(20px,5vw,56px)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 17, fontWeight: 300, color: 'rgba(245,240,232,0.6)', fontStyle: 'italic' }}>
          The Cabana
        </p>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.25em', color: `rgba(212,175,55,0.5)` }}>
          poolside · after dark · est. 2026
        </p>
      </footer>

    </main>
  )
}
