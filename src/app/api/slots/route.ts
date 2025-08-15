import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const siteId = searchParams.get('siteId') || undefined
  const resourceId = searchParams.get('resourceId') || undefined
  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const where: Record<string, unknown> = {}
  if (siteId) where.siteId = siteId
  if (resourceId) where.resourceId = resourceId
  if (from || to) where.startsAt = {}
  if (from) (where.startsAt as Record<string, unknown>).gte = new Date(from!)
  if (to) (where as Record<string, unknown>).endsAt = { lte: new Date(to!) }
  const slots = await prisma.slot.findMany({ where, orderBy: { startsAt: 'asc' } })
  const data = slots.map((s) => ({ ...s, remaining: s.capacity - s.reservedCount }))
  return NextResponse.json({ ok: true, data })
}


