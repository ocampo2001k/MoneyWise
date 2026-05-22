import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { AccountCreateSchema, formatZodError } from '@/lib/schemas'

export async function GET() {
  const accounts = await prisma.account.findMany({
    orderBy: { createdAt: 'asc' },
    include: {
      transactions: { select: { amountCents: true, type: true } },
    },
  })

  const result = accounts.map((acc) => {
    const income = acc.transactions.filter((t) => t.type === 'INCOME').reduce((s, t) => s + t.amountCents, 0)
    const expense = acc.transactions.filter((t) => t.type === 'EXPENSE').reduce((s, t) => s + t.amountCents, 0)
    const balanceCents = acc.type === 'CREDIT_CARD' ? expense - income : income - expense
    return { id: acc.id, name: acc.name, type: acc.type, balanceCents }
  })

  return NextResponse.json(result)
}

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = AccountCreateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(formatZodError(parsed.error), { status: 400 })
  }

  const created = await prisma.account.create({ data: parsed.data })
  return NextResponse.json(created, { status: 201 })
}
