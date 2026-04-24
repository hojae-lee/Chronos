import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

function makeClient() {
  const adapter = new PrismaLibSql({ url: 'file:./prisma/dev.db' })
  return new PrismaClient({ adapter })
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient
  userSeeded: boolean
}

export const db = globalForPrisma.prisma ?? makeClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

if (!globalForPrisma.userSeeded) {
  globalForPrisma.userSeeded = true
  db.user.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, name: 'Me' },
  }).catch(() => {})
}
