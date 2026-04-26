import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { isKitchenAuthed } from '@/lib/kitchen-auth'

export async function GET(req: NextRequest) {
  if (!isKitchenAuthed(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const sessionId = req.nextUrl.searchParams.get('sessionId')
  if (!sessionId) return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 })

  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('song_requests')
    .select('*, guests!inner(name)')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: 'Failed' }, { status: 500 })

  return NextResponse.json({ requests: data ?? [] })
}
