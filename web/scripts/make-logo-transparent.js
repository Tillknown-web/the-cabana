// One-shot utility: rewrites web/public/logo-trademark.png so its black
// background becomes transparent. Pixels are processed by luminance with a
// soft ramp so the anti-aliased edges of the wordmark stay clean.
//
//   node scripts/make-logo-transparent.js

const fs = require('fs')
const path = require('path')
const sharp = require('sharp')

const src = path.resolve(__dirname, '..', 'public', 'logo-trademark.png')

async function main() {
  const { data, info } = await sharp(src)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const out = Buffer.from(data)
  const lo = 24
  const hi = 64
  const ramp = hi - lo

  for (let i = 0; i < out.length; i += 4) {
    const r = out[i]
    const g = out[i + 1]
    const b = out[i + 2]
    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b

    if (luma < lo) {
      out[i + 3] = 0
    } else if (luma < hi) {
      out[i + 3] = Math.round(((luma - lo) / ramp) * 255)
    }
  }

  const tmp = src + '.tmp'
  await sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png()
    .toFile(tmp)

  fs.renameSync(tmp, src)
  console.log(`Rewrote ${src} (${info.width}x${info.height})`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
