import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const transactions = await (prisma.transaction as any).findMany({
    orderBy: { date: 'desc' },
    include: { category: true },
  })
  return NextResponse.json(transactions)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const { amountCents, categoryId, type, date, note } = body ?? {}

    if (
      typeof amountCents !== 'number' ||
      !Number.isInteger(amountCents) ||
      !Number.isInteger(categoryId) ||
      (type !== 'INCOME' && type !== 'EXPENSE') ||
      typeof date !== 'string'
    ) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const created = await (prisma.transaction as any).create({
      data: {
        amountCents,
        categoryId,
        type,
        date: new Date(date),
        note: typeof note === 'string' ? note : null,
      },
      include: { category: true },
    })

    return NextResponse.json(created, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }
}