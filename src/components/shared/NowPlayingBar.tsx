'use client'

import { useState, useEffect } from 'react'
import type { SpotifyTrack } from '@/types'

interface NowPlayingBarProps {
  sessionId: string
  onRequestSong: () => void
}

export default function NowPlayingBar({ sessionId, onRequestSong }: NowPlayingBarProps) {
  const [track, setTrack] = useState<SpotifyTrack | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetchTrack() {
      try {
        const res = await fetch(`/api/spotify/${sessionId}`)
        if (!res.ok) return
        const data = await res.json()
        if (!cancelled) setTrack(data)
      } catch {
        // ignore
      }
    }

    fetchTrack()
    const interval = setInterval(fetchTrack, 15000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [sessionId])

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(45, 27, 71, 0.95)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderTop: '1px solid rgba(212,175,55,0.15)',
        padding: '10px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        zIndex: 40,
        minHeight: 56,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden', flex: 1 }}>
        {/* Music icon */}
        <span style={{ fontSize: 14, flexShrink: 0, opacity: 0.7 }}>♫</span>

        <div style={{ overflow: 'hidden' }}>
          {track ? (
            <>
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#F5F0E8',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {track.track}
              </p>
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 11,
                  color: '#A8C5DA',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {track.artist}
              </p>
            </>
          ) : (
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: 'rgba(245,240,232,0.4)' }}>
              — no music playing —
            </p>
          )}
        </div>
      </div>

      <button
        onClick={onRequestSong}
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 11,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          color: '#D4AF37',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          flexShrink: 0,
          padding: '4px 0',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        request
      </button>
    </div>
  )
}
