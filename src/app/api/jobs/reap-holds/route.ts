import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST() {
  const now = new Date()
  const expired = await prisma.reservationHold.findMany({ where: { expiresAt: { lte: now } } })
  await prisma.reservationHold.deleteMany({ where: { expiresAt: { lte: now } } })
  if (expired.length > 0) {
    await prisma.auditLog.create({ data: { action: 'holds.reaped', meta: { count: expired.length } } })
  }
  return NextResponse.json({ ok: true, reaped: expired.length })
}


