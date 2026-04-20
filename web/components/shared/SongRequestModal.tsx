'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  sessionId: string
  onClose: () => void
}

export default function SongRequestModal({ sessionId, onClose }: Props) {
  const [songText, setSongText] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = songText.trim()
    if (!trimmed) return

    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not signed in')

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/song-request`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ sessionId, songText: trimmed }),
        }
      )

      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Request failed')

      setSent(true)
      setTimeout(onClose, 1500)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    /* Backdrop */
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        backgroundColor: 'rgba(26, 26, 46, 0.92)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}
    >
      {/* Modal */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '320px',
          backgroundColor: '#1A1A2E',
          border: '1px solid rgba(212, 175, 55, 0.3)',
          padding: '2rem',
          textAlign: 'center',
        }}
      >
        {sent ? (
          <p style={sentStyle}>Sent ✓</p>
        ) : (
          <>
            <p style={labelStyle}>Song Request</p>
            <p style={subStyle}>Tell the chef what you&apos;d like to hear.</p>

            <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem' }}>
              <input
                type="text"
                value={songText}
                onChange={(e) => setSongText(e.target.value)}
                placeholder="Song or artist…"
                maxLength={200}
                autoFocus
                style={{
                  width: '100%',
                  padding: '0.75rem 0.85rem',
                  backgroundColor: 'rgba(245, 240, 232, 0.05)',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  color: '#F5F0E8',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />

              {error && (
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: '#A8C5DA', marginTop: '0.5rem' }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading || !songText.trim()}
                style={{
                  marginTop: '1rem',
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: loading || !songText.trim() ? 'rgba(212, 175, 55, 0.3)' : '#D4AF37',
                  color: '#1A1A2E',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '11px',
                  fontWeight: 600,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  border: 'none',
                  cursor: loading || !songText.trim() ? 'default' : 'pointer',
                }}
              >
                {loading ? 'Sending…' : 'Send Request'}
              </button>

              <button
                type="button"
                onClick={onClose}
                style={{
                  marginTop: '0.75rem',
                  background: 'none',
                  border: 'none',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '11px',
                  color: '#F5F0E8',
                  opacity: 0.35,
                  cursor: 'pointer',
                  letterSpacing: '0.1em',
                }}
              >
                Cancel
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: '11px',
  letterSpacing: '0.3em',
  textTransform: 'uppercase',
  color: '#D4AF37',
  margin: 0,
}

const subStyle: React.CSSProperties = {
  fontFamily: 'var(--font-serif)',
  fontSize: '0.95rem',
  fontStyle: 'italic',
  color: '#F5F0E8',
  opacity: 0.6,
  marginTop: '0.5rem',
}

const sentStyle: React.CSSProperties = {
  fontFamily: 'var(--font-serif)',
  fontSize: '1.5rem',
  color: '#D4AF37',
  margin: 0,
  padding: '1rem 0',
}
