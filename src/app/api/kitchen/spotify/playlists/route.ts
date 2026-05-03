import { NextRequest, NextResponse } from 'next/server'
import { isKitchenAuthed } from '@/lib/kitchen-auth'
import { getUserPlaylists } from '@/lib/spotify'

export async function GET(req: NextRequest) {
  if (!isKitchenAuthed(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const playlists = await getUserPlaylists()
  return NextResponse.json({ playlists })
}
