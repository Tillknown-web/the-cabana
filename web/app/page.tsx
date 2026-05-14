'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import GlassNav from '@/components/landing/GlassNav'
import ParticleField from '@/components/landing/ParticleField'
import SeatCount from '@/components/landing/SeatCount'
import { ArrowRightIcon } from '@/lib/icons'

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

  // Mouse-reactive spotlight — direct DOM update to avoid re-renders
  const spotlightRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!spotlightRef.current) return
      const x = (e.clientX / window.innerWidth) * 100
      const y = (e.clientY / window.innerHeight) * 100
      spotlightRef.current.style.background =
        `radial-gradient(600px circle at ${x}% ${y}%, rgba(77,217,192,0.04) 0%, transparent 60%)`
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
          ref={spotlightRef}
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
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
            <ArrowRightIcon size={14} />
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

        <div style={{ maxWidth: '860px', margin: '0 auto', position: 'relative' }}>
          <Reveal style={{ textAlign: 'center' }}>
            <p style={sectionLabel}>tonight&apos;s menu</p>
          </Reveal>

          {/* Decorative horizontal rule under label */}
          <Reveal delay={0.05} style={{ display: 'flex', justifyContent: 'center', margin: '1.5rem 0 3rem' }}>
            <div style={{
              width: '120px',
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.4), transparent)',
            }} />
          </Reveal>

          {/* 2-col grid on desktop, 1-col on mobile */}
          <div className="menu-grid">
            <Reveal delay={0.1}>
              <CourseItem courseNum="01" label="the pour" dish="Sunset Spritz" ingredients="mango · pineapple · tajín" />
            </Reveal>
            <Reveal delay={0.18}>
              <CourseItem courseNum="02" label="the bite" dish="Slider Trio" ingredients="three sauces · slaw · brioche" />
            </Reveal>
            <Reveal delay={0.26}>
              <CourseItem courseNum="03" label="the cut" dish="Steak, tableside" ingredients="compound butter · truffle fries" />
            </Reveal>
            <Reveal delay={0.34}>
              <CourseItem courseNum="04" label="the finish" dish="???" ingredients="revealed at the table" isHidden />
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
        {/* Background halo */}
        <div aria-hidden="true" style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '70vw',
          height: '70vw',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(212,175,55,0.04) 0%, transparent 60%)',
          pointerEvents: 'none',
          animation: 'blob-drift-b 25s ease-in-out infinite',
        }} />

        <div style={{ maxWidth: '680px', margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <Reveal>
            <p style={sectionLabel}>your chefs tonight</p>
          </Reveal>

          {/* Quote block */}
          <Reveal delay={0.1}>
            <p style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(1rem, 2.5vw, 1.15rem)',
              fontStyle: 'italic',
              color: 'rgba(255,255,255,0.28)',
              marginTop: '1.5rem',
              letterSpacing: '0.02em',
              lineHeight: 1.6,
            }}>
              &ldquo;tonight, the kitchen belongs to two&rdquo;
            </p>
          </Reveal>

          <Reveal delay={0.2}>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 'clamp(3rem, 10vw, 6rem)',
              marginTop: '3.5rem',
              flexWrap: 'wrap',
            }}>
              <ChefAvatar initials="Al" name="Aloire" descriptor="flavour architect" photo="/chef-aloire.png" />
              <ChefAvatar initials="Év" name="Évoire" descriptor="creative director" photo="/chef-evoire.png" />
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
          Enter The Cabana
          <ArrowRightIcon size={13} />
        </a>
      </div>

      <style>{`
        @media (max-width: 767px) {
          .mobile-cta { display: block !important; }
        }
        .menu-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
        }
        @media (max-width: 639px) {
          .menu-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
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

function CourseItem({
  courseNum,
  label,
  dish,
  ingredients,
  isHidden = false,
}: {
  courseNum: string
  label: string
  dish: string
  ingredients: string
  isHidden?: boolean
}) {
  const [hovered, setHovered] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  // Trigger once when the card enters the viewport
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <motion.div
      ref={ref}
      whileHover={{ scale: 1.015, y: -3 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      style={{
        position: 'relative',
        padding: '2.25rem 2rem 2rem',
        background: hovered ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)',
        border: `1px solid ${hovered ? 'rgba(77,217,192,0.25)' : 'rgba(77,217,192,0.08)'}`,
        borderLeft: `2px solid ${hovered ? 'rgba(212,175,55,0.45)' : 'rgba(212,175,55,0.15)'}`,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        overflow: 'hidden',
        boxShadow: hovered ? '0 8px 40px rgba(77,217,192,0.08), 0 0 0 1px rgba(77,217,192,0.06)' : 'none',
        transition: 'border-color 0.3s, box-shadow 0.3s, background 0.3s',
        height: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* Decorative course number — large muted overlay */}
      <span style={{
        position: 'absolute',
        top: '0.75rem',
        right: '1rem',
        fontFamily: 'var(--font-serif)',
        fontSize: '4rem',
        fontWeight: 400,
        color: 'rgba(212,175,55,0.06)',
        lineHeight: 1,
        userSelect: 'none',
        pointerEvents: 'none',
        letterSpacing: '-0.02em',
      }}>
        {courseNum}
      </span>

      {/* One-shot shimmer sweep — plays once when card enters viewport */}
      <motion.div
        aria-hidden="true"
        initial={{ x: '-110%' }}
        animate={inView ? { x: '110%' } : { x: '-110%' }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(105deg, transparent 25%, rgba(212,175,55,0.18) 50%, transparent 75%)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* Continuous mystery scan on the finish card */}
      {isHidden && (
        <motion.div
          aria-hidden="true"
          animate={{ x: ['-110%', '110%'] }}
          transition={{ duration: 3.5, ease: 'easeInOut', repeat: Infinity, repeatDelay: 1.5 }}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(105deg, transparent 25%, rgba(212,175,55,0.09) 50%, transparent 75%)',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />
      )}

      {/* Content sits above the shimmer overlays */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '9px',
          letterSpacing: '0.4em',
          textTransform: 'uppercase',
          color: '#D4AF37',
          marginBottom: '0.75rem',
          opacity: 0.7,
        }}>
          {label}
        </p>
        <h2 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(1.5rem, 3.5vw, 2rem)',
          fontWeight: 400,
          color: isHidden ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.92)',
          marginBottom: '0.65rem',
          letterSpacing: '0.02em',
          lineHeight: 1.15,
        }}>
          {dish}
        </h2>
        <div style={{
          width: '24px',
          height: '1px',
          background: 'rgba(212,175,55,0.4)',
          marginBottom: '0.65rem',
          transition: 'width 0.3s',
          ...(hovered ? { width: '48px' } : {}),
        }} />
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '12px',
          fontStyle: 'italic',
          color: isHidden ? 'rgba(77,217,192,0.45)' : 'rgba(168,197,218,0.65)',
          letterSpacing: '0.01em',
        }}>
          {ingredients}
        </p>
      </div>
    </motion.div>
  )
}

function ChefAvatar({ initials, name, descriptor, photo }: { initials: string; name: string; descriptor?: string; photo?: string }) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
      }}
    >
      {/* Outer decorative halo ring */}
      <div style={{ position: 'relative' }}>
        <div style={{
          position: 'absolute',
          inset: '-12px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(77,217,192,0.08) 0%, transparent 70%)',
          animation: 'glow-pulse 4s ease-in-out infinite',
          pointerEvents: 'none',
        }} />
        <div style={{
          width: '110px',
          height: '110px',
          borderRadius: '50%',
          border: '1px solid rgba(77,217,192,0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'radial-gradient(circle at 40% 35%, rgba(77,217,192,0.08) 0%, rgba(10,10,15,0.6) 60%)',
          boxShadow: '0 0 32px rgba(77,217,192,0.14), inset 0 0 20px rgba(77,217,192,0.04)',
          animation: 'glow-pulse 3s ease-in-out infinite',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {photo ? (
            <img
              src={photo}
              alt={name}
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}
            />
          ) : (
            <span style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '2rem',
              color: '#4DD9C0',
              fontWeight: 400,
              letterSpacing: '-0.01em',
            }}>
              {initials}
            </span>
          )}
        </div>
      </div>

      <div style={{ textAlign: 'center' }}>
        <p style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '1.2rem',
          color: 'rgba(255,255,255,0.85)',
          letterSpacing: '0.04em',
          margin: 0,
          marginBottom: '0.3rem',
        }}>
          {name}
        </p>
        {descriptor && (
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '10px',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'rgba(212,175,55,0.55)',
            margin: 0,
          }}>
            {descriptor}
          </p>
        )}
      </div>
    </motion.div>
  )
}
