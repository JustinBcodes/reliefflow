import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const org = await prisma.organization.upsert({
    where: { id: 'seed-org' },
    update: {},
    create: { id: 'seed-org', name: 'Relief Network' },
  })

  const [site1, site2] = await Promise.all([
    prisma.site.create({ data: { orgId: org.id, name: 'Downtown Hub', address: '100 Main St' } }),
    prisma.site.create({ data: { orgId: org.id, name: 'North Clinic', address: '500 North Ave' } }),
  ])

  const [water, food, med] = await Promise.all([
    prisma.resource.create({ data: { name: 'Water', unit: 'case' } }),
    prisma.resource.create({ data: { name: 'Food Kit', unit: 'kit' } }),
    prisma.resource.create({ data: { name: 'Med Kit', unit: 'kit' } }),
  ])

  const now = new Date()
  const todayStart = new Date(now)
  todayStart.setHours(9, 0, 0, 0)
  const todayEnd = new Date(now)
  todayEnd.setHours(17, 0, 0, 0)

  const tomorrowStart = new Date(todayStart)
  tomorrowStart.setDate(todayStart.getDate() + 1)
  const tomorrowEnd = new Date(todayEnd)
  tomorrowEnd.setDate(todayEnd.getDate() + 1)

  const capacities = [20, 40, 60]
  const resources = [water, food, med]
  const sites = [site1, site2]

  for (const site of sites) {
    for (const resource of resources) {
      for (const cap of capacities) {
        await prisma.slot.create({
          data: {
            siteId: site.id,
            resourceId: resource.id,
            startsAt: todayStart,
            endsAt: todayEnd,
            capacity: cap,
          },
        })
        await prisma.slot.create({
          data: {
            siteId: site.id,
            resourceId: resource.id,
            startsAt: tomorrowStart,
            endsAt: tomorrowEnd,
            capacity: cap,
          },
        })
      }
    }
  }

  const superPass = await bcrypt.hash('password123', 10)
  const adminPass = await bcrypt.hash('password123', 10)
  const residentPass = await bcrypt.hash('password123', 10)

  const superadmin = await prisma.user.create({
    data: { email: 'superadmin@local.test', role: Role.SUPERADMIN, passwordHash: superPass, name: 'Super Admin' },
  })
  const orgAdmin = await prisma.user.create({
    data: { email: 'orgadmin@local.test', role: Role.ORG_ADMIN, orgId: org.id, passwordHash: adminPass, name: 'Org Admin' },
  })
  const residents = await Promise.all([
    prisma.user.create({ data: { email: 'res1@local.test', role: Role.RESIDENT, passwordHash: residentPass, name: 'Res One' } }),
    prisma.user.create({ data: { email: 'res2@local.test', role: Role.RESIDENT, passwordHash: residentPass, name: 'Res Two' } }),
    prisma.user.create({ data: { email: 'res3@local.test', role: Role.RESIDENT, passwordHash: residentPass, name: 'Res Three' } }),
  ])

  console.log('Seeded users:')
  console.log('SUPERADMIN superadmin@local.test / password123')
  console.log('ORG_ADMIN orgadmin@local.test / password123')
  console.log('RESIDENTS res1@local.test,res2@local.test,res3@local.test / password123')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })


