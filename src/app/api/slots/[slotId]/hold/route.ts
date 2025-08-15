import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createHold } from '@/server/booking'
import { limited } from '../_utils'

const Body = z.object({ qty: z.number().int().min(1), idempotencyKey: z.string().min(10) })

export async function POST(req: NextRequest, { params }: { params: Promise<{ slotId: string }> }) {
  const { slotId } = await params
  const rl = await limited(req, `hold:${slotId}`)
  if (rl) return rl
  const body = await req.json()
  const parsed = Body.safeParse(body)
  if (!parsed.success) return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 })
  try {
    // TODO: get userId from session; temp fake user for MVP wiring
    const userId = 'anon-user' // replace with auth session
    const data = await createHold({ slotId, userId, qty: parsed.data.qty, idempotencyKey: parsed.data.idempotencyKey })
    return NextResponse.json({ ok: true, data })
  } catch (e) {
    const err = e as { message: string; status?: number }
    const status = err.status || 500
    return NextResponse.json({ ok: false, error: err.message }, { status })
  }
}


