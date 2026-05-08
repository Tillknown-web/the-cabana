import { NextRequest, NextResponse } from 'next/server'
import { searchTracks } from '@/lib/spotify-server'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim()
  if (!q || q.length < 2) {
    return NextResponse.json({ tracks: [] })
  }

  const tracks = await searchTracks(q)
  return NextResponse.json({ tracks })
}
