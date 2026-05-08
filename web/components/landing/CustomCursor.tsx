'use client'

import { useEffect, useRef, useState } from 'react'

export default function CustomCursor() {
  const dotRef  = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const rafRef  = useRef<number>(0)

  // Ring position lags behind dot for smooth follow
  const ring = useRef({ x: -100, y: -100 })
  const dot  = useRef({ x: -100, y: -100 })
  const isAnimating = useRef(false)
  const [isMagnetic, setIsMagnetic] = useState(false)

  useEffect(() => {
    // Only show on pointer: fine (mouse) devices
    if (window.matchMedia('(pointer: coarse)').matches) return

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t
    const IDLE_THRESHOLD = 0.1

    const animate = () => {
      const nx = lerp(ring.current.x, dot.current.x, 0.12)
      const ny = lerp(ring.current.y, dot.current.y, 0.12)
      ring.current.x = nx
      ring.current.y = ny
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${nx}px, ${ny}px) translate(-50%, -50%)`
      }

      // Stop scheduling frames once the ring has caught up
      if (Math.abs(nx - dot.current.x) < IDLE_THRESHOLD && Math.abs(ny - dot.current.y) < IDLE_THRESHOLD) {
        ring.current.x = dot.current.x
        ring.current.y = dot.current.y
        isAnimating.current = false
        return
      }

      rafRef.current = requestAnimationFrame(animate)
    }

    const onMove = (e: MouseEvent) => {
      dot.current = { x: e.clientX, y: e.clientY }
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`
      }
      // Restart rAF loop only if it's not already running
      if (!isAnimating.current) {
        isAnimating.current = true
        rafRef.current = requestAnimationFrame(animate)
      }
    }

    const onOver = (e: MouseEvent) => {
      const target = e.target as Element
      if (target.closest('[data-magnetic]')) {
        setIsMagnetic(true)
      }
    }

    const onOut = (e: MouseEvent) => {
      const target = e.target as Element
      if (target.closest('[data-magnetic]')) {
        setIsMagnetic(false)
      }
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseover', onOver)
    window.addEventListener('mouseout',  onOut)

    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseover', onOver)
      window.removeEventListener('mouseout',  onOut)
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  // Don't render on touch devices (SSR-safe: render but invisible until JS confirms pointer type)
  return (
    <>
      {/* Dot — sharp, immediate */}
      <div
        ref={dotRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: '#4DD9C0',
          boxShadow: '0 0 10px rgba(77,217,192,0.9), 0 0 20px rgba(77,217,192,0.4)',
          pointerEvents: 'none',
          zIndex: 99998,
          transition: 'width 0.2s, height 0.2s, background 0.2s, box-shadow 0.2s',
          willChange: 'transform',
        }}
      />

      {/* Ring — lags for softness */}
      <div
        ref={ringRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: isMagnetic ? '56px' : '40px',
          height: isMagnetic ? '56px' : '40px',
          borderRadius: '50%',
          border: `1px solid ${isMagnetic ? 'rgba(77,217,192,0.7)' : 'rgba(77,217,192,0.3)'}`,
          boxShadow: isMagnetic
            ? '0 0 20px rgba(77,217,192,0.25), inset 0 0 10px rgba(77,217,192,0.05)'
            : 'none',
          pointerEvents: 'none',
          zIndex: 99997,
          transition: 'width 0.3s ease, height 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
          willChange: 'transform',
          backdropFilter: isMagnetic ? 'blur(2px)' : 'none',
        }}
      />
    </>
  )
}
