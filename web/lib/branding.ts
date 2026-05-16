/**
 * Draws the photo onto a canvas with The Cabana branding (logo + date) baked
 * into the bottom-left and bottom-right corners. The logo and date sit
 * directly on the photo (no dark band behind them) with a soft drop shadow
 * for legibility on any background.
 *
 * Used by every photo-upload path so the burned-in branding stays consistent
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

      // Logo + date sit in a virtual "band" worth of vertical space, but we
      // never paint a background behind them — the photo shows through.
      const bandH = Math.max(72, Math.round(w * 0.085))
      const padX = Math.max(16, Math.round(w * 0.018))
      const padY = Math.max(14, Math.round(h * 0.015))

      const finalize = () => {
        canvas.toBlob(
          (b) => { if (b) resolve(b); else reject(new Error('Canvas export failed')) },
          'image/jpeg',
          0.88
        )
      }

      const withShadow = (draw: () => void) => {
        ctx.save()
        ctx.shadowColor = 'rgba(0, 0, 0, 0.65)'
        ctx.shadowBlur = 10
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 1
        draw()
        ctx.restore()
      }

      const drawDate = () => {
        withShadow(() => {
          ctx.font = `500 ${Math.round(bandH * 0.32)}px system-ui, sans-serif`
          ctx.fillStyle = '#D4AF37'
          ctx.textBaseline = 'middle'
          ctx.textAlign = 'right'
          ctx.fillText(eventDate, w - padX, h - padY - bandH / 2)
        })
      }

      const logoH = Math.round(bandH * 0.95)
      const logoY = h - padY - logoH
      const logo = new Image()
      logo.onload = () => {
        const logoW = Math.round(logo.naturalWidth * (logoH / logo.naturalHeight))
        withShadow(() => {
          ctx.drawImage(logo, padX, logoY, logoW, logoH)
        })
        drawDate()
        finalize()
      }
      logo.onerror = () => {
        withShadow(() => {
          ctx.fillStyle = '#F5F0E8'
          ctx.font = `500 ${Math.round(bandH * 0.42)}px Georgia, serif`
          ctx.textBaseline = 'middle'
          ctx.textAlign = 'left'
          ctx.fillText('The Cabana', padX, h - padY - bandH / 2)
        })
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
