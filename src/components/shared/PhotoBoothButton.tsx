'use client'

import { useRef, useState } from 'react'
import { resizeImage, drawBrandedOverlay } from '@/lib/utils'

interface PhotoBoothButtonProps {
  sessionId: string
  guestId: string
}

export default function PhotoBoothButton({ sessionId, guestId }: PhotoBoothButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [brandedDataUrl, setBrandedDataUrl] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  function handleCapture(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string
      setPreview(dataUrl)

      // Draw branded overlay
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0)
        drawBrandedOverlay(canvas, 'July 12, 2026')
        setBrandedDataUrl(canvas.toDataURL('image/jpeg', 0.9))
      }
      img.src = dataUrl
    }
    reader.readAsDataURL(file)
    setOpen(true)
  }

  async function handleUpload() {
    if (!preview) return
    setUploading(true)
    try {
      // Convert data URL back to blob
      const res = await fetch(brandedDataUrl || preview)
      const blob = await res.blob()
      const file = new File([blob], `booth_${Date.now()}.jpg`, { type: 'image/jpeg' })
      const resized = await resizeImage(file)

      const formData = new FormData()
      formData.append('photo', resized, `booth_${Date.now()}.jpg`)
      formData.append('sessionId', sessionId)
      formData.append('guestId', guestId)
      formData.append('course', 'booth')

      await fetch('/api/photo', { method: 'POST', body: formData })
      setOpen(false)
      setPreview(null)
      setBrandedDataUrl(null)
    } finally {
      setUploading(false)
    }
  }

  function handleDownload() {
    if (!brandedDataUrl) return
    const a = document.createElement('a')
    a.href = brandedDataUrl
    a.download = `cabana-booth-${Date.now()}.jpg`
    a.click()
  }

  async function handleShare() {
    if (!brandedDataUrl) return
    try {
      const res = await fetch(brandedDataUrl)
      const blob = await res.blob()
      const file = new File([blob], 'cabana-photo.jpg', { type: 'image/jpeg' })
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'The Cabana', text: 'poolside, after dark' })
      } else {
        handleDownload()
      }
    } catch {
      handleDownload()
    }
  }

  return (
    <>
      {/* Floating camera button */}
      <button
        onClick={() => inputRef.current?.click()}
        style={{
          position: 'fixed',
          bottom: 72,
          right: 20,
          width: 44,
          height: 44,
          borderRadius: '50%',
          backgroundColor: 'rgba(45,27,71,0.9)',
          border: '1px solid rgba(212,175,55,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 18,
          cursor: 'pointer',
          zIndex: 45,
          boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        📷
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={handleCapture}
        onClick={(e) => { (e.target as HTMLInputElement).value = '' }}
      />

      {/* Preview modal */}
      {open && preview && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(26,26,46,0.95)',
            zIndex: 300,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            gap: 20,
          }}
        >
          <img
            src={brandedDataUrl || preview}
            alt="Photo preview"
            style={{
              maxWidth: '100%',
              maxHeight: '55vh',
              borderRadius: 4,
              border: '1px solid rgba(212,175,55,0.3)',
              objectFit: 'contain',
            }}
          />

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={handleDownload}
              style={{
                padding: '12px 20px',
                backgroundColor: 'transparent',
                border: '1px solid rgba(212,175,55,0.5)',
                borderRadius: 2,
                color: '#D4AF37',
                fontFamily: "'Inter', sans-serif",
                fontSize: 12,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                cursor: 'pointer',
              }}
            >
              📥 Download
            </button>
            <button
              onClick={handleShare}
              style={{
                padding: '12px 20px',
                backgroundColor: 'transparent',
                border: '1px solid rgba(212,175,55,0.5)',
                borderRadius: 2,
                color: '#D4AF37',
                fontFamily: "'Inter', sans-serif",
                fontSize: 12,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                cursor: 'pointer',
              }}
            >
              📤 Share
            </button>
            <button
              onClick={handleUpload}
              disabled={uploading}
              style={{
                padding: '12px 20px',
                backgroundColor: '#D4AF37',
                border: 'none',
                borderRadius: 2,
                color: '#2D1B47',
                fontFamily: "'Inter', sans-serif",
                fontSize: 12,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                cursor: uploading ? 'not-allowed' : 'pointer',
                opacity: uploading ? 0.6 : 1,
              }}
            >
              {uploading ? 'Saving...' : 'Save to Gallery'}
            </button>
          </div>

          <button
            onClick={() => {
              setOpen(false)
              setPreview(null)
              setBrandedDataUrl(null)
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
            Retake or close
          </button>
        </div>
      )}
    </>
  )
}
