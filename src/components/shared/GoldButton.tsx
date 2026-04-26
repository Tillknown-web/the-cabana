'use client'

import { ButtonHTMLAttributes } from 'react'

interface GoldButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  variant?: 'solid' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  loading?: boolean
}

export default function GoldButton({
  children,
  variant = 'solid',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled,
  style,
  ...props
}: GoldButtonProps) {
  const sizes = {
    sm: { padding: '10px 20px', fontSize: 12, letterSpacing: '0.12em' },
    md: { padding: '14px 28px', fontSize: 13, letterSpacing: '0.15em' },
    lg: { padding: '18px 36px', fontSize: 14, letterSpacing: '0.15em' },
  }

  const sz = sizes[size]

  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    fontFamily: "'Inter', sans-serif",
    fontSize: sz.fontSize,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: sz.letterSpacing,
    padding: sz.padding,
    borderRadius: 2,
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled || loading ? 0.5 : 1,
    transition: 'opacity 0.2s, transform 0.1s',
    width: fullWidth ? '100%' : 'auto',
    border: 'none',
    outline: 'none',
    WebkitTapHighlightColor: 'transparent',
    ...(variant === 'solid'
      ? { backgroundColor: '#D4AF37', color: '#2D1B47' }
      : {
          backgroundColor: 'transparent',
          color: '#D4AF37',
          border: '1px solid rgba(212,175,55,0.5)',
        }),
    ...style,
  }

  return (
    <button
      {...props}
      disabled={disabled || loading}
      style={baseStyle}
      onMouseDown={(e) => {
        if (!disabled && !loading) {
          ;(e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.97)'
        }
        props.onMouseDown?.(e)
      }}
      onMouseUp={(e) => {
        ;(e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'
        props.onMouseUp?.(e)
      }}
      onTouchStart={(e) => {
        if (!disabled && !loading) {
          ;(e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.97)'
        }
        props.onTouchStart?.(e)
      }}
      onTouchEnd={(e) => {
        ;(e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'
        props.onTouchEnd?.(e)
      }}
    >
      {loading ? (
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <LoadingDots />
        </span>
      ) : (
        children
      )}
    </button>
  )
}

function LoadingDots() {
  return (
    <span style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 5,
            height: 5,
            borderRadius: '50%',
            backgroundColor: 'currentColor',
            animation: `pulse-soft 1.2s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
    </span>
  )
}
