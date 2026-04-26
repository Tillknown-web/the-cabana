import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { sessionId, fromGuestId, toPhotoId, reactionType } = await req.json()

    if (!sessionId || !fromGuestId || !toPhotoId || !reactionType) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const supabase = createServiceClient()

    const { error } = await supabase.from('reactions').upsert({
      id: crypto.randomUUID(),
      session_id: sessionId,
      from_guest_id: fromGuestId,
      to_photo_id: toPhotoId,
      reaction_type: reactionType,
    }, { onConflict: 'from_guest_id,to_photo_id' })

    if (error) {
      return NextResponse.json({ error: 'Failed to save reaction' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
