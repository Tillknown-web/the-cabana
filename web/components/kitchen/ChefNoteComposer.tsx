'use client'

import { useState } from 'react'
import { callEdgeFn } from '@/lib/edge-fn'

interface Props {
  sessionId: string
  accessToken: string
}

const MAX_CHARS = 100

export default function ChefNoteComposer({ sessionId, accessToken }: Props) {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSend() {
    const trimmed = message.trim()
    if (!trimmed || loading) return

    setLoading(true)
    setError(null)

    try {
      await callEdgeFn('chef-note', { sessionId, message: trimmed }, accessToken)
      setMessage('')
      setSent(true)
      setTimeout(() => setSent(false), 3000)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const remaining = MAX_CHARS - message.length

  return (
    <div>
      <SectionLabel>Chef&apos;s Note</SectionLabel>
      <p style={helpStyle}>Sends a toast to all guest screens instantly.</p>

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value.slice(0, MAX_CHARS))}
        placeholder="Say something to your guests…"
        rows={2}
        style={{
          width: '100%',
          padding: '0.75rem 0.85rem',
          backgroundColor: 'rgba(245, 240, 232, 0.04)',
          border: '1px solid rgba(212, 175, 55, 0.2)',
          color: '#F5F0E8',
          fontFamily: 'var(--font-sans)',
          fontSize: '13px',
          resize: 'none',
          outline: 'none',
          boxSizing: 'border-box',
          lineHeight: 1.5,
        }}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
        <span style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '10px',
          color: remaining < 20 ? '#A8C5DA' : '#F5F0E8',
          opacity: 0.4,
        }}>
          {remaining} left
        </span>

        <button
          onClick={handleSend}
          disabled={loading || !message.trim()}
          style={{
            padding: '0.5rem 1.25rem',
            backgroundColor: sent ? 'rgba(212, 175, 55, 0.2)' : loading || !message.trim() ? 'rgba(212, 175, 55, 0.2)' : '#D4AF37',
            color: sent ? '#D4AF37' : '#1A1A2E',
            fontFamily: 'var(--font-sans)',
            fontSize: '10px',
            fontWeight: 600,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            border: 'none',
            cursor: loading || !message.trim() ? 'default' : 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {sent ? 'Sent ✓' : loading ? 'Sending…' : 'Send'}
        </button>
      </div>

      {error && <p style={errorStyle}>{error}</p>}
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontFamily: 'var(--font-sans)',
      fontSize: '10px',
      letterSpacing: '0.25em',
      textTransform: 'uppercase',
      color: '#D4AF37',
      opacity: 0.7,
      marginBottom: '0.5rem',
    }}>
      {children}
    </p>
  )
}

const helpStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: '11px',
  color: '#F5F0E8',
  opacity: 0.35,
  marginBottom: '0.75rem',
}

const errorStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: '11px',
  color: '#A8C5DA',
  marginTop: '0.5rem',
  opacity: 0.8,
}
