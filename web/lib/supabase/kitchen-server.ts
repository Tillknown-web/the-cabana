import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Server-only Supabase client scoped to the kitchen.
 * Reads/writes the 'sb-kitchen' cookie — the same name used by createKitchenClient()
 * in the browser — so kitchen API routes authenticate the kitchen user correctly
 * without touching the default Supabase auth cookie that experience guests use.
 */
export async function createKitchenServerClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: { name: 'sb-kitchen' },
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component context — cookie writes ignored safely
          }
        },
      },
    }
  )
}
