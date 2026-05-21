import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { TransactionImportSchema, formatZodError } from '@/lib/schemas'

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = TransactionImportSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(formatZodError(parsed.error), { status: 400 })
  }

  let imported = 0
  let skipped = 0

  for (const row of parsed.data) {
    try {
      await prisma.transaction.create({
        data: {
          amountCents: row.amountCents,
          categoryId: row.categoryId,
          type: row.type,
          date: row.date,
          note: row.note ?? null,
          externalId: row.externalId,
        },
      })
      imported++
    } catch (e: unknown) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        skipped++
      } else {
        throw e
      }
    }
  }

  return NextResponse.json({ imported, skipped })
}
