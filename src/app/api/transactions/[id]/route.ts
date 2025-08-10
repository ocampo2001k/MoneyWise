import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type Params = { params: { id: string } }

export async function GET(_: Request, { params }: Params) {
  const id = Number(params.id)
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }
  const tx = await (prisma.transaction as any).findUnique({ where: { id }, include: { category: true } })
  if (!tx) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(tx)
}

export async function DELETE(_: Request, { params }: Params) {
  const id = Number(params.id)
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }
  try {
    await prisma.transaction.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}

export async function PUT(request: Request, { params }: Params) {
  const id = Number(params.id)
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }
  try {
    const body = await request.json()
    const { amountCents, categoryId, type, date, note } = body ?? {}
    if (
      (amountCents !== undefined && (!Number.isInteger(amountCents) || amountCents < 0)) ||
      (categoryId !== undefined && !Number.isInteger(categoryId)) ||
      (type !== undefined && type !== 'INCOME' && type !== 'EXPENSE') ||
      (date !== undefined && typeof date !== 'string') ||
      (note !== undefined && note !== null && typeof note !== 'string')
    ) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const updated = await (prisma.transaction as any).update({
      where: { id },
      data: {
        amountCents: amountCents ?? undefined,
        categoryId: categoryId ?? undefined,
        type: type ?? undefined,
        date: date ? new Date(date) : undefined,
        note: typeof note === 'string' ? note : note === null ? null : undefined,
      },
      include: { category: true },
    })
    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }
}


