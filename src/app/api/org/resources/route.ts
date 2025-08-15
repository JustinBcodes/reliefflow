import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const Body = z.object({ name: z.string().min(1), unit: z.string().min(1) })

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = Body.safeParse(body)
  if (!parsed.success) return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 })
  const created = await prisma.resource.create({ data: parsed.data })
  return NextResponse.json({ ok: true, data: created })
}


