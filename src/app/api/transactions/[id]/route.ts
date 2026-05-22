import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { TransactionUpdateSchema, formatZodError } from '@/lib/schemas'

type Params = { params: Promise<{ id: string }> }

export async function GET(_: Request, { params }: Params) {
  const { id: idParam } = await params
  const id = Number(idParam)
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }
  const tx = await prisma.transaction.findUnique({ where: { id }, include: { category: true } })
  if (!tx) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(tx)
}

export async function DELETE(_: Request, { params }: Params) {
  const { id: idParam } = await params
  const id = Number(idParam)
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
  const { id: idParam } = await params
  const id = Number(idParam)
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = TransactionUpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(formatZodError(parsed.error), { status: 400 })
  }

  try {
    const updated = await prisma.transaction.update({
      where: { id },
      data: {
        amountCents: parsed.data.amountCents,
        categoryId: parsed.data.categoryId,
        accountId: parsed.data.accountId,
        type: parsed.data.type,
        date: parsed.data.date,
        note: parsed.data.note,
        externalId: parsed.data.externalId,
      },
      include: { category: true, account: true },
    })
    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}
