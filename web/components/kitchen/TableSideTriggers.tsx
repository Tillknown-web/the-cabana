'use client'

import { useState } from 'react'
import { callEdgeFn } from '@/lib/edge-fn'

interface Props {
  sessionId: string
  currentCard: string
  accessToken: string
}

export default function TableSideTriggers({ sessionId, currentCard, accessToken }: Props) {
  const [loading, setLoading] = useState<string | null>(null)
  const [fired, setFired] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const canButterPour = currentCard === 'cut'
  const canDessertReveal = currentCard === 'finish'

  async function fire(triggerType: string) {
    if (loading) return
    setLoading(triggerType)
    setError(null)

    try {
      await callEdgeFn('tableside-trigger', { sessionId, triggerType }, accessToken)
      setFired(triggerType)
      setTimeout(() => setFired(null), 5000)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div>
      <SectionLabel>Tableside Triggers</SectionLabel>
      <p style={helpStyle}>Push a fullscreen animation to all guest screens.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {/* Butter Pour */}
        <TriggerButton
          label="🧈 Butter Pour"
          subLabel="Active during The Cut"
          enabled={canButterPour}
          loading={loading === 'butter_pour'}
          fired={fired === 'butter_pour'}
          onClick={() => fire('butter_pour')}
        />

        {/* Dessert Reveal */}
        <TriggerButton
          label="✨ Dessert Reveal"
          subLabel="Active during The Finish"
          enabled={canDessertReveal}
          loading={loading === 'dessert_reveal'}
          fired={fired === 'dessert_reveal'}
          onClick={() => fire('dessert_reveal')}
        />
      </div>

      {error && <p style={errorStyle}>{error}</p>}
    </div>
  )
}

function TriggerButton({
  label, subLabel, enabled, loading, fired, onClick
}: {
  label: string
  subLabel: string
  enabled: boolean
  loading: boolean
  fired: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      disabled={!enabled || loading}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.75rem 1rem',
        backgroundColor: fired ? 'rgba(212, 175, 55, 0.15)' : enabled ? 'rgba(212, 175, 55, 0.08)' : 'transparent',
        border: `1px solid ${enabled ? 'rgba(212, 175, 55, 0.35)' : 'rgba(255,255,255,0.08)'}`,
        color: '#F5F0E8',
        cursor: enabled && !loading ? 'pointer' : 'default',
        opacity: enabled ? 1 : 0.3,
        textAlign: 'left',
        width: '100%',
        transition: 'all 0.2s',
      }}
    >
      <div>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', margin: 0, color: '#F5F0E8' }}>
          {label}
        </p>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', margin: 0, color: '#F5F0E8', opacity: 0.4 }}>
          {subLabel}
        </p>
      </div>
      <span style={{
        fontFamily: 'var(--font-sans)',
        fontSize: '9px',
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        color: '#D4AF37',
        opacity: enabled ? 0.8 : 0.3,
      }}>
        {fired ? 'Fired ✓' : loading ? '…' : 'Fire'}
      </span>
    </button>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontFamily: 'var(--font-sans)',
      fontSize: '10px',
      letterSpacing: '0.25em',
      textTransform: 'uppercase',
      color: '#D4AF37',
      opacity: 0.7,
      marginBottom: '0.5rem',
    }}>
      {children}
    </p>
  )
}

const helpStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: '11px',
  color: '#F5F0E8',
  opacity: 0.35,
  marginBottom: '0.75rem',
}

const errorStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: '11px',
  color: '#A8C5DA',
  marginTop: '0.5rem',
  opacity: 0.8,
}
