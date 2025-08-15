import { NextRequest, NextResponse } from 'next/server'
import { nanoid } from 'nanoid'
import { rateLimit } from '@/lib/ratelimit'

export async function json<T>(req: NextRequest, body: T, status = 200) {
  const headers = new Headers()
  headers.set('X-Request-Id', nanoid())
  return new NextResponse(JSON.stringify({ ok: status < 400, data: body }), { status, headers })
}

export async function limited(req: NextRequest, key: string, limit = 60, windowSec = 60) {
  const ip = req.headers.get('x-forwarded-for') || 'local'
  const allowed = await rateLimit(`${key}:${ip}`, limit, windowSec)
  if (!allowed) return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 })
  return null
}


