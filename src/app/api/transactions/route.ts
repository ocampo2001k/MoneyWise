import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { TransactionCreateSchema, formatZodError } from '@/lib/schemas'

export async function GET() {
  const transactions = await prisma.transaction.findMany({
    orderBy: { date: 'desc' },
    include: { category: true },
  })
  return NextResponse.json(transactions)
}

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = TransactionCreateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(formatZodError(parsed.error), { status: 400 })
  }

  const created = await prisma.transaction.create({
    data: {
      amountCents: parsed.data.amountCents,
      categoryId: parsed.data.categoryId,
      type: parsed.data.type,
      date: parsed.data.date,
      note: parsed.data.note ?? null,
      externalId: parsed.data.externalId ?? null,
    },
    include: { category: true },
  })

  return NextResponse.json(created, { status: 201 })
}
