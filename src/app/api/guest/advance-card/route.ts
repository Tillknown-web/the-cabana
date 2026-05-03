import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import type { CardId } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const { guestId, cardId } = await req.json()
    if (!guestId || !cardId) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const supabase = createServiceClient()

    const { error } = await supabase
      .from('guests')
      .update({ current_card: cardId as CardId })
      .eq('id', guestId)

    if (error) {
      return NextResponse.json({ error: 'Update failed' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
