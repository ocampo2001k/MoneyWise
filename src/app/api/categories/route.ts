import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } })
  return NextResponse.json(categories)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, type } = body ?? {}
    if (typeof name !== 'string' || (type !== 'INCOME' && type !== 'EXPENSE')) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }
    const created = await prisma.category.create({ data: { name, type } })
    return NextResponse.json(created, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }
}


