/**
 * Draws the photo onto a canvas with The Cabana branding band (logo + event
 * date) baked in along the bottom edge. Returns a JPEG blob ready to upload.
 *
 * Used by every photo-upload path so the burned-in band stays consistent
 * (PhotoUpload, PhotoBoothButton, ExperienceNavBar.handleFile).
 */
export function applyBrandingOverlay(input: Blob | File, eventDate: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(input)

    img.onload = () => {
      const MAX = 1200
      const scale = Math.min(1, MAX / Math.max(img.width, img.height))
      const w = Math.round(img.width * scale)
      const h = Math.round(img.height * scale)

      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        URL.revokeObjectURL(url)
        reject(new Error('Canvas unavailable'))
        return
      }

      ctx.drawImage(img, 0, 0, w, h)
      URL.revokeObjectURL(url)

      // Inset border frame
      ctx.strokeStyle = 'rgba(10, 10, 15, 0.7)'
      ctx.lineWidth = 3
      ctx.strokeRect(10, 10, w - 20, h - 20)

      // Bottom label band — tall enough for the new tight-crop logo to read
      // clearly when the image is opened at full size.
      const bandH = Math.max(72, Math.round(w * 0.085))
      ctx.fillStyle = 'rgba(10, 10, 15, 0.82)'
      ctx.fillRect(0, h - bandH, w, bandH)

      // Gold hairline above band
      ctx.fillStyle = 'rgba(212, 175, 55, 0.5)'
      ctx.fillRect(0, h - bandH, w, 1)

      const finalize = () => {
        canvas.toBlob(
          (b) => { if (b) resolve(b); else reject(new Error('Canvas export failed')) },
          'image/jpeg',
          0.88
        )
      }

      const drawDate = () => {
        ctx.font = `400 ${Math.round(bandH * 0.3)}px system-ui, sans-serif`
        ctx.fillStyle = 'rgba(212, 175, 55, 0.85)'
        ctx.textBaseline = 'middle'
        ctx.textAlign = 'right'
        ctx.fillText(eventDate, w - 14, h - bandH / 2)
      }

      // Brand logo (left side of band) — the new horizontal art is tight-cropped,
      // so we can fill 88% of the band height with it.
      const logoH = Math.round(bandH * 0.88)
      const logoY = h - bandH + (bandH - logoH) / 2
      const logo = new Image()
      logo.onload = () => {
        const logoW = Math.round(logo.naturalWidth * (logoH / logo.naturalHeight))
        ctx.drawImage(logo, 14, logoY, logoW, logoH)
        drawDate()
        finalize()
      }
      logo.onerror = () => {
        // Fall back to a wordmark if the asset fails to load
        ctx.fillStyle = '#F5F0E8'
        ctx.font = `400 ${Math.round(bandH * 0.38)}px Georgia, serif`
        ctx.textBaseline = 'middle'
        ctx.textAlign = 'left'
        ctx.fillText('The Cabana', 14, h - bandH / 2)
        drawDate()
        finalize()
      }
      logo.src = '/logo-trademark.png'
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image'))
    }
    img.src = url
  })
}
