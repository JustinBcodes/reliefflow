import { prisma } from '@/lib/prisma'
import { withLock } from '@/lib/lock'
import { ResStatus } from '@prisma/client'

export async function createHold(params: { slotId: string; userId: string; qty: number; idempotencyKey: string }) {
  const { slotId, userId, qty, idempotencyKey } = params
  const lockKey = `lock:slot:${slotId}`
  return withLock(lockKey, 3000, async () => {
    return await prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe('SET TRANSACTION ISOLATION LEVEL SERIALIZABLE')
      const rows = await tx.$queryRawUnsafe<Array<{ capacity: number; reservedCount: number }>>(
        `SELECT "capacity","reservedCount" FROM "Slot" WHERE id = $1 FOR UPDATE`,
        slotId,
      )
      if (rows.length === 0) throw new Error('Slot not found')
      const slot = rows[0]
      if (slot.reservedCount + qty > slot.capacity) {
        const err = new Error('Capacity exceeded') as Error & { status?: number }
        err.status = 409
        throw err
      }
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000)
      const hold = await tx.reservationHold.upsert({
        where: { idempotencyKey },
        update: { qty, slotId, userId, expiresAt },
        create: { idempotencyKey, qty, slotId, userId, expiresAt },
      })
      return { holdId: hold.id, expiresAt }
    })
  })
}

export async function confirmReservation(params: { slotId: string; userId: string; holdId: string; idempotencyKey: string }) {
  const { slotId, userId, holdId } = params
  const lockKey = `lock:slot:${slotId}`
  return withLock(lockKey, 3000, async () => {
    return await prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe('SET TRANSACTION ISOLATION LEVEL SERIALIZABLE')
      const hold = await tx.reservationHold.findUnique({ where: { id: holdId } })
      if (!hold || hold.slotId !== slotId || hold.userId !== userId) throw new Error('Invalid hold')
      if (hold.expiresAt.getTime() <= Date.now()) throw new Error('Hold expired')
      const rows = await tx.$queryRawUnsafe<Array<{ capacity: number; reservedCount: number }>>(
        `SELECT "capacity","reservedCount" FROM "Slot" WHERE id = $1 FOR UPDATE`,
        slotId,
      )
      if (rows.length === 0) throw new Error('Slot not found')
      const slot = rows[0]
      if (slot.reservedCount + hold.qty > slot.capacity) {
        const err = new Error('Capacity exceeded') as Error & { status?: number }
        err.status = 409
        throw err
      }
      await tx.slot.update({ where: { id: slotId }, data: { reservedCount: slot.reservedCount + hold.qty } })
      const res = await tx.reservation.create({
        data: { slotId, userId, qty: hold.qty, status: ResStatus.CONFIRMED },
      })
      await tx.reservationHold.delete({ where: { id: hold.id } })
      await tx.auditLog.create({ data: { actorId: userId, action: 'reservation.confirm', target: res.id } })
      return { reservationId: res.id }
    })
  })
}

export async function cancelReservation(params: { reservationId: string; userId: string }) {
  const { reservationId, userId } = params
  return prisma.$transaction(async (tx) => {
    await tx.$executeRawUnsafe('SET TRANSACTION ISOLATION LEVEL SERIALIZABLE')
    const res = await tx.reservation.findUnique({ where: { id: reservationId } })
    if (!res || res.userId !== userId) throw new Error('Not found')
    const slot = await tx.slot.findUnique({ where: { id: res.slotId } })
    if (!slot) throw new Error('Slot not found')
    await tx.slot.update({
      where: { id: slot.id },
      data: { reservedCount: Math.max(0, slot.reservedCount - res.qty) },
    })
    await tx.reservation.update({ where: { id: reservationId }, data: { status: ResStatus.CANCELLED } })
    await tx.auditLog.create({ data: { actorId: userId, action: 'reservation.cancel', target: reservationId } })
    return { ok: true }
  })
}


