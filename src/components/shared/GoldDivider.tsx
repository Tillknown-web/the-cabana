'use client'

interface GoldDividerProps {
  className?: string
  width?: number
  style?: React.CSSProperties
}

export default function GoldDivider({ className = '', width = 40, style }: GoldDividerProps) {
  return (
    <div
      className={className}
      style={{
        width,
        height: 1,
        backgroundColor: '#D4AF37',
        opacity: 0.4,
        margin: '0 auto',
        flexShrink: 0,
        ...style,
      }}
    />
  )
}
