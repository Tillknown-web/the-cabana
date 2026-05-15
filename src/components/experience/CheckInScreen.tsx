'use client'

import { useState } from 'react'
import GoldButton from '@/components/shared/GoldButton'
import GoldDivider from '@/components/shared/GoldDivider'
import { unlockAudio } from '@/lib/sounds'

interface CheckInScreenProps {
  onCheckedIn: (guestId: string, guestName: string) => void
  sessionId: string
}

const RINGS = [
  { size: 600, duration: '5s', delay: '0s' },
  { size: 430, duration: '7s', delay: '1.2s' },
  { size: 290, duration: '4.8s', delay: '0.6s' },
]

export default function CheckInScreen({ onCheckedIn, sessionId }: CheckInScreenProps) {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    setLoading(true)
    setError('')
    unlockAudio()

    try {
      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, name: trimmed }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error || 'Something went wrong. Try again.')
        return
      }

      const { guestId } = await res.json()
      document.cookie = `cabana_guest_id=${guestId}; path=/; max-age=86400`
      document.cookie = `cabana_guest_name=${encodeURIComponent(trimmed)}; path=/; max-age=86400`
      onCheckedIn(guestId, trimmed)
    } catch {
      setError('Connection error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="screen-enter"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'linear-gradient(160deg, #1A1128 0%, #2D1B47 55%, #221440 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 32px',
        textAlign: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Ambient concentric rings */}
      {RINGS.map((ring, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: '44%',
            left: '50%',
            width: ring.size,
            height: ring.size,
            marginLeft: -(ring.size / 2),
            marginTop: -(ring.size / 2),
            borderRadius: '50%',
            border: '1px solid #D4AF37',
            animation: `ring-breathe ${ring.duration} ease-in-out infinite`,
            animationDelay: ring.delay,
            pointerEvents: 'none',
          }}
        />
      ))}

      {/* Central radial glow */}
      <div
        style={{
          position: 'absolute',
          top: '44%',
          left: '50%',
          width: 380,
          height: 380,
          marginLeft: -190,
          marginTop: -190,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(61,40,96,0.75) 0%, rgba(26,17,40,0) 68%)',
          pointerEvents: 'none',
        }}
      />

      {/* Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
        }}
      >
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 10,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.45em',
            color: '#D4AF37',
            marginBottom: 22,
            opacity: 0.85,
          }}
        >
          est. 2026
        </p>

        <h1
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 'clamp(52px, 13vw, 72px)',
            fontWeight: 300,
            color: '#F5F0E8',
            marginBottom: 10,
            lineHeight: 0.95,
            letterSpacing: '-0.01em',
          }}
        >
          The Cabana
        </h1>

        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 10,
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.35em',
            color: '#D4AF37',
            marginBottom: 44,
            opacity: 0.6,
          }}
        >
          savour the occasion
        </p>

        <GoldDivider width={56} style={{ marginBottom: 44 }} />

        <form
          onSubmit={handleSubmit}
          style={{
            width: '100%',
            maxWidth: 300,
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}
        >
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="your name"
            autoFocus
            maxLength={40}
            style={{
              backgroundColor: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(212,175,55,0.28)',
              borderRadius: 2,
              padding: '17px 20px',
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 20,
              fontStyle: 'italic',
              color: '#F5F0E8',
              outline: 'none',
              textAlign: 'center',
              width: '100%',
              letterSpacing: '0.05em',
              transition: 'border-color 0.25s',
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(212,175,55,0.65)')}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(212,175,55,0.28)')}
          />

          {error && (
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 12,
                color: '#A8C5DA',
                textAlign: 'center',
              }}
            >
              {error}
            </p>
          )}

          <GoldButton type="submit" loading={loading} disabled={!name.trim()} fullWidth size="lg">
            Check in
          </GoldButton>
        </form>
      </div>

      {/* Bottom date stamp */}
      <p
        style={{
          position: 'absolute',
          bottom: 28,
          fontFamily: "'Inter', sans-serif",
          fontSize: 9,
          textTransform: 'uppercase',
          letterSpacing: '0.3em',
          color: 'rgba(212,175,55,0.3)',
          pointerEvents: 'none',
        }}
      >
        July 12, 2026
      </p>
    </div>
  )
}
