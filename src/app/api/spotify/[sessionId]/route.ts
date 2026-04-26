import { NextRequest, NextResponse } from 'next/server'
import { getNowPlaying } from '@/lib/spotify'

// Simple in-memory cache (process-level, resets on cold start)
let cached: { data: unknown; cachedAt: number } | null = null
const TTL_MS = 15000

export async function GET(
  _req: NextRequest,
  { params: _params }: { params: Promise<{ sessionId: string }> }
) {
  const now = Date.now()

  if (cached && now - cached.cachedAt < TTL_MS) {
    return NextResponse.json(cached.data)
  }

  const track = await getNowPlaying()

  if (!track) {
    return NextResponse.json(null)
  }

  cached = { data: track, cachedAt: now }
  return NextResponse.json(track)
}
