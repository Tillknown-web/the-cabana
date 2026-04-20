import { createUserClient } from './supabase-client.ts'
import { errorResponse } from './cors.ts'

/**
 * Verifies the request is from the authenticated kitchen user.
 * Returns null if valid, or an error Response if not.
 */
export async function requireKitchenAuth(req: Request): Promise<Response | null> {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return errorResponse('Missing authorization header', 401)
  }

  const client = createUserClient(authHeader)
  const { data: { user }, error } = await client.auth.getUser()

  if (error || !user) {
    return errorResponse('Invalid or expired token', 401)
  }

  if (user.user_metadata?.role !== 'kitchen') {
    return errorResponse('Forbidden — kitchen access only', 403)
  }

  return null
}
