import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params
  const courseFilter = req.nextUrl.searchParams.get('course')

  const supabase = createServiceClient()

  let query = supabase
    .from('photos')
    .select(`
      id,
      session_id,
      guest_id,
      course,
      storage_path,
      created_at,
      guests!inner(name)
    `)
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })

  if (courseFilter) {
    query = query.eq('course', courseFilter)
  }

  const { data: photoRows, error } = await query

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch photos' }, { status: 500 })
  }

  if (!photoRows) {
    return NextResponse.json({ photos: [] })
  }

  // Get reactions for these photos
  const photoIds = photoRows.map((p) => p.id)
  const { data: reactionRows } = await supabase
    .from('reactions')
    .select('to_photo_id, reaction_type')
    .in('to_photo_id', photoIds)

  const reactionsByPhoto: Record<string, string[]> = {}
  for (const r of reactionRows ?? []) {
    if (!reactionsByPhoto[r.to_photo_id]) reactionsByPhoto[r.to_photo_id] = []
    reactionsByPhoto[r.to_photo_id].push(r.reaction_type)
  }

  // Generate signed URLs (1 hour expiry)
  const photos = await Promise.all(
    photoRows.map(async (p) => {
      const { data: signedData } = await supabase.storage
        .from('cabana-photos')
        .createSignedUrl(p.storage_path, 3600)

      return {
        id: p.id,
        guest_id: p.guest_id,
        guest_name: (p.guests as unknown as { name: string }).name,
        course: p.course,
        signed_url: signedData?.signedUrl ?? '',
        reactions: reactionsByPhoto[p.id] ?? [],
        created_at: p.created_at,
      }
    })
  )

  return NextResponse.json({ photos })
}
