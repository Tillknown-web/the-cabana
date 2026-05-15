'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function LoadingScreen() {
  const [visible, setVisible] = useState(true)
  const [logoPhase, setLogoPhase] = useState<'in' | 'hold' | 'out'>('in')

  useEffect(() => {
    // Logo fades in (0.8s) → holds (0.9s) → fades out (0.5s) → screen exits
    const holdTimer = setTimeout(() => setLogoPhase('hold'), 800)
    const outTimer  = setTimeout(() => setLogoPhase('out'), 1700)
    const doneTimer = setTimeout(() => setVisible(false), 2400)
    return () => {
      clearTimeout(holdTimer)
      clearTimeout(outTimer)
      clearTimeout(doneTimer)
    }
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="loading"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            background: '#0A0A0F',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: logoPhase === 'out' ? 'none' : 'all',
          }}
        >
          {/* Ambient breathing gradient */}
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              width: '600px',
              height: '600px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(77,217,192,0.12) 0%, rgba(139,92,246,0.08) 50%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          {/* Logo mark */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={
              logoPhase === 'in'   ? { opacity: 1, y: 0 } :
              logoPhase === 'hold' ? { opacity: 1, y: 0 } :
                                     { opacity: 0, y: -8 }
            }
            transition={{ duration: logoPhase === 'out' ? 0.4 : 0.8, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'relative',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <img
              src="/logo-main.png"
              alt="The Cabana"
              style={{ width: 'clamp(220px, 50vw, 320px)', height: 'auto' }}
            />

            <div style={{
              width: '32px',
              height: '1px',
              background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)',
              marginTop: '0.25rem',
            }} />

            <p style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '0.95rem',
              fontStyle: 'italic',
              color: 'rgba(255,255,255,0.4)',
              letterSpacing: '0.03em',
            }}>
              the art of a perfect evening
            </p>
          </motion.div>

          {/* Bottom subtle loading bar */}
          <motion.div
            style={{
              position: 'absolute',
              bottom: '3rem',
              width: '120px',
              height: '1px',
              background: 'rgba(255,255,255,0.08)',
              overflow: 'hidden',
            }}
          >
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ duration: 2, ease: 'linear' }}
              style={{
                width: '60%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(77,217,192,0.8), transparent)',
              }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
