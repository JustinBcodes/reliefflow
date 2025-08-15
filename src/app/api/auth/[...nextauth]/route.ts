import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { Role } from '@prisma/client'

const handler = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: { email: { label: 'Email', type: 'text' }, password: { label: 'Password', type: 'password' } },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const user = await prisma.user.findUnique({ where: { email: credentials.email } })
        if (!user?.passwordHash) return null
        const ok = await bcrypt.compare(credentials.password, user.passwordHash)
        if (!ok) return null
        return { id: user.id, name: user.name, email: user.email, role: user.role, orgId: user.orgId }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as { role?: Role; orgId?: string | null }
        ;(token as Record<string, unknown>).role = u.role ?? Role.RESIDENT
        ;(token as Record<string, unknown>).orgId = u.orgId ?? null
      }
      return token
    },
    async session({ session, token }) {
      ;(session.user as Record<string, unknown>).role = (token as Record<string, unknown>).role as Role
      ;(session.user as Record<string, unknown>).orgId = (token as Record<string, unknown>).orgId ?? null
      return session
    },
  },
})

export { handler as GET, handler as POST }


