'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CameraIcon, SmileIcon, HomeIcon, MusicNoteIcon, PlusIcon, FlameIcon, HeartIcon, StarIcon } from '@/lib/icons'
import { createClient as createUploadClient } from '@/lib/supabase/client'

interface SpotifyRow {
  track: string | null
  artist: string | null
}

interface Props {
  sessionId: string
  currentCard: string
  guestId: string
  onSongRequest: () => void
}

type ReactionType = 'fire' | 'heart' | 'chefs_kiss'

const REACTIONS: Array<{ type: ReactionType; icon: React.ReactNode; label: string }> = [
  { type: 'fire',       icon: <FlameIcon size={26} />, label: 'Fire'        },
  { type: 'heart',      icon: <HeartIcon size={26} />, label: 'Love'        },
  { type: 'chefs_kiss', icon: <StarIcon  size={26} />, label: "Chef's Kiss" },
]

export default function ExperienceNavBar({ sessionId, currentCard, guestId, onSongRequest }: Props) {
  const [nowPlaying, setNowPlaying]           = useState<SpotifyRow | null>(null)
  const [songPopoverOpen, setSongPopoverOpen] = useState(false)
  const [reactionOpen, setReactionOpen]       = useState(false)
  const [reactionSending, setReactionSending] = useState(false)
  const [reactionSent, setReactionSent]       = useState<ReactionType | null>(null)
  const [toPhotoId, setToPhotoId]             = useState<string | null>(null)
  const [photoLookupDone, setPhotoLookupDone] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const supabase = createClient()

  // Spotify data fetch + live subscription
  useEffect(() => {
    supabase
      .from('spotify_cache')
      .select('track, artist')
      .eq('session_id', sessionId)
      .single()
      .then(({ data }) => { if (data?.track) setNowPlaying(data as SpotifyRow) })

    const channel = supabase
      .channel(`exp-nav-spotify-${sessionId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'spotify_cache', filter: `session_id=eq.${sessionId}` },
        (payload) => {
          const row = payload.new as SpotifyRow
          if (row?.track) setNowPlaying(row)
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [sessionId]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleTakePicture() {
    setSongPopoverOpen(false)
    setReactionOpen(false)
    inputRef.current?.click()
  }

  async function handleFile(file: File) {
    try {
      const MAX = 1200
      const img = new Image()
      const url = URL.createObjectURL(file)
      img.src = url
      await new Promise<void>((res, rej) => { img.onload = () => res(); img.onerror = rej })

      const scale = Math.min(1, MAX / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width  = Math.round(img.width  * scale)
      canvas.height = Math.round(img.height * scale)
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)

      const blob: Blob = await new Promise((res, rej) =>
        canvas.toBlob((b) => b ? res(b) : rej(new Error('Export failed')), 'image/jpeg', 0.88)
      )

      const sc = createUploadClient()
      const { data: { session } } = await sc.auth.getSession()
      if (!session) return

      const form = new FormData()
      form.append('file', blob, `booth_${Date.now()}.jpg`)
      form.append('sessionId', sessionId)
      form.append('course', 'booth')
      form.append('upsert', 'false')

      await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/upload-photo`,
        { method: 'POST', headers: { Authorization: `Bearer ${session.access_token}` }, body: form }
      )
    } catch { /* silent — camera captures are best-effort */ }
  }

  async function openReactionSheet() {
    setSongPopoverOpen(false)
    setToPhotoId(null)
    setPhotoLookupDone(false)
    setReactionOpen(true)

    const { data } = await supabase
      .from('photos')
      .select('id')
      .eq('session_id', sessionId)
      .neq('guest_id', guestId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    setToPhotoId(data?.id ?? null)
    setPhotoLookupDone(true)
  }

  async function sendReaction(reactionType: ReactionType) {
    if (reactionSending || !toPhotoId) return
    setReactionSending(true)
    try {
      const sc = createUploadClient()
      const { data: { session } } = await sc.auth.getSession()
      if (!session) return

      await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/reaction`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
          body: JSON.stringify({ sessionId, toPhotoId, reactionType }),
        }
      )
      setReactionSent(reactionType)
      setTimeout(() => { setReactionOpen(false); setReactionSent(null) }, 1200)
    } catch { /* silent */ } finally {
      setReactionSending(false)
    }
  }

  return (
    <>
      {/* Hidden camera input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = '' }}
        style={{ display: 'none' }}
      />

      {/* Now-playing popover */}
      {songPopoverOpen && (
        <div style={{
          position: 'fixed',
          bottom: '65px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 55,
          backgroundColor: 'rgba(10, 10, 15, 0.96)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(212, 175, 55, 0.2)',
          padding: '0.9rem 1.25rem',
          minWidth: '220px',
          maxWidth: '320px',
          textAlign: 'center',
        }}>
          <p style={popoverLabelStyle}>Now Playing</p>
          {nowPlaying?.track ? (
            <>
              <p style={popoverTrackStyle}>{nowPlaying.track}</p>
              {nowPlaying.artist && (
                <p style={popoverArtistStyle}>{nowPlaying.artist}</p>
              )}
            </>
          ) : (
            <p style={{ ...popoverArtistStyle, opacity: 0.45 }}>Nothing playing right now.</p>
          )}
        </div>
      )}

      {/* Reaction sheet */}
      {reactionOpen && (
        <div style={{
          position: 'fixed',
          bottom: '65px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 55,
          backgroundColor: 'rgba(10, 10, 15, 0.96)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(212, 175, 55, 0.2)',
          padding: '1rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.75rem',
          minWidth: '220px',
        }}>
          <p style={popoverLabelStyle}>Add Reaction</p>
          {!photoLookupDone ? (
            <p style={{ ...popoverArtistStyle, opacity: 0.45 }}>Loading…</p>
          ) : !toPhotoId ? (
            <p style={{ ...popoverArtistStyle, opacity: 0.45 }}>No photos to react to yet.</p>
          ) : (
            <div style={{ display: 'flex', gap: '1.25rem' }}>
              {REACTIONS.map(({ type, icon, label }) => (
                <button
                  key={type}
                  onClick={() => sendReaction(type)}
                  disabled={reactionSending}
                  title={label}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.3rem',
                    background: 'none',
                    border: reactionSent === type
                      ? '1px solid rgba(212, 175, 55, 0.6)'
                      : '1px solid transparent',
                    borderRadius: '6px',
                    padding: '0.5rem 0.65rem',
                    cursor: reactionSending ? 'default' : 'pointer',
                    color: reactionSent === type ? '#D4AF37' : '#F5F0E8',
                    opacity: reactionSending && reactionSent !== type ? 0.4 : 1,
                    transition: 'color 0.2s, border-color 0.2s',
                  }}
                >
                  {icon}
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.6 }}>
                    {label}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Backdrop to close popovers */}
      {(songPopoverOpen || reactionOpen) && (
        <div
          onClick={() => { setSongPopoverOpen(false); setReactionOpen(false) }}
          style={{ position: 'fixed', inset: 0, zIndex: 54 }}
        />
      )}

      {/* Bottom nav bar */}
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        height: '64px',
        backgroundColor: 'rgba(10, 10, 15, 0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        display: 'flex',
        alignItems: 'stretch',
      }}>
        {/* Take Picture */}
        <NavButton
          icon={<CameraIcon size={20} />}
          label="Take Picture"
          onClick={handleTakePicture}
        />

        {/* Add Reaction */}
        <NavButton
          icon={<SmileIcon size={20} />}
          label="Add Reaction"
          active={reactionOpen}
          onClick={() => reactionOpen ? setReactionOpen(false) : openReactionSheet()}
        />

        {/* Main Flow — center accent button */}
        <NavButton
          icon={<HomeIcon size={20} />}
          label="Main Flow"
          accent
        />

        {/* Current Song */}
        <NavButton
          icon={<MusicNoteIcon size={20} />}
          label="Current Song"
          active={songPopoverOpen}
          onClick={() => { setReactionOpen(false); setSongPopoverOpen((v) => !v) }}
        />

        {/* Request Song */}
        <NavButton
          icon={<PlusIcon size={20} />}
          label="Request Song"
          onClick={() => { setSongPopoverOpen(false); setReactionOpen(false); onSongRequest() }}
        />
      </nav>
    </>
  )
}

interface NavButtonProps {
  icon: React.ReactNode
  label: string
  onClick?: () => void
  active?: boolean
  accent?: boolean
  dim?: boolean
}

function NavButton({ icon, label, onClick, active = false, accent = false, dim = false }: NavButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '3px',
        background: accent ? 'rgba(212, 175, 55, 0.07)' : 'none',
        border: 'none',
        borderTop: accent ? '1px solid rgba(212, 175, 55, 0.3)' : '1px solid transparent',
        cursor: onClick ? 'pointer' : 'default',
        color: active ? '#D4AF37' : accent ? '#D4AF37' : '#F5F0E8',
        opacity: dim ? 0.3 : 1,
        transition: 'color 0.15s, opacity 0.15s',
        padding: 0,
      }}
    >
      {icon}
      <span style={{
        fontFamily: 'var(--font-sans)',
        fontSize: '8px',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        opacity: active || accent ? 0.9 : 0.45,
        lineHeight: 1,
      }}>
        {label}
      </span>
    </button>
  )
}

const popoverLabelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: '9px',
  letterSpacing: '0.25em',
  textTransform: 'uppercase',
  color: '#D4AF37',
  margin: '0 0 0.4rem',
  opacity: 0.8,
}

const popoverTrackStyle: React.CSSProperties = {
  fontFamily: 'var(--font-serif)',
  fontSize: '1rem',
  fontStyle: 'italic',
  color: '#F5F0E8',
  margin: 0,
  lineHeight: 1.3,
}

const popoverArtistStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: '11px',
  color: '#A8C5DA',
  opacity: 0.7,
  margin: '0.25rem 0 0',
}
