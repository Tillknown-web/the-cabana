'use client'

import { useState } from 'react'
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return

    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      // Anonymous sign-in — Supabase persists the session automatically
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

      onCheckedIn({ id: json.guest.id, name: json.guest.name })
    } catch (err) {
      setError((err as Error).message)
      setLoading(false)
    }
  }

  return (
    <main style={{
      minHeight: '100dvh',
      backgroundColor: '#2D1B47',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
    }}>
      {/* Wordmark */}
      <p style={labelStyle}>The Cabana</p>
      <h1 style={headingStyle}>Welcome</h1>

      <div style={dividerStyle} />

      <p style={subStyle}>Enter your name to begin the evening.</p>

      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '280px', marginTop: '2rem' }}>
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
            color: '#2D1B47',
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
      </form>
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
  margin: '1.5rem 0',
}

const subStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: '13px',
  color: '#F5F0E8',
  opacity: 0.5,
  textAlign: 'center',
}
