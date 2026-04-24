import path from 'node:path'
import { defineConfig } from 'prisma/config'

const dbPath = path.join(__dirname, 'prisma/dev.db')

export default defineConfig({
  earlyAccess: true,
  schema: path.join(__dirname, 'prisma/schema.prisma'),
  datasource: {
    url: `file:${dbPath}`,
  },
  migrate: {
    async adapter() {
      const { PrismaLibSql } = await import('@prisma/adapter-libsql')
      const { createClient } = await import('@libsql/client')
      const client = createClient({ url: `file:${dbPath}` })
      return new PrismaLibSql(client)
    },
  },
})
