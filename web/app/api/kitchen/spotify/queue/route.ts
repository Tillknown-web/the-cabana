import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { searchTracks, addToQueue } from '@/lib/spotify-server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.user_metadata?.role !== 'kitchen') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const trackUri: string | undefined = body.trackUri
  const songText: string | undefined = body.songText

  // If an explicit URI is given, queue it directly
  if (trackUri) {
    const ok = await addToQueue(trackUri)
    if (!ok) return NextResponse.json({ error: 'Spotify queue failed — is a device active?' }, { status: 502 })
    return NextResponse.json({ queued: true, via: 'uri' })
  }

  // Otherwise search and queue the top result
  if (!songText?.trim()) {
    return NextResponse.json({ error: 'Provide trackUri or songText' }, { status: 400 })
  }

  const tracks = await searchTracks(songText.trim())
  if (tracks.length === 0) {
    return NextResponse.json({ error: 'No Spotify results found' }, { status: 404 })
  }

  const top = tracks[0]
  const ok = await addToQueue(top.uri)
  if (!ok) return NextResponse.json({ error: 'Spotify queue failed — is a device active?' }, { status: 502 })

  return NextResponse.json({ queued: true, via: 'search', track: top })
}
