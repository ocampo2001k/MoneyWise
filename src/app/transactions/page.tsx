import { prisma } from '@/lib/prisma'
import { formatCurrencyCents, formatDateYYYYMMDD } from '@/lib/format'
import NewTransactionForm from '@/app/transactions/ui/NewTransactionForm'
import TransactionsFilters from './ui/TransactionsFilters'
import TransactionsTable from './ui/TransactionsTable'

function formatAmountCents(amountCents: number): string {
  return formatCurrencyCents(amountCents)
}

type PageProps = { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }

export default async function TransactionsPage({ searchParams }: PageProps) {
  const sp = await searchParams
  const categoryIdParam = typeof sp?.categoryId === 'string' ? sp.categoryId : undefined
  const type = typeof sp?.type === 'string' ? (sp.type as 'INCOME' | 'EXPENSE') : undefined
  const from = typeof sp?.from === 'string' ? new Date(sp.from) : undefined
  const to = typeof sp?.to === 'string' ? new Date(sp.to) : undefined

  const where: any = {}
  if (categoryIdParam) where.categoryId = Number(categoryIdParam)
  if (type) where.type = type
  if (from || to) {
    where.date = {}
    if (from) where.date.gte = from
    if (to) where.date.lte = to
  }

  const transactions = await (prisma.transaction as any).findMany({
    where,
    orderBy: { date: 'desc' },
    include: { category: true },
  })

  const totals = (transactions as Array<any>).reduce(
    (acc: { income: number; expense: number; net: number }, t: any) => {
      if (t.type === 'INCOME') acc.income += t.amountCents
      else acc.expense += t.amountCents
      acc.net = acc.income - acc.expense
      return acc
    },
    { income: 0, expense: 0, net: 0 }
  )

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
            <div className="h2" style={{color: 'var(--color-success)'}}>{formatAmountCents(totals.income)}</div>
          </div>
          <div className="card p-4">
            <div className="text-sm text-muted">Total Expenses</div>
            <div className="h2" style={{color: 'var(--color-error)'}}>{formatAmountCents(totals.expense)}</div>
          </div>
          <div className="card p-4">
            <div className="text-sm text-muted">Balance</div>
            <div className="h2" style={{color: totals.net >= 0 ? 'var(--color-success)' : 'var(--color-error)'}}>
              {formatAmountCents(totals.net)}
            </div>
          </div>
        </div>
        <div className="card p-4">
          <TransactionsFilters />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="h2">Recent</h2>
        <TransactionsTable transactions={transactions} />
      </section>
    </div>
  )
}


