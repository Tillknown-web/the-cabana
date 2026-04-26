import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { sessionId, name } = await req.json()

    if (!sessionId || !name?.trim()) {
      return NextResponse.json({ error: 'Missing sessionId or name' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // Verify session exists
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('id')
      .eq('id', sessionId)
      .single()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Create guest record
    const guestId = crypto.randomUUID()
    const { error } = await supabase.from('guests').insert({
      id: guestId,
      session_id: sessionId,
      name: name.trim(),
      current_card: 'welcome',
    })

    if (error) {
      return NextResponse.json({ error: 'Failed to create guest' }, { status: 500 })
    }

    return NextResponse.json({ guestId })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
