'use client'

import { useState } from 'react'
import { callEdgeFn } from '@/lib/edge-fn'
import { DropletIcon, SparklesIcon, CheckIcon, GlassIcon, UtensilsIcon, SnowflakeIcon, WindIcon } from '@/lib/icons'

interface Props {
  sessionId: string
  accessToken: string
}

export default function TableSideTriggers({ sessionId, accessToken }: Props) {
  const [loading, setLoading] = useState<string | null>(null)
  const [fired, setFired] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

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
        <TriggerButton
          label="The Pour"
          icon={<GlassIcon size={14} />}
          subLabel="Fullscreen pour animation"
          loading={loading === 'pour_moment'}
          fired={fired === 'pour_moment'}
          onClick={() => fire('pour_moment')}
        />

        <TriggerButton
          label="The Bite"
          icon={<UtensilsIcon size={14} />}
          subLabel="Fullscreen bite animation"
          loading={loading === 'bite_moment'}
          fired={fired === 'bite_moment'}
          onClick={() => fire('bite_moment')}
        />

        <TriggerButton
          label="Cleanse Moment"
          icon={<SnowflakeIcon size={14} />}
          subLabel="Fullscreen cleanse animation"
          loading={loading === 'cleanse_moment'}
          fired={fired === 'cleanse_moment'}
          onClick={() => fire('cleanse_moment')}
        />

        <TriggerButton
          label="Refresh Moment"
          icon={<WindIcon size={14} />}
          subLabel="Fullscreen refresh animation"
          loading={loading === 'refresh_moment'}
          fired={fired === 'refresh_moment'}
          onClick={() => fire('refresh_moment')}
        />

        <TriggerButton
          label="Butter Pour"
          icon={<DropletIcon size={14} />}
          subLabel="Fullscreen butter pour shimmer"
          loading={loading === 'butter_pour'}
          fired={fired === 'butter_pour'}
          onClick={() => fire('butter_pour')}
        />

        <TriggerButton
          label="Dessert Reveal"
          icon={<SparklesIcon size={14} />}
          subLabel="Gold reveal on guest screens"
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
  label, icon, subLabel, loading, fired, onClick
}: {
  label: string
  icon?: React.ReactNode
  subLabel: string
  loading: boolean
  fired: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.75rem 1rem',
        backgroundColor: fired ? 'rgba(212, 175, 55, 0.15)' : 'rgba(212, 175, 55, 0.08)',
        border: '1px solid rgba(212, 175, 55, 0.35)',
        color: '#F5F0E8',
        cursor: loading ? 'default' : 'pointer',
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
        opacity: 0.8,
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
