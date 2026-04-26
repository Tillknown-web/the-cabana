import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { isKitchenAuthed } from '@/lib/kitchen-auth'

export async function POST(req: NextRequest) {
  if (!isKitchenAuthed(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { sessionId, trigger } = await req.json()

    if (!sessionId || !trigger) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // We store this as a special chef note so realtime broadcasts it
    // The experience page looks for chef_notes with the trigger prefix
    const { error } = await supabase.from('chef_notes').insert({
      id: crypto.randomUUID(),
      session_id: sessionId,
      message: `__tableside:${trigger}`,
    })

    if (error) {
      return NextResponse.json({ error: 'Failed to fire trigger' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
