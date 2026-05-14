'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { FlameIcon, HeartIcon, StarIcon } from '@/lib/icons'

type ReactionType = 'fire' | 'heart' | 'chefs_kiss'

const REACTIONS: Array<{ type: ReactionType; icon: React.ReactNode; label: string }> = [
  { type: 'fire', icon: <FlameIcon size={24} />, label: 'Fire' },
  { type: 'heart', icon: <HeartIcon size={24} />, label: 'Love' },
  { type: 'chefs_kiss', icon: <StarIcon size={24} />, label: "Chef's Kiss" },
]

interface Props {
  photoId: string
  sessionId: string
  existingReaction?: ReactionType | null
}

export default function ReactionPicker({ photoId, sessionId, existingReaction = null }: Props) {
  const [selected, setSelected] = useState<ReactionType | null>(existingReaction)
  const [loading, setLoading] = useState(false)

  async function react(reactionType: ReactionType) {
    if (loading) return
    setLoading(true)

    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/reaction`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ sessionId, toPhotoId: photoId, reactionType }),
        }
      )

      if (res.ok) setSelected(reactionType)
    } catch { /* silent */ } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      display: 'flex',
      gap: '0.5rem',
      justifyContent: 'center',
      marginTop: '0.75rem',
    }}>
      {REACTIONS.map(({ type, icon, label }) => (
        <button
          key={type}
          onClick={() => react(type)}
          disabled={loading}
          title={label}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'none',
            border: selected === type
              ? '1px solid rgba(212, 175, 55, 0.6)'
              : '1px solid transparent',
            borderRadius: '4px',
            cursor: loading ? 'default' : 'pointer',
            padding: '0.3rem 0.5rem',
            opacity: loading ? 0.5 : 1,
            transition: 'border-color 0.2s, opacity 0.2s',
            color: selected === type ? '#D4AF37' : '#F5F0E8',
          }}
        >
          {icon}
        </button>
      ))}
    </div>
  )
}
