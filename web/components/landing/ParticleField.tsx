'use client'

import { useMemo } from 'react'

interface Particle {
  id: number
  left: string
  top: string
  size: number
  delay: number
  duration: number
  color: string
}

const PARTICLE_COUNT = 12

export default function ParticleField() {
  const particles = useMemo<Particle[]>(() => {
    // Deterministic seed-based values (avoids hydration mismatch)
    return Array.from({ length: PARTICLE_COUNT }, (_, i) => {
      const seed = i * 137.508 // golden angle distribution
      const x = ((Math.sin(seed) * 0.5 + 0.5) * 100)
      const y = ((Math.cos(seed * 1.3) * 0.5 + 0.5) * 80) + 10
      const size = 1 + (i % 3)
      const delay = (i * 0.9) % 12
      const duration = 10 + (i % 10)
      const colors = ['rgba(77,217,192,0.6)', 'rgba(139,92,246,0.5)', 'rgba(212,175,55,0.4)']
      return {
        id: i,
        left: `${x.toFixed(2)}%`,
        top: `${y.toFixed(2)}%`,
        size,
        delay,
        duration,
        color: colors[i % colors.length],
      }
    })
  }, [])

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        willChange: 'transform, opacity',
      }}
    >
      {particles.map(p => (
        <span
          key={p.id}
          style={{
            position: 'absolute',
            left: p.left,
            top: p.top,
            width: `${p.size}px`,
            height: `${p.size}px`,
            borderRadius: '50%',
            background: p.color,
            boxShadow: `0 0 ${p.size * 4}px ${p.color}`,
            animation: `float-up ${p.duration}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  )
}
