import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 6,
          background: '#2D1B47',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: 19,
            color: '#D4AF37',
            fontStyle: 'italic',
            lineHeight: 1,
          }}
        >
          C
        </span>
      </div>
    ),
    { ...size }
  )
}
