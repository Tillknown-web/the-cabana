import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateId(): string {
  return crypto.randomUUID()
}

/** Resize an image file client-side to max 1200px wide, JPEG 80% quality */
export function resizeImage(file: File, maxWidth = 1200): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width)
      const canvas = document.createElement('canvas')
      canvas.width = img.width * scale
      canvas.height = img.height * scale
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url)
          if (blob) resolve(blob)
          else reject(new Error('Canvas toBlob failed'))
        },
        'image/jpeg',
        0.8
      )
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Image load failed'))
    }
    img.src = url
  })
}

/** Draw The Cabana branded overlay on a photo canvas */
export function drawBrandedOverlay(
  canvas: HTMLCanvasElement,
  date: string
): void {
  const ctx = canvas.getContext('2d')!
  const w = canvas.width
  const h = canvas.height

  // Aubergine border frame
  ctx.strokeStyle = '#2D1B47'
  ctx.lineWidth = 16
  ctx.strokeRect(8, 8, w - 16, h - 16)

  // Gold inner line
  ctx.strokeStyle = '#D4AF37'
  ctx.lineWidth = 2
  ctx.strokeRect(18, 18, w - 36, h - 36)

  // Watermark bottom-right
  ctx.save()
  ctx.globalAlpha = 0.85
  const padding = 24

  // Semi-transparent background pill
  const text1 = 'The Cabana'
  const text2 = date
  ctx.font = 'italic 600 14px Georgia, serif'
  const w1 = ctx.measureText(text1).width
  ctx.font = '11px Inter, sans-serif'
  const w2 = ctx.measureText(text2).width
  const maxW = Math.max(w1, w2)

  ctx.fillStyle = 'rgba(45, 27, 71, 0.7)'
  const rx = w - maxW - padding - 12
  const ry = h - 52 - padding
  ctx.beginPath()
  ctx.roundRect(rx, ry, maxW + 24, 48, 6)
  ctx.fill()

  // Gold divider line
  ctx.strokeStyle = 'rgba(212,175,55,0.6)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(rx + 8, ry + 26)
  ctx.lineTo(rx + maxW + 16, ry + 26)
  ctx.stroke()

  // Text
  ctx.fillStyle = '#F5F0E8'
  ctx.font = 'italic 600 14px Georgia, serif'
  ctx.fillText(text1, rx + 12, ry + 18)

  ctx.fillStyle = '#D4AF37'
  ctx.font = '10px Inter, sans-serif'
  ctx.letterSpacing = '0.1em'
  ctx.fillText(text2.toUpperCase(), rx + 12, ry + 40)
  ctx.restore()
}

export function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

export function formatElapsed(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins === 1) return '1 min ago'
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.floor(mins / 60)
  return `${hrs}h ${mins % 60}m ago`
}

export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}
