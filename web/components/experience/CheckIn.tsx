'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import type { Guest } from '@/app/experience/page'

interface Props {
  sessionId: string
  onCheckedIn: (guest: Guest) => void
}

export default function CheckIn({ sessionId, onCheckedIn }: Props) {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Once check-in succeeds, store the confirmed guest here to feed the animation
  const [successGuest, setSuccessGuest] = useState<Guest | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return

    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      const { data: { session }, error: authError } = await supabase.auth.signInAnonymously()
      if (authError || !session) throw new Error(authError?.message ?? 'Sign-in failed')

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/checkin`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ name: trimmed, sessionId }),
        }
      )

      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Check-in failed')

      // Trigger the cinematic overlay instead of calling onCheckedIn directly
      setSuccessGuest({ id: json.guest.id, name: json.guest.name })
    } catch (err) {
      setError((err as Error).message)
      setLoading(false)
    }
  }

  return (
    <main style={{
      minHeight: '100dvh',
      backgroundColor: '#0A0A0F',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Ambient glow blobs */}
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute', top: '-20%', left: '-10%',
          width: '60vw', height: '60vw', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 65%)',
          animation: 'blob-drift-a 18s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', bottom: '-15%', right: '-10%',
          width: '50vw', height: '50vw', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(77,217,192,0.07) 0%, transparent 65%)',
          animation: 'blob-drift-b 22s ease-in-out infinite',
        }} />
      </div>

      {/* Form content — staggered mount animation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        style={{ position: 'relative', width: '100%', maxWidth: '280px', textAlign: 'center' }}
      >
        <motion.img
          src="/logo-main.png"
          alt="The Cabana"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{ width: '200px', height: 'auto', marginBottom: '0.5rem', display: 'block', margin: '0 auto 0.5rem' }}
        />

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          style={headingStyle}
        >
          Welcome
        </motion.h1>

        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          style={{ ...dividerStyle, transformOrigin: 'center' }}
        />

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          style={subStyle}
        >
          Enter your name to begin the evening.
        </motion.p>

        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          onSubmit={handleSubmit}
          style={{ width: '100%', marginTop: '2rem' }}
        >
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            autoFocus
            maxLength={40}
            style={{
              width: '100%',
              padding: '0.85rem 1rem',
              backgroundColor: 'rgba(245, 240, 232, 0.06)',
              border: '1px solid rgba(212, 175, 55, 0.35)',
              color: '#F5F0E8',
              fontFamily: 'var(--font-sans)',
              fontSize: '14px',
              letterSpacing: '0.05em',
              outline: 'none',
              boxSizing: 'border-box',
              textAlign: 'center',
            }}
          />

          {error && (
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '11px',
              color: '#A8C5DA',
              textAlign: 'center',
              marginTop: '0.75rem',
              opacity: 0.8,
            }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !name.trim()}
            style={{
              marginTop: '1rem',
              width: '100%',
              padding: '0.85rem 1rem',
              backgroundColor: loading || !name.trim() ? 'rgba(212, 175, 55, 0.3)' : '#D4AF37',
              color: '#0A0A0F',
              fontFamily: 'var(--font-sans)',
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              border: 'none',
              cursor: loading || !name.trim() ? 'default' : 'pointer',
              transition: 'background-color 0.2s',
            }}
          >
            {loading ? 'Entering…' : 'Enter The Cabana'}
          </button>
        </motion.form>
      </motion.div>

      {/* ── Cinematic entry overlay ───────────────────────────────────────────── */}
      <AnimatePresence>
        {successGuest && (
          <motion.div
            key="entry-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35 }}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: '#0A0A0F',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              overflow: 'hidden',
            }}
            // After the full sequence (≈1.5 s), hand off to the experience
            onAnimationComplete={() => {
              setTimeout(() => onCheckedIn(successGuest), 1100)
            }}
          >
            {/* Gold curtain sweep — horizontal line that scaleX from 0→1 */}
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ duration: 0.55, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              style={{
                position: 'absolute',
                top: '50%',
                left: 0,
                right: 0,
                height: '1px',
                background: 'linear-gradient(90deg, transparent 0%, #D4AF37 30%, #D4AF37 70%, transparent 100%)',
                transformOrigin: 'left center',
              }}
            />

            {/* Welcome text */}
            <motion.img
              src="/logo-main.png"
              alt="The Cabana"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              transition={{ duration: 0.65, delay: 0.5 }}
              style={{ width: '120px', height: 'auto', marginBottom: '1rem' }}
            />

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.65, ease: [0.16, 1, 0.3, 1] }}
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(2.5rem, 10vw, 4.5rem)',
                fontWeight: 400,
                fontStyle: 'italic',
                color: '#F5F0E8',
                margin: 0,
                lineHeight: 1.1,
                textAlign: 'center',
              }}
            >
              Welcome,<br />{successGuest.name}
            </motion.h1>

            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 0.6 }}
              transition={{ duration: 0.5, delay: 0.85 }}
              style={{
                width: '40px',
                height: '1px',
                background: '#D4AF37',
                marginTop: '1.5rem',
                transformOrigin: 'center',
              }}
            />

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              transition={{ duration: 0.6, delay: 1.0 }}
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '0.95rem',
                fontStyle: 'italic',
                color: '#F5F0E8',
                marginTop: '1rem',
              }}
            >
              savour the occasion
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: '11px',
  letterSpacing: '0.3em',
  textTransform: 'uppercase',
  color: '#D4AF37',
  marginBottom: '1rem',
}

const headingStyle: React.CSSProperties = {
  fontFamily: 'var(--font-serif)',
  fontSize: 'clamp(3rem, 12vw, 5rem)',
  fontWeight: 400,
  color: '#F5F0E8',
  margin: 0,
  lineHeight: 1,
}

const dividerStyle: React.CSSProperties = {
  width: '40px',
  height: '1px',
  backgroundColor: '#D4AF37',
  opacity: 0.5,
  margin: '1.5rem auto',
}

const subStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: '13px',
  color: '#F5F0E8',
  opacity: 0.5,
  textAlign: 'center',
}
