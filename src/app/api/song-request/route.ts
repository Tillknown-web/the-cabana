import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { sessionId, guestId, songText } = await req.json()

    if (!sessionId || !guestId || !songText?.trim()) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const supabase = createServiceClient()

    const { error } = await supabase.from('song_requests').insert({
      id: crypto.randomUUID(),
      session_id: sessionId,
      guest_id: guestId,
      song_text: songText.trim().slice(0, 100),
      seen: false,
    })

    if (error) {
      return NextResponse.json({ error: 'Failed to save request' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
