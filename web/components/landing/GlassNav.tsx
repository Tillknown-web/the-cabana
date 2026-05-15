'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const LINKS = [
  { label: 'Menu',   href: '#menu' },
  { label: 'Chefs',  href: '#chefs' },
]

export default function GlassNav() {
  const [hidden,  setHidden]  = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const lastScrollY = useRef(0)

  // Scroll-direction hide/reveal
  useEffect(() => {
    const onScroll = () => {
      const current = window.scrollY
      if (current < 60) {
        setHidden(false)
      } else if (current > lastScrollY.current + 4) {
        setHidden(true)
        setMenuOpen(false)
      } else if (current < lastScrollY.current - 4) {
        setHidden(false)
      }
      lastScrollY.current = current
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close menu on resize to desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setMenuOpen(false)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return (
    <>
      {/* Navbar */}
      <motion.nav
        animate={{ y: hidden ? '-110%' : '0%' }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 500,
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 2rem',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          background: 'rgba(10,10,15,0.55)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* Logo */}
        <a href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <img
            src="/logo-secondary.png"
            alt="The Cabana"
            style={{
              width: '160px',
              height: '44px',
              objectFit: 'cover',
              objectPosition: 'center center',
              mixBlendMode: 'screen',
            }}
          />
        </a>

        {/* Desktop links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <div
            className="desktop-links"
            style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}
          >
            {LINKS.map(link => (
              <a
                key={link.href}
                href={link.href}
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '11px',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.5)',
                  textDecoration: 'none',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.9)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Enter CTA */}
          <a
            href="/experience"
            data-magnetic="true"
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '10px',
              fontWeight: 500,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#4DD9C0',
              textDecoration: 'none',
              padding: '0.55rem 1.25rem',
              border: '1px solid rgba(77,217,192,0.35)',
              transition: 'background 0.25s, border-color 0.25s, box-shadow 0.25s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(77,217,192,0.08)'
              e.currentTarget.style.borderColor = 'rgba(77,217,192,0.7)'
              e.currentTarget.style.boxShadow = '0 0 20px rgba(77,217,192,0.15)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.borderColor = 'rgba(77,217,192,0.35)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            Enter
          </a>

          {/* Mobile hamburger */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Toggle menu"
            style={{
              background: 'none',
              border: 'none',
              padding: '8px',
              display: 'none',
              flexDirection: 'column',
              gap: '5px',
              cursor: 'pointer',
            }}
          >
            {[0, 1, 2].map(i => (
              <span
                key={i}
                style={{
                  display: 'block',
                  width: '22px',
                  height: '1px',
                  background: 'rgba(255,255,255,0.7)',
                  transition: 'transform 0.3s, opacity 0.3s',
                  transform:
                    menuOpen
                      ? i === 0 ? 'translateY(6px) rotate(45deg)'
                      : i === 2 ? 'translateY(-6px) rotate(-45deg)'
                      : 'scaleX(0)'
                      : 'none',
                  opacity: menuOpen && i === 1 ? 0 : 1,
                }}
              />
            ))}
          </button>
        </div>
      </motion.nav>

      {/* Mobile fullscreen overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 490,
              background: 'rgba(10,10,15,0.97)',
              backdropFilter: 'blur(24px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '2.5rem',
            }}
          >
            {/* Mobile overlay logo */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              style={{ position: 'absolute', top: '2rem' }}
            >
              <img
                src="/logo-secondary.png"
                alt="The Cabana"
                style={{
                  width: '180px',
                  height: '50px',
                  objectFit: 'cover',
                  objectPosition: 'center center',
                  mixBlendMode: 'screen',
                }}
              />
            </motion.div>

            {LINKS.map((link, i) => (
              <motion.a
                key={link.href}
                href={link.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ delay: i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => setMenuOpen(false)}
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '2.5rem',
                  fontWeight: 400,
                  color: 'rgba(255,255,255,0.85)',
                  textDecoration: 'none',
                  letterSpacing: '0.02em',
                  minHeight: '44px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {link.label}
              </motion.a>
            ))}
            <motion.a
              href="/experience"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ delay: LINKS.length * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => setMenuOpen(false)}
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '11px',
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                color: '#4DD9C0',
                textDecoration: 'none',
                padding: '1rem 2.5rem',
                border: '1px solid rgba(77,217,192,0.4)',
                marginTop: '1rem',
                minHeight: '44px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              Enter The Cabana
            </motion.a>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Inline responsive styles */}
      <style>{`
        @media (max-width: 767px) {
          .desktop-links { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </>
  )
}
