import { NextResponse } from 'next/server'
import { createKitchenServerClient } from '@/lib/supabase/kitchen-server'
import { getUserPlaylists } from '@/lib/spotify-server'

export async function GET() {
  const supabase = await createKitchenServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.user_metadata?.role !== 'kitchen') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const playlists = await getUserPlaylists()
  return NextResponse.json({ playlists })
}
