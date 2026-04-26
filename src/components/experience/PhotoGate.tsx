'use client'

import { useState, useRef } from 'react'
import type { CourseId, ReactionType } from '@/types'
import GoldButton from '@/components/shared/GoldButton'
import { resizeImage } from '@/lib/utils'
import { playReactionSound } from '@/lib/sounds'

const COURSE_LABELS: Record<CourseId, string> = {
  guest: 'guest',
  pour: 'pour',
  bite: 'bite',
  cut: 'cut',
  finish: 'finish',
  booth: 'booth',
}

const REACTIONS: { type: ReactionType; emoji: string; label: string }[] = [
  { type: 'fire', emoji: '🔥', label: 'Fire' },
  { type: 'heart', emoji: '❤️', label: 'Heart' },
  { type: 'chefs_kiss', emoji: '🤌', label: "Chef's Kiss" },
]

interface OtherGuestPhoto {
  id: string
  signedUrl: string
  guestName: string
}

interface PhotoGateProps {
  course: CourseId
  sessionId: string
  guestId: string
  onComplete: () => void
  otherGuestPhoto?: OtherGuestPhoto | null
}

export default function PhotoGate({ course, sessionId, guestId, onComplete, otherGuestPhoto }: PhotoGateProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploaded, setUploaded] = useState(false)
  const [reaction, setReaction] = useState<ReactionType | null>(null)
  const [reactionSent, setReactionSent] = useState(false)

  function handleCapture(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  async function handleUpload() {
    if (!preview) return
    setUploading(true)
    try {
      const res = await fetch(preview)
      const blob = await res.blob()
      const file = new File([blob], `${course}.jpg`, { type: 'image/jpeg' })
      const resized = await resizeImage(file)
      const formData = new FormData()
      formData.append('photo', resized, `${course}.jpg`)
      formData.append('sessionId', sessionId)
      formData.append('guestId', guestId)
      formData.append('course', course)
      await fetch('/api/photo', { method: 'POST', body: formData })
      setUploaded(true)
    } finally {
      setUploading(false)
    }
  }

  async function handleReaction(type: ReactionType) {
    if (!otherGuestPhoto || reactionSent) return
    setReaction(type)
    playReactionSound()
    await fetch('/api/reaction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        fromGuestId: guestId,
        toPhotoId: otherGuestPhoto.id,
        reactionType: type,
      }),
    })
    setReactionSent(true)
    setTimeout(onComplete, 1000)
  }

  // Step: show other guest's photo for reaction
  if (uploaded && otherGuestPhoto) {
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
          padding: '32px 24px',
          gap: 24,
          textAlign: 'center',
          paddingBottom: 72,
        }}
      >
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 11,
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
            color: 'rgba(245,240,232,0.5)',
          }}
        >
          {otherGuestPhoto.guestName}&apos;s {COURSE_LABELS[course]}
        </p>

        <img
          src={otherGuestPhoto.signedUrl}
          alt={`${otherGuestPhoto.guestName}'s photo`}
          style={{
            maxWidth: '100%',
            maxHeight: '55vh',
            borderRadius: 4,
            border: '1px solid rgba(212,175,55,0.3)',
            objectFit: 'contain',
          }}
        />

        <div style={{ display: 'flex', gap: 24 }}>
          {REACTIONS.map((r) => (
            <button
              key={r.type}
              onClick={() => handleReaction(r.type)}
              disabled={reactionSent}
              style={{
                fontSize: 36,
                background: 'none',
                border: 'none',
                cursor: reactionSent ? 'default' : 'pointer',
                transform: reaction === r.type ? 'scale(1.4)' : 'scale(1)',
                transition: 'transform 0.2s ease',
                opacity: reactionSent && reaction !== r.type ? 0.3 : 1,
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {r.emoji}
            </button>
          ))}
        </div>

        {!reactionSent && (
          <button
            onClick={onComplete}
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 12,
              color: 'rgba(245,240,232,0.35)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 8,
            }}
          >
            Skip
          </button>
        )}
      </div>
    )
  }

  // Step: waiting for other guest after upload
  if (uploaded && !otherGuestPhoto) {
    return (
      <div
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
          gap: 16,
          paddingBottom: 72,
        }}
      >
        <p
          className="animate-pulse-soft"
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 22,
            fontWeight: 300,
            color: '#F5F0E8',
          }}
        >
          Waiting for the other guest…
        </p>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, fontStyle: 'italic', color: '#A8C5DA' }}>
          Their photo will appear here
        </p>
      </div>
    )
  }

  // Step: photo preview
  if (preview) {
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
          padding: '32px 24px',
          gap: 20,
          paddingBottom: 72,
        }}
      >
        <img
          src={preview}
          alt="Preview"
          style={{
            maxWidth: '100%',
            maxHeight: '60vh',
            borderRadius: 4,
            border: '1px solid rgba(212,175,55,0.3)',
            objectFit: 'contain',
          }}
        />
        <GoldButton onClick={handleUpload} loading={uploading} fullWidth size="lg" style={{ maxWidth: 320 }}>
          Looks good ✓
        </GoldButton>
        <button
          onClick={() => {
            setPreview(null)
            setTimeout(() => inputRef.current?.click(), 100)
          }}
          style={{
            color: 'rgba(245,240,232,0.4)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontFamily: "'Inter', sans-serif",
            fontSize: 13,
            padding: 8,
          }}
        >
          Retake
        </button>
      </div>
    )
  }

  // Step: snap prompt (shown as part of course card via the snap button)
  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={handleCapture}
        onClick={(e) => { (e.target as HTMLInputElement).value = '' }}
      />
      <GoldButton
        onClick={() => inputRef.current?.click()}
        fullWidth
        size="lg"
        style={{ maxWidth: 320 }}
      >
        📷 Snap your {COURSE_LABELS[course]}
      </GoldButton>
    </>
  )
}
