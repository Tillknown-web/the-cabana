import GoldDivider from '@/components/shared/GoldDivider'
import SeatCount from '@/components/landing/SeatCount'

// ============================================================
// The Cabana — Landing Page
// Pure Server Component. No client-side JS except SeatCount.
// ============================================================

export default function LandingPage() {
  return (
    <main style={{ backgroundColor: '#2D1B47' }}>

      {/* ── Section 1: Hero ─────────────────────────────────── */}
      <section
        style={{
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          textAlign: 'center',
        }}
      >
        {/* est. 2026 */}
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '11px',
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          color: '#D4AF37',
          marginBottom: '1.25rem',
        }}>
          est. 2026
        </p>

        {/* Wordmark */}
        <h1 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(2.5rem, 8vw, 4rem)',
          fontWeight: 400,
          color: '#F5F0E8',
          letterSpacing: '0.02em',
          lineHeight: 1.1,
          marginBottom: '1rem',
        }}>
          The Cabana
        </h1>

        {/* Tagline */}
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '11px',
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          color: '#D4AF37',
        }}>
          poolside · after dark
        </p>

        <GoldDivider />

        {/* Event date */}
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '14px',
          color: '#F5F0E8',
          opacity: 0.7,
          letterSpacing: '0.05em',
        }}>
          July 12, 2026
        </p>
      </section>

      {/* ── Section 2: Tonight's Menu ────────────────────────── */}
      <section
        style={{
          maxWidth: '480px',
          margin: '0 auto',
          padding: '4rem 2rem',
        }}
      >
        {/* Section header */}
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '11px',
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          color: '#D4AF37',
          textAlign: 'center',
          marginBottom: '3rem',
        }}>
          tonight&apos;s menu
        </p>

        {/* Course: The Pour */}
        <CourseItem
          label="the pour"
          dish="Sunset Spritz"
          ingredients="mango · pineapple · tajín"
        />

        <GoldDivider />

        {/* Course: The Bite */}
        <CourseItem
          label="the bite"
          dish="Slider Trio"
          ingredients="three sauces · slaw · brioche"
        />

        <GoldDivider />

        {/* Course: The Cut */}
        <CourseItem
          label="the cut"
          dish="Steak, tableside"
          ingredients="compound butter · truffle fries"
        />

        <GoldDivider />

        {/* Course: The Finish — hidden */}
        <CourseItem
          label="the finish"
          dish="???"
          ingredients="revealed at the table"
          isHidden
        />
      </section>

      {/* ── Section 3: The Chefs ─────────────────────────────── */}
      <section
        style={{
          maxWidth: '480px',
          margin: '0 auto',
          padding: '2rem 2rem 4rem',
          textAlign: 'center',
        }}
      >
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '11px',
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          color: '#D4AF37',
          marginBottom: '2.5rem',
        }}>
          your chefs tonight
        </p>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '3rem',
          flexWrap: 'wrap',
        }}>
          <ChefAvatar initials="K" name="King" />
          <ChefAvatar initials="?" name="Guest Chef" />
        </div>
      </section>

      {/* ── Section 4: CTA ───────────────────────────────────── */}
      <section
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '2rem 2rem 6rem',
          textAlign: 'center',
          gap: '1.25rem',
        }}
      >
        {/* Live seat count — client component */}
        <SeatCount sessionId="2026-july" />

        {/* Enter button */}
        <a
          href="/experience"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.75rem',
            backgroundColor: '#D4AF37',
            color: '#2D1B47',
            fontFamily: 'var(--font-sans)',
            fontSize: '13px',
            fontWeight: 500,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            textDecoration: 'none',
            padding: '1rem 2rem',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Enter The Cabana
          <span style={{ fontSize: '16px' }}>→</span>
        </a>
      </section>

    </main>
  )
}

// ── Sub-components ────────────────────────────────────────────

function CourseItem({
  label,
  dish,
  ingredients,
  isHidden = false,
}: {
  label: string
  dish: string
  ingredients: string
  isHidden?: boolean
}) {
  return (
    <div style={{ textAlign: 'center' }}>
      {/* Course label */}
      <p style={{
        fontFamily: 'var(--font-sans)',
        fontSize: '11px',
        letterSpacing: '0.3em',
        textTransform: 'uppercase',
        color: '#D4AF37',
        marginBottom: '0.5rem',
      }}>
        {label}
      </p>

      {/* Dish name */}
      <h2 style={{
        fontFamily: 'var(--font-serif)',
        fontSize: '1.75rem',
        fontWeight: 400,
        color: '#F5F0E8',
        marginBottom: '0.4rem',
        letterSpacing: '0.02em',
      }}>
        {dish}
      </h2>

      {/* Ingredients */}
      <p style={{
        fontFamily: 'var(--font-sans)',
        fontSize: '13px',
        fontStyle: 'italic',
        color: isHidden ? '#A8C5DA' : '#A8C5DA',
        opacity: isHidden ? 0.8 : 1,
      }}>
        {ingredients}
      </p>
    </div>
  )
}

function ChefAvatar({ initials, name }: { initials: string; name: string }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '0.75rem',
    }}>
      {/* Avatar circle */}
      <div style={{
        width: '72px',
        height: '72px',
        borderRadius: '50%',
        border: '1px solid #D4AF37',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(212, 175, 55, 0.08)',
      }}>
        <span style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '1.5rem',
          color: '#D4AF37',
          fontWeight: 400,
        }}>
          {initials}
        </span>
      </div>

      {/* Chef name */}
      <p style={{
        fontFamily: 'var(--font-sans)',
        fontSize: '13px',
        color: '#F5F0E8',
        letterSpacing: '0.05em',
      }}>
        {name}
      </p>
    </div>
  )
}
