import { NextRequest, NextResponse } from 'next/server'
import { cancelReservation } from '@/server/booking'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const userId = 'anon-user'
    const data = await cancelReservation({ reservationId: id, userId })
    return NextResponse.json({ ok: true, data })
  } catch (e) {
    const err = e as { message: string; status?: number }
    const status = err.status || 500
    return NextResponse.json({ ok: false, error: err.message }, { status })
  }
}


