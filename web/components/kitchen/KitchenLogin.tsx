'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { KitchenUser } from '@/app/kitchen/page'

interface Props {
  onLoggedIn: (user: KitchenUser) => void
}

export default function KitchenLogin({ onLoggedIn }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })

      if (authError || !data.session) {
        throw new Error(authError?.message ?? 'Login failed')
      }

      if (data.user.user_metadata?.role !== 'kitchen') {
        await supabase.auth.signOut()
        throw new Error('This account does not have kitchen access.')
      }

      onLoggedIn({
        id: data.user.id,
        email: data.user.email!,
        accessToken: data.session.access_token,
      })
    } catch (err) {
      setError((err as Error).message)
      setLoading(false)
    }
  }

  return (
    <main style={{
      minHeight: '100dvh',
      backgroundColor: '#1A1A2E',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
    }}>
      <p style={labelStyle}>The Cabana</p>
      <h1 style={headingStyle}>Kitchen</h1>
      <div style={dividerStyle} />

      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '300px' }}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          autoComplete="email"
          required
          style={inputStyle}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          autoComplete="current-password"
          required
          style={{ ...inputStyle, marginTop: '0.5rem' }}
        />

        {error && (
          <p style={errorStyle}>{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: '1rem',
            width: '100%',
            padding: '0.85rem',
            backgroundColor: loading ? 'rgba(212, 175, 55, 0.3)' : '#D4AF37',
            color: '#1A1A2E',
            fontFamily: 'var(--font-sans)',
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            border: 'none',
            cursor: loading ? 'default' : 'pointer',
          }}
        >
          {loading ? 'Signing in…' : 'Enter Kitchen'}
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
}

const dividerStyle: React.CSSProperties = {
  width: '40px',
  height: '1px',
  backgroundColor: '#D4AF37',
  opacity: 0.4,
  margin: '1.5rem 0',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.75rem 0.85rem',
  backgroundColor: 'rgba(245, 240, 232, 0.05)',
  border: '1px solid rgba(212, 175, 55, 0.25)',
  color: '#F5F0E8',
  fontFamily: 'var(--font-sans)',
  fontSize: '13px',
  outline: 'none',
  boxSizing: 'border-box',
}

const errorStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: '11px',
  color: '#A8C5DA',
  marginTop: '0.75rem',
  opacity: 0.8,
}
