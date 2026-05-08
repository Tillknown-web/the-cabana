import { NextResponse } from 'next/server'

const SCOPES = [
  'user-read-currently-playing',
  'user-read-playback-state',
  'playlist-read-private',
  'playlist-read-collaborative',
  'user-modify-playback-state',
].join(' ')

const REDIRECT_URI = 'https://the-cabana-henna.vercel.app/api/auth/spotify/callback'

export async function GET() {
  const clientId = process.env.SPOTIFY_CLIENT_ID

  if (!clientId) {
    return new NextResponse(
      `<html><body style="font-family:monospace;padding:40px;background:#0f0f14;color:#e0e0e0">
        <h2 style="color:#f87171">Missing SPOTIFY_CLIENT_ID</h2>
        <p>Add <code style="color:#A8C5DA">SPOTIFY_CLIENT_ID</code> to your <code>.env.local</code> and Vercel environment variables first.</p>
        <p style="color:#888;margin-top:1rem">Get it from <a href="https://developer.spotify.com/dashboard" style="color:#D4AF37">developer.spotify.com/dashboard</a> → your app → Settings.</p>
      </body></html>`,
      { headers: { 'Content-Type': 'text/html' } }
    )
  }

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    scope: SCOPES,
  })

  return NextResponse.redirect(
    `https://accounts.spotify.com/authorize?${params.toString()}`
  )
}
