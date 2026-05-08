'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import GlassNav from '@/components/landing/GlassNav'
import ParticleField from '@/components/landing/ParticleField'
import SeatCount from '@/components/landing/SeatCount'

// ─── Scroll-reveal wrapper ────────────────────────────────────────────────────
function Reveal({
  children,
  delay = 0,
  style,
}: {
  children: React.ReactNode
  delay?: number
  style?: React.CSSProperties
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1], delay }}
      viewport={{ once: true, margin: '-80px' }}
      style={style}
    >
      {children}
    </motion.div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll()

  // Subtle parallax: hero content drifts slightly on scroll
  const heroY = useTransform(scrollY, [0, 600], [0, 60])

  // Mouse-reactive spotlight
  const [mouse, setMouse] = useState({ x: 50, y: 50 })

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      setMouse({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      })
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  return (
    <>
      <GlassNav />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        style={{
          position: 'relative',
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          background: '#0A0A0F',
        }}
      >
        {/* Ambient gradient blobs */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            overflow: 'hidden',
          }}
        >
          <div style={{
            position: 'absolute',
            top: '-20%',
            left: '-10%',
            width: '70vw',
            height: '70vw',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 65%)',
            animation: 'blob-drift-a 18s ease-in-out infinite',
            willChange: 'transform',
          }} />
          <div style={{
            position: 'absolute',
            bottom: '-15%',
            right: '-10%',
            width: '60vw',
            height: '60vw',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(77,217,192,0.1) 0%, transparent 65%)',
            animation: 'blob-drift-b 22s ease-in-out infinite',
            willChange: 'transform',
          }} />
          <div style={{
            position: 'absolute',
            top: '30%',
            right: '20%',
            width: '30vw',
            height: '30vw',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(212,175,55,0.06) 0%, transparent 65%)',
            animation: 'blob-drift-a 28s ease-in-out 4s infinite',
            willChange: 'transform',
          }} />
        </div>

        {/* Mouse-reactive spotlight */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background: `radial-gradient(600px circle at ${mouse.x}% ${mouse.y}%, rgba(77,217,192,0.04) 0%, transparent 60%)`,
            transition: 'background 0.15s ease',
          }}
        />

        {/* Particles */}
        <ParticleField />

        {/* Hero content */}
        <motion.div
          style={{
            position: 'relative',
            textAlign: 'center',
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 0,
            y: heroY,
          }}
        >
          {/* Est. label */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 2.6, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '10px',
              letterSpacing: '0.4em',
              textTransform: 'uppercase',
              color: '#D4AF37',
              marginBottom: '1.25rem',
              opacity: 0.8,
            }}
          >
            Est. 2026
          </motion.p>

          {/* Wordmark */}
          <div style={{ overflow: 'hidden', marginBottom: '1.5rem' }}>
            <motion.h1
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: '0%', opacity: 1 }}
              transition={{ duration: 1.0, delay: 2.7, ease: [0.16, 1, 0.3, 1] }}
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(5rem, 18vw, 10rem)',
                fontWeight: 400,
                color: 'rgba(255,255,255,0.95)',
                lineHeight: 0.88,
                letterSpacing: '-0.02em',
              }}
            >
              The<br />Cabana
            </motion.h1>
          </div>

          {/* Gold divider */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 3.3, ease: [0.16, 1, 0.3, 1] }}
            style={{
              width: '40px',
              height: '1px',
              background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)',
              marginBottom: '1.25rem',
              transformOrigin: 'center',
            }}
          />

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 3.5 }}
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
              fontStyle: 'italic',
              color: 'rgba(255,255,255,0.5)',
              marginBottom: '0.75rem',
              letterSpacing: '0.03em',
            }}
          >
            poolside, after dark
          </motion.p>

          {/* Date */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 3.65 }}
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '11px',
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.28)',
              marginBottom: '2rem',
            }}
          >
            July 12, 2026
          </motion.p>

          {/* Seat count */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 3.75 }}
          >
            <SeatCount sessionId="2026-july" />
          </motion.div>

          {/* CTA */}
          <motion.a
            href="/experience"
            data-magnetic="true"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 3.85, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -2 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '1rem 2.25rem',
              fontFamily: 'var(--font-sans)',
              fontSize: '11px',
              fontWeight: 500,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              color: '#0A0A0F',
              background: '#4DD9C0',
              position: 'relative',
              overflow: 'hidden',
              transition: 'box-shadow 0.3s ease',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLAnchorElement).style.boxShadow =
                '0 0 40px rgba(77,217,192,0.45), 0 0 80px rgba(77,217,192,0.15)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLAnchorElement).style.boxShadow = 'none'
            }}
          >
            Enter The Cabana
            <span style={{ fontSize: '14px', letterSpacing: 0 }}>→</span>
          </motion.a>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 4.2 }}
          style={{
            position: 'absolute',
            bottom: '2.5rem',
            left: '50%',
            animation: 'scroll-bounce 2s ease-in-out infinite',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '9px',
            letterSpacing: '0.35em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.25)',
            marginBottom: '0.4rem',
          }}>
            Scroll
          </p>
          <div style={{
            width: '1px',
            height: '40px',
            background: 'linear-gradient(to bottom, rgba(255,255,255,0.25), transparent)',
          }} />
        </motion.div>

        {/* Bottom gradient fade to next section */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '200px',
          background: 'linear-gradient(to bottom, transparent, #0D0D14)',
          pointerEvents: 'none',
        }} />
      </section>

      {/* ── Menu Section ─────────────────────────────────────────────────── */}
      <section
        id="menu"
        style={{
          position: 'relative',
          background: '#0D0D14',
          padding: 'clamp(5rem, 10vw, 8rem) 2rem',
          overflow: 'hidden',
        }}
      >
        {/* Subtle section blob */}
        <div aria-hidden="true" style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '80vw',
          height: '80vw',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 60%)',
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: '520px', margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <Reveal>
            <p style={sectionLabel}>tonight&apos;s menu</p>
          </Reveal>

          <div style={{ marginTop: '3.5rem', display: 'flex', flexDirection: 'column', gap: 0 }}>
            <Reveal delay={0.1}>
              <CourseItem
                label="the pour"
                dish="Sunset Spritz"
                ingredients="mango · pineapple · tajín"
              />
            </Reveal>
            <Reveal delay={0.15}><GoldDivider /></Reveal>
            <Reveal delay={0.2}>
              <CourseItem
                label="the bite"
                dish="Slider Trio"
                ingredients="three sauces · slaw · brioche"
              />
            </Reveal>
            <Reveal delay={0.25}><GoldDivider /></Reveal>
            <Reveal delay={0.3}>
              <CourseItem
                label="the cut"
                dish="Steak, tableside"
                ingredients="compound butter · truffle fries"
              />
            </Reveal>
            <Reveal delay={0.35}><GoldDivider /></Reveal>
            <Reveal delay={0.4}>
              <CourseItem
                label="the finish"
                dish="???"
                ingredients="revealed at the table"
                isHidden
              />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Chefs Section ────────────────────────────────────────────────── */}
      <section
        id="chefs"
        style={{
          position: 'relative',
          background: '#0D0D14',
          padding: 'clamp(4rem, 8vw, 6rem) 2rem clamp(5rem, 10vw, 8rem)',
          borderTop: '1px solid rgba(77,217,192,0.08)',
          overflow: 'hidden',
        }}
      >
        <div style={{ maxWidth: '520px', margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <Reveal>
            <p style={sectionLabel}>your chefs tonight</p>
          </Reveal>
          <Reveal delay={0.15}>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 'clamp(2rem, 8vw, 4rem)',
              marginTop: '3rem',
              flexWrap: 'wrap',
            }}>
              <ChefAvatar initials="K" name="King" />
              <ChefAvatar initials="?" name="Guest Chef" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer style={{
        background: '#0A0A0F',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        padding: '2.5rem 2rem',
        textAlign: 'center',
      }}>
        <p style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '0.95rem',
          fontStyle: 'italic',
          color: 'rgba(255,255,255,0.25)',
          letterSpacing: '0.02em',
        }}>
          The Cabana — poolside, after dark
        </p>
      </footer>

      {/* ── Mobile sticky CTA ────────────────────────────────────────────── */}
      <div
        className="mobile-cta"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 400,
          padding: '0.875rem 1.5rem',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          background: 'rgba(10,10,15,0.85)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'none',
        }}
      >
        <a
          href="/experience"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            width: '100%',
            padding: '0.9rem',
            fontFamily: 'var(--font-sans)',
            fontSize: '11px',
            fontWeight: 500,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            textDecoration: 'none',
            color: '#0A0A0F',
            background: '#4DD9C0',
            minHeight: '44px',
          }}
        >
          Enter The Cabana →
        </a>
      </div>

      <style>{`
        @media (max-width: 767px) {
          .mobile-cta { display: block !important; }
        }
      `}</style>
    </>
  )
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const sectionLabel: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: '10px',
  letterSpacing: '0.35em',
  textTransform: 'uppercase',
  color: '#D4AF37',
  opacity: 0.8,
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function GoldDivider() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', margin: '2.25rem 0' }}>
      <div style={{
        width: '36px',
        height: '1px',
        background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.5), transparent)',
      }} />
    </div>
  )
}

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
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.25 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      style={{
        textAlign: 'center',
        padding: '1.75rem 2rem',
        background: 'rgba(255,255,255,0.025)',
        border: `1px solid ${hovered ? 'rgba(77,217,192,0.22)' : 'rgba(77,217,192,0.08)'}`,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: hovered ? '0 0 30px rgba(77,217,192,0.07)' : 'none',
        transition: 'border-color 0.3s, box-shadow 0.3s',
      }}
    >
      <p style={{
        fontFamily: 'var(--font-sans)',
        fontSize: '10px',
        letterSpacing: '0.35em',
        textTransform: 'uppercase',
        color: '#D4AF37',
        marginBottom: '0.6rem',
        opacity: 0.75,
      }}>
        {label}
      </p>
      <h2 style={{
        fontFamily: 'var(--font-serif)',
        fontSize: 'clamp(1.6rem, 4vw, 2rem)',
        fontWeight: 400,
        color: 'rgba(255,255,255,0.9)',
        marginBottom: '0.5rem',
        letterSpacing: '0.02em',
      }}>
        {dish}
      </h2>
      <p style={{
        fontFamily: 'var(--font-sans)',
        fontSize: '13px',
        fontStyle: 'italic',
        color: isHidden ? 'rgba(77,217,192,0.5)' : 'rgba(168,197,218,0.7)',
      }}>
        {ingredients}
      </p>
    </motion.div>
  )
}

function ChefAvatar({ initials, name }: { initials: string; name: string }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.875rem',
      }}
    >
      <div style={{
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        border: '1px solid rgba(77,217,192,0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(77,217,192,0.05)',
        boxShadow: '0 0 24px rgba(77,217,192,0.12)',
        animation: 'glow-pulse 3s ease-in-out infinite',
      }}>
        <span style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '1.6rem',
          color: '#4DD9C0',
          fontWeight: 400,
        }}>
          {initials}
        </span>
      </div>
      <p style={{
        fontFamily: 'var(--font-sans)',
        fontSize: '13px',
        color: 'rgba(255,255,255,0.6)',
        letterSpacing: '0.08em',
      }}>
        {name}
      </p>
    </motion.div>
  )
}
