'use client'

import StageView from '@/components/stage/StageView'

const SESSION_ID = (process.env.NEXT_PUBLIC_SESSION_ID ?? '').trim()

export default function StagePage() {
  return <StageView sessionId={SESSION_ID} />
}
