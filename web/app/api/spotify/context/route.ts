import { NextResponse } from 'next/server'
import { getNowPlayingContext } from '@/lib/spotify-server'
import type { SpotifyContext } from '@/lib/spotify-server'

let cached: { data: SpotifyContext; cachedAt: number } | null = null
const TTL_MS = 15000

export async function GET() {
  const now = Date.now()

  if (cached && now - cached.cachedAt < TTL_MS) {
    return NextResponse.json(cached.data)
  }

  const context = await getNowPlayingContext()

  if (!context) {
    return NextResponse.json({ playlist: null, queue: [] })
  }

  cached = { data: context, cachedAt: now }
  return NextResponse.json(context)
}
