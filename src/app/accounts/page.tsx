import { prisma } from '@/lib/prisma'
import { formatCurrencyCents } from '@/lib/format'
import Link from 'next/link'
import AccountForm from './ui/AccountForm'
import AccountsTable from './ui/AccountsTable'

export const dynamic = 'force-dynamic'

export default async function AccountsPage() {
  const accounts = await prisma.account.findMany({
    orderBy: { createdAt: 'asc' },
    include: { transactions: { select: { amountCents: true, type: true } } },
  })

  const accountsWithBalance = accounts.map((acc) => {
    const income = acc.transactions.filter((t) => t.type === 'INCOME').reduce((s, t) => s + t.amountCents, 0)
    const expense = acc.transactions.filter((t) => t.type === 'EXPENSE').reduce((s, t) => s + t.amountCents, 0)
    const balanceCents = acc.type === 'CREDIT_CARD' ? expense - income : income - expense
    return { id: acc.id, name: acc.name, type: acc.type as 'CHEQUING' | 'SAVINGS' | 'CREDIT_CARD', balanceCents, txnCount: acc.transactions.length }
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

      <section className="card p-4">
        <h2 className="h2 mb-3">Add account</h2>
        <AccountForm />
      </section>

      <AccountsTable accounts={accountsWithBalance} />

      <section>
        <Link className="btn btn-secondary" href="/transactions">View all transactions →</Link>
      </section>
    </div>
  )
}
