'use client'

import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Guest } from '@/app/experience/page'

interface Props {
  guest: Guest
  sessionId: string
  eventDate?: string
}

type BoothState =
  | { stage: 'idle' }
  | { stage: 'preview'; brandedBlob: Blob; previewUrl: string }
  | { stage: 'uploading'; previewUrl: string }
  | { stage: 'done'; previewUrl: string }

export default function PhotoBoothButton({ guest, sessionId, eventDate = 'July 12, 2026' }: Props) {
  const [open, setOpen] = useState(false)
  const [state, setState] = useState<BoothState>({ stage: 'idle' })
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function openCamera() {
    setError(null)
    setState({ stage: 'idle' })
    inputRef.current?.click()
  }

  async function handleFile(file: File) {
    setError(null)
    try {
      const branded = await applyBrandingOverlay(file, eventDate)
      const previewUrl = URL.createObjectURL(branded)
      setState({ stage: 'preview', brandedBlob: branded, previewUrl })
    } catch (err) {
      setError((err as Error).message)
    }
  }

  async function handleUpload() {
    if (state.stage !== 'preview') return
    const { brandedBlob, previewUrl } = state
    setState({ stage: 'uploading', previewUrl })
    setError(null)

    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      const timestamp = Date.now()
      const storagePath = `${sessionId}/${guest.id}/booth_${timestamp}.jpg`

      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(storagePath, brandedBlob, { contentType: 'image/jpeg', upsert: false })

      if (uploadError) throw new Error(uploadError.message)

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/record-photo`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ sessionId, course: 'booth', storagePath }),
        }
      )

      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error ?? 'Failed to save photo')
      }

      setState({ stage: 'done', previewUrl })
    } catch (err) {
      setError((err as Error).message)
      // Revert to idle so they can retake
      setState({ stage: 'idle' })
    }
  }

  function handleDownload() {
    if (state.stage !== 'preview' && state.stage !== 'done') return
    const link = document.createElement('a')
    link.download = `the-cabana-booth-${Date.now()}.jpg`
    link.href = state.previewUrl
    link.click()
  }

  async function handleShare() {
    if (state.stage !== 'preview' && state.stage !== 'done') return
    if (!navigator.share) { handleDownload(); return }
    try {
      const blob = state.stage === 'preview' ? state.brandedBlob : await fetch(state.previewUrl).then(r => r.blob())
      await navigator.share({
        title: 'The Cabana',
        text: 'poolside, after dark',
        files: [new File([blob], 'the-cabana.jpg', { type: 'image/jpeg' })],
      })
    } catch { /* user cancelled */ }
  }

  function handleRetake() {
    setState({ stage: 'idle' })
    setError(null)
    setTimeout(() => inputRef.current?.click(), 50)
  }

  function handleClose() {
    setOpen(false)
    setState({ stage: 'idle' })
    setError(null)
  }

  const isPreviewOrDone = state.stage === 'preview' || state.stage === 'done'

  return (
    <>
      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = '' }}
        style={{ display: 'none' }}
      />

      {/* Floating button */}
      <button
        onClick={() => { setOpen(true); openCamera() }}
        aria-label="Photo booth"
        style={{
          position: 'fixed',
          bottom: '72px',
          right: '1rem',
          zIndex: 60,
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          backgroundColor: 'rgba(26, 26, 46, 0.85)',
          border: '1px solid rgba(212, 175, 55, 0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          fontSize: '1.1rem',
          backdropFilter: 'blur(4px)',
        }}
      >
        📷
      </button>

      {/* Preview / done modal */}
      {open && isPreviewOrDone && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            backgroundColor: 'rgba(26, 26, 46, 0.96)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
        >
          {/* Header */}
          <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
            <p style={labelStyle}>
              {state.stage === 'done' ? 'Saved to gallery' : 'Photo Booth'}
            </p>
          </div>

          {/* Preview image */}
          <div style={{
            width: '100%',
            maxWidth: '340px',
            aspectRatio: '1',
            overflow: 'hidden',
            border: '1px solid rgba(212, 175, 55, 0.25)',
            marginBottom: '1.25rem',
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={state.previewUrl}
              alt="Booth preview"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </div>

          {error && <p style={errorStyle}>{error}</p>}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center', width: '100%', maxWidth: '340px' }}>
            {state.stage === 'preview' && (
              <button
                onClick={handleUpload}
                style={{ ...actionBtnStyle, backgroundColor: '#D4AF37', color: '#1A1A2E', flex: 1 }}
              >
                Save to Gallery
              </button>
            )}

            {state.stage === 'done' && (
              <button
                onClick={handleDownload}
                style={{ ...actionBtnStyle, backgroundColor: '#D4AF37', color: '#1A1A2E', flex: 1 }}
              >
                Download
              </button>
            )}

            <button onClick={handleShare} style={{ ...actionBtnStyle, flex: 1 }}>
              Share
            </button>

            {state.stage === 'preview' && (
              <button onClick={handleRetake} style={{ ...ghostBtnStyle, width: '100%' }}>
                Retake
              </button>
            )}

            <button onClick={handleClose} style={{ ...ghostBtnStyle, width: '100%', opacity: 0.35 }}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* Uploading overlay */}
      {open && state.stage === 'uploading' && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 200,
          backgroundColor: 'rgba(26, 26, 46, 0.96)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
        }}>
          <p style={labelStyle}>Saving…</p>
          <UploadingDots />
        </div>
      )}
    </>
  )
}

/** Draw the photo onto a canvas with The Cabana branding overlay. Returns a JPEG blob. */
async function applyBrandingOverlay(file: File, eventDate: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      const MAX = 1200
      const scale = Math.min(1, MAX / Math.max(img.width, img.height))
      const w = Math.round(img.width * scale)
      const h = Math.round(img.height * scale)

      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      if (!ctx) { reject(new Error('Canvas unavailable')); return }

      // Draw photo
      ctx.drawImage(img, 0, 0, w, h)
      URL.revokeObjectURL(url)

      // Aubergine border frame (inset 10px, 3px stroke)
      ctx.strokeStyle = 'rgba(45, 27, 71, 0.7)'
      ctx.lineWidth = 3
      ctx.strokeRect(10, 10, w - 20, h - 20)

      // Bottom label band
      const bandH = 36
      ctx.fillStyle = 'rgba(45, 27, 71, 0.82)'
      ctx.fillRect(0, h - bandH, w, bandH)

      // Gold hairline above band
      ctx.fillStyle = 'rgba(212, 175, 55, 0.5)'
      ctx.fillRect(0, h - bandH, w, 1)

      // Brand text
      ctx.fillStyle = '#F5F0E8'
      ctx.font = `400 ${Math.round(bandH * 0.38)}px Georgia, serif`
      ctx.textBaseline = 'middle'
      ctx.textAlign = 'left'
      ctx.fillText('The Cabana', 14, h - bandH / 2)

      // Date text (right side)
      ctx.font = `400 ${Math.round(bandH * 0.3)}px system-ui, sans-serif`
      ctx.fillStyle = 'rgba(212, 175, 55, 0.85)'
      ctx.textAlign = 'right'
      ctx.fillText(eventDate, w - 14, h - bandH / 2)

      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob)
          else reject(new Error('Canvas export failed'))
        },
        'image/jpeg',
        0.88
      )
    }

    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = url
  })
}

function UploadingDots() {
  return (
    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{
          width: '5px', height: '5px', borderRadius: '50%',
          backgroundColor: '#D4AF37',
          animation: `cabana-dot 1.2s ease-in-out ${i * 0.2}s infinite`,
        }} />
      ))}
      <style>{`
        @keyframes cabana-dot {
          0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
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

const actionBtnStyle: React.CSSProperties = {
  padding: '0.75rem 1rem',
  fontFamily: 'var(--font-sans)',
  fontSize: '11px',
  fontWeight: 600,
  letterSpacing: '0.15em',
  textTransform: 'uppercase',
  border: '1px solid rgba(212, 175, 55, 0.4)',
  backgroundColor: 'transparent',
  color: '#F5F0E8',
  cursor: 'pointer',
}

const ghostBtnStyle: React.CSSProperties = {
  padding: '0.6rem',
  fontFamily: 'var(--font-sans)',
  fontSize: '11px',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  backgroundColor: 'transparent',
  border: 'none',
  color: '#F5F0E8',
  cursor: 'pointer',
  opacity: 0.5,
}

const errorStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: '11px',
  color: '#A8C5DA',
  marginBottom: '0.75rem',
  opacity: 0.8,
}
