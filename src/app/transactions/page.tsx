import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { formatCurrencyCents } from '@/lib/format'
import NewTransactionForm from '@/app/transactions/ui/NewTransactionForm'
import TransactionsFilters from './ui/TransactionsFilters'
import TransactionsTable from './ui/TransactionsTable'

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 25

type PageProps = { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }

export default async function TransactionsPage({ searchParams }: PageProps) {
  const sp = await searchParams
  const accountIdParam = typeof sp?.accountId === 'string' ? sp.accountId : undefined
  const categoryIdParam = typeof sp?.categoryId === 'string' ? sp.categoryId : undefined
  const type = typeof sp?.type === 'string' ? (sp.type as 'INCOME' | 'EXPENSE') : undefined
  const from = typeof sp?.from === 'string' ? new Date(sp.from) : undefined
  const to = typeof sp?.to === 'string' ? new Date(sp.to) : undefined
  const q = typeof sp?.q === 'string' ? sp.q.trim() : ''
  const pageParam = typeof sp?.page === 'string' ? Number(sp.page) : 1
  const page = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1

  const where: Prisma.TransactionWhereInput = {}
  if (accountIdParam) where.accountId = Number(accountIdParam)
  if (categoryIdParam) where.categoryId = Number(categoryIdParam)
  if (type) where.type = type
  if (from || to) {
    where.date = {}
    if (from) where.date.gte = from
    if (to) where.date.lte = to
  }
  if (q) {
    where.OR = [
      { note: { contains: q } },
      { category: { name: { contains: q } } },
    ]
  }

  const [totalCount, totalsByType] = await Promise.all([
    prisma.transaction.count({ where }),
    prisma.transaction.groupBy({
      by: ['type'],
      where,
      _sum: { amountCents: true },
    }),
  ])

  const incomeSum = totalsByType.find((g) => g.type === 'INCOME')?._sum.amountCents ?? 0
  const expenseSum = totalsByType.find((g) => g.type === 'EXPENSE')?._sum.amountCents ?? 0
  const net = incomeSum - expenseSum
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)

  const transactions = await prisma.transaction.findMany({
    where,
    orderBy: { date: 'desc' },
    include: { category: true, account: true },
    skip: (currentPage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  })
  const firstIdx = totalCount === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1
  const lastIdx = Math.min(currentPage * PAGE_SIZE, totalCount)

  const buildHref = (nextPage: number) => {
    const params = new URLSearchParams()
    if (accountIdParam) params.set('accountId', accountIdParam)
    if (categoryIdParam) params.set('categoryId', categoryIdParam)
    if (type) params.set('type', type)
    if (typeof sp?.from === 'string' && sp.from) params.set('from', sp.from)
    if (typeof sp?.to === 'string' && sp.to) params.set('to', sp.to)
    if (q) params.set('q', q)
    if (nextPage > 1) params.set('page', String(nextPage))
    const qs = params.toString()
    return qs ? `/transactions?${qs}` : '/transactions'
  }

  return (
    <div className="mx-auto max-w-4xl w-full py-6 px-2 space-y-6">
      <header className="space-y-2">
        <h1 className="h1">Transactions</h1>
        <p className="text-muted">Create and review your income and expenses.</p>
      </header>

      <section className="space-y-3">
        <div className="card p-4">
          <NewTransactionForm />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="card p-4">
            <div className="text-sm text-muted">Total Income</div>
            <div className="h2" style={{ color: 'var(--color-success)' }}>{formatCurrencyCents(incomeSum)}</div>
          </div>
          <div className="card p-4">
            <div className="text-sm text-muted">Total Expenses</div>
            <div className="h2" style={{ color: 'var(--color-error)' }}>{formatCurrencyCents(expenseSum)}</div>
          </div>
          <div className="card p-4">
            <div className="text-sm text-muted">Balance</div>
            <div className="h2" style={{ color: net >= 0 ? 'var(--color-success)' : 'var(--color-error)' }}>
              {formatCurrencyCents(net)}
            </div>
          </div>
        </div>
        <div className="card p-4">
          <TransactionsFilters />
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-baseline justify-between">
          <h2 className="h2">Recent</h2>
          <p className="text-sm text-muted">
            {totalCount === 0 ? 'No results' : `Showing ${firstIdx}–${lastIdx} of ${totalCount}`}
          </p>
        </div>
        <TransactionsTable transactions={transactions} />

        {totalPages > 1 && (
          <nav className="flex items-center justify-between gap-3 pt-2">
            {currentPage > 1 ? (
              <Link className="btn btn-secondary" href={buildHref(currentPage - 1)}>← Previous</Link>
            ) : (
              <span className="btn btn-secondary opacity-50 pointer-events-none" aria-disabled="true">← Previous</span>
            )}
            <span className="text-sm text-muted">Page {currentPage} of {totalPages}</span>
            {currentPage < totalPages ? (
              <Link className="btn btn-secondary" href={buildHref(currentPage + 1)}>Next →</Link>
            ) : (
              <span className="btn btn-secondary opacity-50 pointer-events-none" aria-disabled="true">Next →</span>
            )}
          </nav>
        )}
      </section>
    </div>
  )
}
