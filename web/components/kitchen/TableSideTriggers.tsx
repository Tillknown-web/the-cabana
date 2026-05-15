'use client'

import { useState } from 'react'
import { callEdgeFn } from '@/lib/edge-fn'
import { DropletIcon, SparklesIcon, CheckIcon, GlassIcon, UtensilsIcon, SnowflakeIcon, WindIcon } from '@/lib/icons'

interface Props {
  sessionId: string
  currentCard: string
  accessToken: string
}

export default function TableSideTriggers({ sessionId, currentCard, accessToken }: Props) {
  const [loading, setLoading] = useState<string | null>(null)
  const [fired, setFired] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const canPourMoment    = currentCard === 'pour'
  const canBiteMoment    = currentCard === 'bite'
  const canCleanseMoment = currentCard === 'cleanse'
  const canRefreshMoment = currentCard === 'agua'
  const canButterPour    = currentCard === 'cut'
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
        {/* Pour Moment */}
        <TriggerButton
          label="The Pour"
          icon={<GlassIcon size={14} />}
          subLabel="Active during The Pour"
          enabled={canPourMoment}
          loading={loading === 'pour_moment'}
          fired={fired === 'pour_moment'}
          onClick={() => fire('pour_moment')}
        />

        {/* Bite Moment */}
        <TriggerButton
          label="The Bite"
          icon={<UtensilsIcon size={14} />}
          subLabel="Active during The Bite"
          enabled={canBiteMoment}
          loading={loading === 'bite_moment'}
          fired={fired === 'bite_moment'}
          onClick={() => fire('bite_moment')}
        />

        {/* Cleanse Moment */}
        <TriggerButton
          label="Cleanse Moment"
          icon={<SnowflakeIcon size={14} />}
          subLabel="Active during The Cleanse"
          enabled={canCleanseMoment}
          loading={loading === 'cleanse_moment'}
          fired={fired === 'cleanse_moment'}
          onClick={() => fire('cleanse_moment')}
        />

        {/* Refresh Moment */}
        <TriggerButton
          label="Refresh Moment"
          icon={<WindIcon size={14} />}
          subLabel="Active during The Refresh"
          enabled={canRefreshMoment}
          loading={loading === 'refresh_moment'}
          fired={fired === 'refresh_moment'}
          onClick={() => fire('refresh_moment')}
        />

        {/* Butter Pour */}
        <TriggerButton
          label="Butter Pour"
          icon={<DropletIcon size={14} />}
          subLabel="Active during The Cut"
          enabled={canButterPour}
          loading={loading === 'butter_pour'}
          fired={fired === 'butter_pour'}
          onClick={() => fire('butter_pour')}
        />

        {/* Dessert Reveal */}
        <TriggerButton
          label="Dessert Reveal"
          icon={<SparklesIcon size={14} />}
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
  label, icon, subLabel, enabled, loading, fired, onClick
}: {
  label: string
  icon?: React.ReactNode
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
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', margin: 0, color: '#F5F0E8', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          {icon}{label}
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
        {fired ? <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>Fired <CheckIcon size={9} /></span> : loading ? '…' : 'Fire'}
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
