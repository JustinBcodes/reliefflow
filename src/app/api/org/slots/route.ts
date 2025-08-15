import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const Body = z.object({
  siteId: z.string(),
  resourceId: z.string(),
  startsAt: z.string().transform((v) => new Date(v)),
  endsAt: z.string().transform((v) => new Date(v)),
  capacity: z.number().int().min(0),
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = Body.safeParse(body)
  if (!parsed.success) return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 })
  const created = await prisma.slot.create({ data: parsed.data })
  return NextResponse.json({ ok: true, data: created })
}


