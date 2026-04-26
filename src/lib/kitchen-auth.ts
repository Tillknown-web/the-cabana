import { NextRequest } from 'next/server'

export function isKitchenAuthed(req: NextRequest): boolean {
  return req.cookies.get('cabana_kitchen')?.value === 'authenticated'
}
