'use client'

import { useState } from 'react'
import GoldButton from '@/components/shared/GoldButton'
import GoldDivider from '@/components/shared/GoldDivider'
import { unlockAudio } from '@/lib/sounds'

interface CheckInScreenProps {
  onCheckedIn: (guestId: string, guestName: string) => void
  sessionId: string
}

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
      // Store in cookie for session persistence
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
        backgroundColor: '#2D1B47',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 32px',
        textAlign: 'center',
      }}
    >
      <h1
        style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: 'clamp(40px, 10vw, 56px)',
          fontWeight: 400,
          color: '#F5F0E8',
          marginBottom: 12,
          lineHeight: 1.1,
        }}
      >
        The Cabana
      </h1>

      <p
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 11,
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: '0.3em',
          color: '#D4AF37',
          marginBottom: 40,
        }}
      >
        poolside · after dark
      </p>

      <GoldDivider style={{ marginBottom: 40 }} />

      <form
        onSubmit={handleSubmit}
        style={{ width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', gap: 16 }}
      >
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          autoFocus
          maxLength={40}
          style={{
            backgroundColor: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(212,175,55,0.35)',
            borderRadius: 4,
            padding: '16px 20px',
            fontFamily: "'Inter', sans-serif",
            fontSize: 16,
            color: '#F5F0E8',
            outline: 'none',
            textAlign: 'center',
            width: '100%',
          }}
        />

        {error && (
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: '#A8C5DA', textAlign: 'center' }}>
            {error}
          </p>
        )}

        <GoldButton type="submit" loading={loading} disabled={!name.trim()} fullWidth size="lg">
          Check in
        </GoldButton>
      </form>
    </div>
  )
}
