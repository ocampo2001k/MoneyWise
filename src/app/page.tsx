import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { formatCurrencyCents, formatDateYYYYMMDD } from '@/lib/format'

function accountTypeLabel(type: string) {
  if (type === 'CHEQUING') return 'Chequing'
  if (type === 'SAVINGS') return 'Savings'
  if (type === 'CREDIT_CARD') return 'Credit Card'
  return type
}

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const now = new Date()
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
  const nextMonthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1))

  const [monthTransactions, recent, accounts] = await Promise.all([
    prisma.transaction.findMany({
      where: { date: { gte: monthStart, lt: nextMonthStart } },
      include: { category: true },
    }),
    prisma.transaction.findMany({
      orderBy: { date: 'desc' },
      take: 5,
      include: { category: true, account: true },
    }),
    prisma.account.findMany({
      orderBy: { createdAt: 'asc' },
      include: { transactions: { select: { amountCents: true, type: true } } },
    }),
  ])

  const accountsWithBalance = accounts.map((acc) => {
    const income = acc.transactions.filter((t) => t.type === 'INCOME').reduce((s, t) => s + t.amountCents, 0)
    const expense = acc.transactions.filter((t) => t.type === 'EXPENSE').reduce((s, t) => s + t.amountCents, 0)
    const balanceCents = acc.type === 'CREDIT_CARD' ? expense - income : income - expense
    return { id: acc.id, name: acc.name, type: acc.type, balanceCents }
  })

  const totals = monthTransactions.reduce(
    (acc, t) => {
      if (t.type === 'INCOME') acc.income += t.amountCents
      else acc.expense += t.amountCents
      return acc
    },
    { income: 0, expense: 0 }
  )
  const net = totals.income - totals.expense

  const expenseByCategory = new Map<string, number>()
  for (const t of monthTransactions) {
    if (t.type !== 'EXPENSE') continue
    expenseByCategory.set(t.category.name, (expenseByCategory.get(t.category.name) ?? 0) + t.amountCents)
  }
  const topCategories = Array.from(expenseByCategory.entries())
    .map(([name, amountCents]) => ({ name, amountCents }))
    .sort((a, b) => b.amountCents - a.amountCents)
    .slice(0, 5)
  const topMax = topCategories[0]?.amountCents ?? 0

  const monthLabel = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })

  return (
    <div className="mx-auto max-w-5xl w-full py-6 px-2 space-y-6">
      <header className="space-y-2">
        <h1 className="h1">Dashboard</h1>
        <p className="text-muted">Overview for {monthLabel}.</p>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-4">
          <p className="text-muted text-sm">Income</p>
          <p className="h2 mt-1" style={{ color: 'var(--color-success)' }}>{formatCurrencyCents(totals.income)}</p>
        </div>
        <div className="card p-4">
          <p className="text-muted text-sm">Expenses</p>
          <p className="h2 mt-1" style={{ color: 'var(--color-error)' }}>{formatCurrencyCents(totals.expense)}</p>
        </div>
        <div className="card p-4">
          <p className="text-muted text-sm">Net balance</p>
          <p className="h2 mt-1" style={{ color: net >= 0 ? 'var(--color-success)' : 'var(--color-error)' }}>{formatCurrencyCents(net)}</p>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="h2">Account balances</h2>
          <Link className="text-sm" href="/accounts" style={{ color: 'var(--color-primary)' }}>Manage →</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {accountsWithBalance.map((acc) => {
            const isCreditCard = acc.type === 'CREDIT_CARD'
            const color = isCreditCard
              ? acc.balanceCents > 0 ? 'var(--color-error)' : 'var(--color-success)'
              : acc.balanceCents >= 0 ? 'var(--color-success)' : 'var(--color-error)'
            return (
              <div key={acc.id} className="card p-4">
                <p className="text-muted text-sm">{accountTypeLabel(acc.type)}</p>
                <p className="font-medium text-xs mb-1">{acc.name}</p>
                <p className="h2" style={{ color }}>{formatCurrencyCents(acc.balanceCents)}</p>
                {isCreditCard && <p className="text-muted text-xs mt-0.5">owed</p>}
              </div>
            )
          })}
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="h2">Recent transactions</h2>
            <Link className="text-sm" href="/transactions" style={{ color: 'var(--color-primary)' }}>View all →</Link>
          </div>
          {recent.length === 0 ? (
            <p className="text-muted">No transactions yet.</p>
          ) : (
            <ul className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
              {recent.map((t) => (
                <li key={t.id} className="py-2 grid grid-cols-[auto_1fr_auto] items-center gap-3 text-sm">
                  <span className="text-muted">{formatDateYYYYMMDD(t.date)}</span>
                  <span className="truncate">{t.category.name}{t.note ? ` — ${t.note}` : ''}</span>
                  <span className="font-medium" style={{ color: t.type === 'INCOME' ? 'var(--color-success)' : 'var(--color-error)' }}>
                    {t.type === 'INCOME' ? '+' : '−'}{formatCurrencyCents(t.amountCents)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="h2">Top expense categories</h2>
            <Link className="text-sm" href="/analytics" style={{ color: 'var(--color-primary)' }}>Analytics →</Link>
          </div>
          {topCategories.length === 0 ? (
            <p className="text-muted">No expenses this month.</p>
          ) : (
            <ul className="space-y-3">
              {topCategories.map((c) => {
                const pct = topMax ? Math.round((c.amountCents / topMax) * 100) : 0
                return (
                  <li key={c.name} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{c.name}</span>
                      <span className="font-medium">{formatCurrencyCents(c.amountCents)}</span>
                    </div>
                    <div className="h-2 rounded-full" style={{ backgroundColor: 'var(--color-border)' }}>
                      <div className="h-2 rounded-full" style={{ width: `${pct}%`, backgroundColor: 'var(--color-primary)' }} />
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </section>
    </div>
  )
}
