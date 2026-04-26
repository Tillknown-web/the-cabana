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

  const [sessionResult, guestsResult, notesResult, songsResult, photosResult] = await Promise.all([
    supabase.from('sessions').select('*').eq('id', sessionId).single(),
    supabase.from('guests').select('*').eq('session_id', sessionId).order('checked_in_at'),
    supabase
      .from('chef_notes')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(20),
    supabase
      .from('song_requests')
      .select('*, guests!inner(name)')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false }),
    supabase.from('photos').select('guest_id, course').eq('session_id', sessionId),
  ])

  // Build photo status map: guestId -> Set of submitted courses
  const photosByGuest: Record<string, Set<string>> = {}
  for (const p of photosResult.data ?? []) {
    if (!photosByGuest[p.guest_id]) photosByGuest[p.guest_id] = new Set()
    photosByGuest[p.guest_id].add(p.course)
  }

  const guests = (guestsResult.data ?? []).map((g) => ({
    ...g,
    submittedCourses: [...(photosByGuest[g.id] ?? [])],
  }))

  return NextResponse.json({
    session: sessionResult.data,
    guests,
    notes: notesResult.data ?? [],
    songRequests: songsResult.data ?? [],
  })
}
