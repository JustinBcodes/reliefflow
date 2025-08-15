import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { confirmReservation } from '@/server/booking'
import { limited } from '../_utils'

const Body = z.object({ holdId: z.string(), idempotencyKey: z.string().min(10) })

export async function POST(req: NextRequest, { params }: { params: Promise<{ slotId: string }> }) {
  const { slotId } = await params
  const rl = await limited(req, `confirm:${slotId}`)
  if (rl) return rl
  const body = await req.json()
  const parsed = Body.safeParse(body)
  if (!parsed.success) return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 })
  try {
    const userId = 'anon-user'
    const data = await confirmReservation({ slotId, userId, holdId: parsed.data.holdId, idempotencyKey: parsed.data.idempotencyKey })
    return NextResponse.json({ ok: true, data })
  } catch (e) {
    const err = e as { message: string; status?: number }
    const status = err.status || 500
    return NextResponse.json({ ok: false, error: err.message }, { status })
  }
}


