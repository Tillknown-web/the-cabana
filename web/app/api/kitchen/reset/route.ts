import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

const SESSION_ID = process.env.NEXT_PUBLIC_SESSION_ID!

function serviceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('Server misconfigured: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set')
  }
  return createClient(url, key)
}

/**
 * POST /api/kitchen/reset
 * Resets the session back to the beginning:
 *   - session_state → current_card: 'welcome', released_cards: []
 *   - Deletes active countdowns
 *   - Deletes tableside_triggers for the session
 */
export async function POST() {
  try {
    // Verify the caller is a signed-in kitchen user
    const authClient = await createServerClient()
    const { data: { user } } = await authClient.auth.getUser()
    if (!user || user.user_metadata?.role !== 'kitchen') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = serviceClient()

    // Ensure the session row exists (idempotent). Required so that the
    // session_state FK is satisfied even if the seed was never run.
    const today = new Date().toISOString().split('T')[0]
    await supabase
      .from('sessions')
      .upsert({ session_id: SESSION_ID, event_date: today }, { onConflict: 'session_id', ignoreDuplicates: true })

    // Reset (or initialise) session state via upsert so the row is created
    // if it was never seeded, not just updated.
    const { error: stateError } = await supabase
      .from('session_state')
      .upsert({
        session_id: SESSION_ID,
        current_card: 'welcome',
        released_cards: [],
        updated_at: new Date().toISOString(),
      }, { onConflict: 'session_id' })

    if (stateError) throw new Error(stateError.message)

    // Clear countdowns
    await supabase.from('countdowns').delete().eq('session_id', SESSION_ID)

    // Clear tableside triggers
    await supabase.from('tableside_triggers').delete().eq('session_id', SESSION_ID)

    // Clear guests — cascades to photos, reactions, and song_requests via FK
    await supabase.from('guests').delete().eq('session_id', SESSION_ID)

    // Clear chef notes
    await supabase.from('chef_notes').delete().eq('session_id', SESSION_ID)

    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
