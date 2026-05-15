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
            <motion.img
              src="/logo-main.png"
              alt="The Cabana"
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: '0%', opacity: 1 }}
              transition={{ duration: 1.0, delay: 2.7, ease: [0.16, 1, 0.3, 1] }}
              style={{
                width: 'clamp(280px, 55vw, 520px)',
                height: 'auto',
                mixBlendMode: 'screen',
                display: 'block',
              }}
            />
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
              <CourseItem courseNum="01" label="the opening pour" dish="Elixir Vert" ingredients="lemon · fresh mint · sparkling water · citrus zest" />
            </Reveal>
            <Reveal delay={0.18}>
              <CourseItem courseNum="02" label="the first bite" dish="The Gathering" ingredients="crispy chicken bites · mac & cheese gratin · honey bbq · honey mustard" />
            </Reveal>
            <Reveal delay={0.26}>
              <CourseItem courseNum="03" label="the cleanse" dish="Sorbetto d'Arancia" ingredients="orange sherbet · citrus zest" />
            </Reveal>
            <Reveal delay={0.34}>
              <CourseItem courseNum="04" label="the refresh" dish="Melon Meridian" ingredients="fresh watermelon · citrus · house agua fresca" />
            </Reveal>
            <Reveal delay={0.42}>
              <CourseItem courseNum="05" label="the cut" dish="Le Grand Festin" ingredients="prime steak · tableside compound butter · truffle frites · cheese sauce" />
            </Reveal>
            <Reveal delay={0.50}>
              <CourseItem courseNum="06" label="the finish" dish="???" ingredients="revealed at the table" isHidden />
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

      {/* ── Most Valued Clients ──────────────────────────────────────────── */}
      <section
        id="clients"
        style={{
          position: 'relative',
          background: '#0D0D14',
          padding: 'clamp(4rem, 8vw, 6rem) 2rem clamp(5rem, 10vw, 8rem)',
          borderTop: '1px solid rgba(212,175,55,0.08)',
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
          background: 'radial-gradient(circle, rgba(77,217,192,0.04) 0%, transparent 60%)',
          pointerEvents: 'none',
          animation: 'blob-drift-a 30s ease-in-out infinite',
        }} />

        <div style={{ maxWidth: '860px', margin: '0 auto', position: 'relative' }}>
          <Reveal style={{ textAlign: 'center' }}>
            <p style={sectionLabel}>most valued clients</p>
          </Reveal>

          <Reveal delay={0.05} style={{ display: 'flex', justifyContent: 'center', margin: '1.5rem 0 3rem' }}>
            <div style={{
              width: '120px',
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.4), transparent)',
            }} />
          </Reveal>

          <div className="client-grid">
            <Reveal delay={0.08}><ClientCard initials="Jae" name="Jae" note="patron of impeccable taste & the highest refinement" tier="founding" photo="/jae.png" /></Reveal>
            <Reveal delay={0.16}><ClientCard initials="Alee" name="Alee" note="the youngest & most distinguished guest" tier="founding" photo="/alee.png" /></Reveal>
          </div>
        </div>
      </section>

      {/* ── Famous Guests ─────────────────────────────────────────────────── */}
      <section
        id="famous-guests"
        style={{
          position: 'relative',
          background: '#0D0D14',
          padding: 'clamp(4rem, 8vw, 6rem) 2rem clamp(5rem, 10vw, 8rem)',
          borderTop: '1px solid rgba(139,92,246,0.08)',
          overflow: 'hidden',
        }}
      >
        {/* Background halo */}
        <div aria-hidden="true" style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '65vw',
          height: '65vw',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 60%)',
          pointerEvents: 'none',
          animation: 'blob-drift-b 28s ease-in-out infinite',
        }} />

        <div style={{ maxWidth: '860px', margin: '0 auto', position: 'relative', textAlign: 'center' }}>
          <Reveal>
            <p style={sectionLabel}>famous guests we have served</p>
          </Reveal>

          <Reveal delay={0.05} style={{ display: 'flex', justifyContent: 'center', margin: '1.5rem 0 0.75rem' }}>
            <div style={{
              width: '120px',
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.4), transparent)',
            }} />
          </Reveal>

          <Reveal delay={0.1}>
            <p style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(0.9rem, 2vw, 1rem)',
              fontStyle: 'italic',
              color: 'rgba(255,255,255,0.22)',
              marginBottom: '3rem',
              letterSpacing: '0.02em',
            }}>
              &ldquo;every table carries a story — some carry a legacy&rdquo;
            </p>
          </Reveal>

          <div className="famous-grid">
            <Reveal delay={0.12}><GuestPhoto src="/guest-1.png" /></Reveal>
            <Reveal delay={0.20}><GuestPhoto src="/guest-2.png" /></Reveal>
            <Reveal delay={0.28}><GuestPhoto src="/guest-3.png" /></Reveal>
            <Reveal delay={0.36}><GuestPhoto src="/guest-4.png" /></Reveal>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer style={{
        background: '#0A0A0F',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        padding: '2.5rem 2rem',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.75rem',
      }}>
        <img
          src="/logo-main.png"
          alt="The Cabana"
          style={{ width: '180px', height: 'auto', mixBlendMode: 'screen', opacity: 0.7 }}
        />
        <p style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '0.85rem',
          fontStyle: 'italic',
          color: 'rgba(255,255,255,0.2)',
          letterSpacing: '0.02em',
          margin: 0,
        }}>
          poolside, after dark
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
        .client-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          max-width: 640px;
          margin: 0 auto;
        }
        @media (max-width: 639px) {
          .client-grid {
            grid-template-columns: 1fr;
          }
        }
        .famous-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
          max-width: 720px;
          margin: 0 auto;
        }
        @media (max-width: 639px) {
          .famous-grid {
            grid-template-columns: 1fr 1fr;
            gap: 0.5rem;
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

function ClientCard({ initials, name, note, tier, photo, pending = false }: { initials: string; name: string; note: string; tier: 'founding' | 'elite'; photo?: string; pending?: boolean }) {
  const [hovered, setHovered] = useState(false)
  const tierColor = tier === 'founding' ? '#D4AF37' : '#4DD9C0'
  const tierLabel = tier === 'founding' ? 'founding member' : 'seat reserved'
  return (
    <motion.div
      whileHover={{ scale: 1.015, y: -4 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      style={{
        padding: '2.5rem 2rem',
        background: hovered ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
        border: `1px solid ${hovered ? `${tierColor}40` : `${tierColor}14`}`,
        borderLeft: `2px solid ${hovered ? `${tierColor}99` : `${tierColor}33`}`,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        transition: 'border-color 0.3s, box-shadow 0.3s, background 0.3s',
        boxShadow: hovered ? `0 12px 48px ${tierColor}18` : 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.5rem',
        textAlign: 'center',
      }}
    >
      {/* Avatar */}
      <div style={{ position: 'relative' }}>
        <div style={{
          position: 'absolute',
          inset: '-10px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${tierColor}14 0%, transparent 70%)`,
          animation: 'glow-pulse 4s ease-in-out infinite',
          pointerEvents: 'none',
        }} />
        <div style={{
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          border: `1px solid ${tierColor}50`,
          background: pending
            ? `radial-gradient(circle at 40% 35%, ${tierColor}10 0%, rgba(10,10,15,0.6) 60%)`
            : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          boxShadow: `0 0 32px ${tierColor}20, inset 0 0 20px ${tierColor}06`,
          animation: 'glow-pulse 3s ease-in-out infinite',
          position: 'relative',
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
              color: tierColor,
              fontWeight: 400,
              opacity: pending ? 0.35 : 1,
            }}>{initials}</span>
          )}
        </div>
      </div>

      {/* Info */}
      <div>
        <p style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '1.35rem',
          color: pending ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.9)',
          margin: 0,
          marginBottom: '0.35rem',
          letterSpacing: '0.04em',
          fontStyle: pending ? 'italic' : 'normal',
        }}>{name}</p>
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '9px',
          letterSpacing: '0.28em',
          textTransform: 'uppercase',
          color: `${tierColor}70`,
          margin: 0,
          marginBottom: '0.5rem',
        }}>{tierLabel}</p>
        <div style={{
          width: hovered ? '40px' : '20px',
          height: '1px',
          background: `${tierColor}50`,
          margin: '0 auto 0.6rem',
          transition: 'width 0.3s',
        }} />
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '12px',
          fontStyle: 'italic',
          color: pending ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.4)',
          margin: 0,
          letterSpacing: '0.01em',
        }}>{note}</p>
      </div>
    </motion.div>
  )
}

function GuestPhoto({ src }: { src: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -4 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: 'relative',
        aspectRatio: '4 / 5',
        overflow: 'hidden',
        border: '1px solid rgba(139,92,246,0.15)',
      }}
    >
      <img
        src={src}
        alt=""
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center top',
          display: 'block',
        }}
      />
      {/* Subtle purple vignette on hover */}
      <motion.div
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(139,92,246,0.25) 0%, transparent 50%)',
          pointerEvents: 'none',
        }}
      />
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
