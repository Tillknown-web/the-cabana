import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { isKitchenAuthed } from '@/lib/kitchen-auth'

export async function POST(req: NextRequest) {
  if (!isKitchenAuthed(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { requestId } = await req.json()
    const supabase = createServiceClient()

    const { error } = await supabase
      .from('song_requests')
      .update({ seen: true })
      .eq('id', requestId)

    if (error) return NextResponse.json({ error: 'Update failed' }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
