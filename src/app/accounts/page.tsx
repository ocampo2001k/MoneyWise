import { prisma } from '@/lib/prisma'
import { formatCurrencyCents } from '@/lib/format'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

function accountTypeLabel(type: string) {
  if (type === 'CHEQUING') return 'Chequing'
  if (type === 'SAVINGS') return 'Savings'
  if (type === 'CREDIT_CARD') return 'Credit Card'
  return type
}

export default async function AccountsPage() {
  const accounts = await prisma.account.findMany({
    orderBy: { createdAt: 'asc' },
    include: { transactions: { select: { amountCents: true, type: true } } },
  })

  const accountsWithBalance = accounts.map((acc) => {
    const income = acc.transactions.filter((t) => t.type === 'INCOME').reduce((s, t) => s + t.amountCents, 0)
    const expense = acc.transactions.filter((t) => t.type === 'EXPENSE').reduce((s, t) => s + t.amountCents, 0)
    const balanceCents = acc.type === 'CREDIT_CARD' ? expense - income : income - expense
    return { id: acc.id, name: acc.name, type: acc.type, balanceCents, txnCount: acc.transactions.length }
  })

  const totalAssets = accountsWithBalance
    .filter((a) => a.type !== 'CREDIT_CARD')
    .reduce((s, a) => s + a.balanceCents, 0)
  const totalOwed = accountsWithBalance
    .filter((a) => a.type === 'CREDIT_CARD')
    .reduce((s, a) => s + a.balanceCents, 0)
  const netWorth = totalAssets - totalOwed

  return (
    <div className="mx-auto max-w-3xl w-full py-6 px-2 space-y-6">
      <header className="space-y-2">
        <h1 className="h1">Accounts</h1>
        <p className="text-muted">Your account balances and net worth.</p>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-4">
          <p className="text-muted text-sm">Total Assets</p>
          <p className="h2 mt-1" style={{ color: 'var(--color-success)' }}>{formatCurrencyCents(totalAssets)}</p>
        </div>
        <div className="card p-4">
          <p className="text-muted text-sm">Total Owed</p>
          <p className="h2 mt-1" style={{ color: 'var(--color-error)' }}>{formatCurrencyCents(totalOwed)}</p>
        </div>
        <div className="card p-4">
          <p className="text-muted text-sm">Net Worth</p>
          <p className="h2 mt-1" style={{ color: netWorth >= 0 ? 'var(--color-success)' : 'var(--color-error)' }}>
            {formatCurrencyCents(netWorth)}
          </p>
        </div>
      </section>

      <section className="space-y-3">
        {accountsWithBalance.map((acc) => {
          const isCreditCard = acc.type === 'CREDIT_CARD'
          const balanceColor = isCreditCard
            ? acc.balanceCents > 0 ? 'var(--color-error)' : 'var(--color-success)'
            : acc.balanceCents >= 0 ? 'var(--color-success)' : 'var(--color-error)'
          return (
            <div key={acc.id} className="card p-5 flex items-center justify-between gap-4">
              <div>
                <p className="font-medium">{acc.name}</p>
                <p className="text-muted text-sm">{accountTypeLabel(acc.type)} · {acc.txnCount} transactions</p>
              </div>
              <div className="text-right">
                <p className="h2" style={{ color: balanceColor }}>{formatCurrencyCents(acc.balanceCents)}</p>
                <p className="text-muted text-xs">{isCreditCard ? 'owed' : 'available'}</p>
              </div>
            </div>
          )
        })}
      </section>

      <section>
        <Link className="btn btn-secondary" href="/transactions">View all transactions →</Link>
      </section>
    </div>
  )
}
