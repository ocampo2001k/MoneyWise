import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type Params = { params: { id: string } }

export async function PUT(request: Request, { params }: Params) {
  const id = Number(params.id)
  if (!Number.isInteger(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  try {
    const body = await request.json()
    const { name, type } = body ?? {}
    if ((name !== undefined && typeof name !== 'string') || (type !== undefined && type !== 'INCOME' && type !== 'EXPENSE')) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }
    const updated = await prisma.category.update({ where: { id }, data: { name, type } })
    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }
}

export async function DELETE(_: Request, { params }: Params) {
  const id = Number(params.id)
  if (!Number.isInteger(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  try {
    await prisma.category.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}


