import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { TransactionCreateSchema, formatZodError } from '@/lib/schemas'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const accountId = searchParams.get('accountId')
  const transactions = await prisma.transaction.findMany({
    where: accountId ? { accountId: Number(accountId) } : undefined,
    orderBy: { date: 'desc' },
    include: { category: true, account: true },
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
      accountId: parsed.data.accountId ?? null,
      type: parsed.data.type,
      date: parsed.data.date,
      note: parsed.data.note ?? null,
      externalId: parsed.data.externalId ?? null,
    },
    include: { category: true, account: true },
  })

  return NextResponse.json(created, { status: 201 })
}
