'use client'

import { useRef, useState } from 'react'

interface Props {
  guests: { id: string; name: string }[]
  eventDate: string
  sessionId: string
}

export default function KeepsakeReceipt({ guests, eventDate, sessionId }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [generating, setGenerating] = useState(false)

  async function generateAndDownload() {
    setGenerating(true)

    try {
      const canvas = document.createElement('canvas')
      canvas.width = 720
      canvas.height = 960
      const ctx = canvas.getContext('2d')!

      // Background
      ctx.fillStyle = '#2D1B47'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Gold border
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)'
      ctx.lineWidth = 1
      ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80)

      // Inner border
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.15)'
      ctx.lineWidth = 1
      ctx.strokeRect(52, 52, canvas.width - 104, canvas.height - 104)

      // Gold divider line (top)
      ctx.fillStyle = 'rgba(212, 175, 55, 0.5)'
      ctx.fillRect(canvas.width / 2 - 20, 200, 40, 1)

      // Title label
      ctx.fillStyle = '#D4AF37'
      ctx.font = '600 11px system-ui, sans-serif'
      ctx.letterSpacing = '0.3em'
      ctx.textAlign = 'center'
      ctx.fillText('THE CABANA', canvas.width / 2, 160)

      // Wordmark
      ctx.fillStyle = '#F5F0E8'
      ctx.font = '400 52px Georgia, serif'
      ctx.letterSpacing = '0'
      ctx.fillText('An Evening', canvas.width / 2, 340)
      ctx.fillText('Together', canvas.width / 2, 400)

      // Gold divider (middle)
      ctx.fillStyle = 'rgba(212, 175, 55, 0.5)'
      ctx.fillRect(canvas.width / 2 - 20, 440, 40, 1)

      // Guest names
      ctx.fillStyle = '#F5F0E8'
      ctx.font = 'italic 400 28px Georgia, serif'
      const guestNames = guests.map((g) => g.name).join(' & ')
      ctx.fillText(guestNames, canvas.width / 2, 510)

      // Date
      ctx.fillStyle = 'rgba(245, 240, 232, 0.45)'
      ctx.font = '400 13px system-ui, sans-serif'
      ctx.fillText(eventDate, canvas.width / 2, 555)

      // Course list
      const courses = ['The Pour', 'The Bite', 'The Cut', 'The Finish']
      ctx.fillStyle = 'rgba(212, 175, 55, 0.6)'
      ctx.font = '400 11px system-ui, sans-serif'
      courses.forEach((course, i) => {
        ctx.fillText(course, canvas.width / 2, 640 + i * 30)
      })

      // Footer divider
      ctx.fillStyle = 'rgba(212, 175, 55, 0.4)'
      ctx.fillRect(canvas.width / 2 - 20, 790, 40, 1)

      // Footer text
      ctx.fillStyle = 'rgba(245, 240, 232, 0.2)'
      ctx.font = '400 10px system-ui, sans-serif'
      ctx.fillText(`thecabana.com/gallery/${sessionId}`, canvas.width / 2, 840)

      // Download
      const link = document.createElement('a')
      link.download = 'the-cabana-keepsake.png'
      link.href = canvas.toDataURL('image/png')
      link.click()
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <p style={labelStyle}>Keepsake</p>
      <p style={subStyle}>Download a memento from the evening.</p>

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <button
        onClick={generateAndDownload}
        disabled={generating}
        style={{
          marginTop: '1rem',
          padding: '0.85rem 2rem',
          backgroundColor: generating ? 'rgba(212, 175, 55, 0.25)' : 'transparent',
          color: '#D4AF37',
          fontFamily: 'var(--font-sans)',
          fontSize: '11px',
          fontWeight: 500,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          border: '1px solid rgba(212, 175, 55, 0.4)',
          cursor: generating ? 'default' : 'pointer',
          transition: 'background-color 0.2s',
        }}
      >
        {generating ? 'Generating…' : 'Download Keepsake'}
      </button>
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
  opacity: 0.5,
  marginTop: '0.4rem',
}
