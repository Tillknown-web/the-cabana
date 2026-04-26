import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { isKitchenAuthed } from '@/lib/kitchen-auth'

export async function POST(req: NextRequest) {
  if (!isKitchenAuthed(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { sessionId, cardId, minutes } = await req.json()

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 })
    }

    const supabase = createServiceClient()

    if (!cardId || !minutes) {
      // Cancel countdown
      const { error } = await supabase
        .from('sessions')
        .update({ countdown_card: null, countdown_expires_at: null })
        .eq('id', sessionId)

      if (error) return NextResponse.json({ error: 'Update failed' }, { status: 500 })
      return NextResponse.json({ ok: true, cancelled: true })
    }

    const expiresAt = new Date(Date.now() + minutes * 60 * 1000).toISOString()

    const { error } = await supabase
      .from('sessions')
      .update({ countdown_card: cardId, countdown_expires_at: expiresAt })
      .eq('id', sessionId)

    if (error) {
      return NextResponse.json({ error: 'Update failed' }, { status: 500 })
    }

    return NextResponse.json({ ok: true, expiresAt })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
