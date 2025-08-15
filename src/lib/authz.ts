import { Role } from '@prisma/client'

export function requireRole(role: Role, userRole?: Role) {
  if (!userRole) throw new Error('Unauthorized')
  const order = [Role.RESIDENT, Role.ORG_ADMIN, Role.SUPERADMIN]
  if (order.indexOf(userRole) < order.indexOf(role)) throw new Error('Forbidden')
}


