'use client'

import { useState } from 'react'
import GoldButton from './GoldButton'

interface SongRequestModalProps {
  sessionId: string
  guestId: string
  onClose: () => void
}

export default function SongRequestModal({ sessionId, guestId, onClose }: SongRequestModalProps) {
  const [songText, setSongText] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!songText.trim()) return
    setLoading(true)

    try {
      await fetch('/api/song-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, guestId, songText: songText.trim() }),
      })
      setSent(true)
      setTimeout(onClose, 2000)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(26, 26, 46, 0.85)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        style={{
          backgroundColor: '#2D1B47',
          border: '1px solid rgba(212,175,55,0.3)',
          borderRadius: 8,
          padding: '40px 32px',
          width: '100%',
          maxWidth: 380,
          textAlign: 'center',
        }}
      >
        <h2
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 28,
            fontWeight: 400,
            color: '#F5F0E8',
            marginBottom: 8,
          }}
        >
          Request a song
        </h2>

        <div style={{ width: 40, height: 1, backgroundColor: '#D4AF37', opacity: 0.4, margin: '20px auto' }} />

        {sent ? (
          <div style={{ padding: '20px 0' }}>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: '#A8C5DA', fontStyle: 'italic' }}>
              Request sent to the kitchen ✓
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 8 }}>
            <input
              type="text"
              value={songText}
              onChange={(e) => setSongText(e.target.value.slice(0, 100))}
              placeholder="Song — Artist"
              maxLength={100}
              style={{
                backgroundColor: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(212,175,55,0.3)',
                borderRadius: 4,
                padding: '14px 16px',
                fontFamily: "'Inter', sans-serif",
                fontSize: 14,
                color: '#F5F0E8',
                outline: 'none',
                width: '100%',
              }}
            />
            <GoldButton type="submit" loading={loading} disabled={!songText.trim()} fullWidth>
              Send request
            </GoldButton>
          </form>
        )}

        <button
          onClick={onClose}
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 12,
            color: 'rgba(245,240,232,0.4)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            marginTop: 20,
            padding: 8,
          }}
        >
          or tap to close
        </button>
      </div>
    </div>
  )
}
