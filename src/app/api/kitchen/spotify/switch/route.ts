import { NextRequest, NextResponse } from 'next/server'
import { isKitchenAuthed } from '@/lib/kitchen-auth'
import { switchPlaylist } from '@/lib/spotify'

export async function POST(req: NextRequest) {
  if (!isKitchenAuthed(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { playlistId } = body as { playlistId?: string }

  if (!playlistId) {
    return NextResponse.json({ error: 'playlistId is required' }, { status: 400 })
  }

  const ok = await switchPlaylist(playlistId)
  if (!ok) {
    return NextResponse.json(
      { error: 'Failed to switch playlist. Ensure the Spotify token has user-modify-playback-state scope and a device is active.' },
      { status: 502 }
    )
  }

  return NextResponse.json({ ok: true })
}
