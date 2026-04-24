import type { Prisma } from '@prisma/client'
import { db } from '@/lib/db'

export const eventRepository = {
  findByRange: (userId: number, start: Date, end: Date) =>
    db.event.findMany({
      where: { userId, startAt: { gte: start, lte: end } },
      include: { photos: true },
      orderBy: { startAt: 'asc' },
    }),

  findAllForContext: (userId: number) =>
    db.event.findMany({
      where: { userId },
      select: { id: true, title: true, startAt: true, endAt: true, isAllDay: true },
      orderBy: { startAt: 'asc' },
    }),

  findActiveByMonth: (userId: number, start: Date, end: Date) =>
    db.event.findMany({
      where: { userId, status: 'active', startAt: { gte: start, lte: end } },
      orderBy: { startAt: 'asc' },
    }),

  findByTitleSearch: (userId: number, query: string) =>
    db.event.findMany({
      where: { userId, title: { contains: query } },
      include: { photos: true },
      orderBy: { startAt: 'asc' },
      take: 5,
    }),

  findById: (id: number) =>
    db.event.findUnique({ where: { id }, include: { photos: true } }),

  findByIdRaw: (id: number) =>
    db.event.findUnique({ where: { id } }),

  create: (data: Prisma.EventUncheckedCreateInput) =>
    db.event.create({ data, include: { photos: true } }),

  update: (id: number, data: Prisma.EventUncheckedUpdateInput) =>
    db.event.update({ where: { id }, data, include: { photos: true } }),

  delete: (id: number) => db.event.delete({ where: { id } }),

  cancel: (id: number) =>
    db.event.update({ where: { id }, data: { status: 'cancelled' }, include: { photos: true } }),

  setShareToken: (id: number, shareToken: string) =>
    db.event.update({ where: { id }, data: { shareToken } }),

  upsertRetrospective: (userId: number, year: number, month: number, content: string, summary: string) =>
    db.retrospective.upsert({
      where: { userId_year_month: { userId, year, month } },
      update: { content, summary },
      create: { userId, year, month, content, summary },
    }),
}
