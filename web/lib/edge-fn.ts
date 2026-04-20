const FN_BASE = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1`

export async function callEdgeFn(
  fnName: string,
  body: Record<string, unknown>,
  accessToken: string
): Promise<unknown> {
  const res = await fetch(`${FN_BASE}/${fnName}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)
  return data
}

export async function callEdgeFnGet(
  fnName: string,
  params: Record<string, string>,
  accessToken?: string
): Promise<unknown> {
  const url = new URL(`${FN_BASE}/${fnName}`)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  const headers: Record<string, string> = {}
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`
  const res = await fetch(url.toString(), { headers })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)
  return data
}
