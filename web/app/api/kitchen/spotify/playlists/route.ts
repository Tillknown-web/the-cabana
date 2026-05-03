import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserPlaylists } from '@/lib/spotify-server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.user_metadata?.role !== 'kitchen') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const playlists = await getUserPlaylists()
  return NextResponse.json({ playlists })
}
