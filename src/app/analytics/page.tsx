import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { formatCurrencyCents } from '@/lib/format'
import AnalyticsFilters from '@/app/analytics/ui/AnalyticsFilters'
import DonutChart from '@/app/analytics/ui/DonutChart'

type PageProps = { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }

export default async function AnalyticsPage({ searchParams }: PageProps) {
  const sp = await searchParams
  const typeFilter = typeof sp?.type === 'string' ? sp.type as 'INCOME' | 'EXPENSE' | 'ALL' : 'ALL'
  const from = typeof sp?.from === 'string' && sp.from ? new Date(sp.from) : undefined
  const to = typeof sp?.to === 'string' && sp.to ? new Date(sp.to) : undefined

  const where: Prisma.TransactionWhereInput = {}
  if (typeFilter && typeFilter !== 'ALL') where.type = typeFilter
  if (from || to) {
    where.date = {}
    if (from) where.date.gte = from
    if (to) where.date.lte = to
  }

  const transactions = await prisma.transaction.findMany({
    where,
    include: { category: true },
  })

  const totalsByCategory = new Map<number, { name: string, type: 'INCOME' | 'EXPENSE', amountCents: number }>()
  for (const t of transactions) {
    const key = t.category.id as number
    const prev = totalsByCategory.get(key)
    const nextAmount = (prev?.amountCents ?? 0) + t.amountCents
    totalsByCategory.set(key, { name: t.category.name, type: t.type, amountCents: nextAmount })
  }

  const data = Array.from(totalsByCategory.values())
    .sort((a, b) => b.amountCents - a.amountCents)

  const total = data.reduce((sum, d) => sum + d.amountCents, 0)

  const chartData = data.map((d, idx) => ({
    label: d.name,
    value: d.amountCents,
    percent: total ? (d.amountCents / total) * 100 : 0,
    // simple palette cycling
    color: PALETTE[idx % PALETTE.length],
  }))

  return (
    <div className="mx-auto max-w-4xl w-full py-6 px-2 space-y-6">
      <header className="space-y-2">
        <h1 className="h1">Analytics</h1>
        <p className="text-muted">Category breakdown and percentages{typeFilter && typeFilter !== 'ALL' ? ` • ${typeFilter}` : ''}{from || to ? ' • filtered by date' : ''}.</p>
      </header>

      <section className="card p-4">
        <AnalyticsFilters />
      </section>

      <section className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-6 items-start">
        <div className="card p-4 flex items-center justify-center">
          <DonutChart segments={chartData} size={240} thickness={36} centerLabel={total ? formatCurrencyCents(total) : '$0.00'} />
        </div>
        <div className="card p-4">
          <h2 className="h2 mb-4">By category</h2>
          <div className="space-y-3">
            {chartData.length === 0 ? (
              <p className="text-muted">No data for the selected filters.</p>
            ) : (
              chartData.map((d) => (
                <div key={d.label} className="grid grid-cols-[16px_1fr_auto_auto] gap-3 items-center">
                  <span className="h-3 w-3 rounded-full" style={{backgroundColor: d.color}} />
                  <span>{d.label}</span>
                  <span className="text-muted">{d.percent.toFixed(1)}%</span>
                  <span className="font-medium">{formatCurrencyCents(d.value)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

const PALETTE = [
  '#4CAF50',
  '#FFC107',
  '#42A5F5',
  '#AB47BC',
  '#EF5350',
  '#26A69A',
  '#FF7043',
  '#7E57C2',
  '#66BB6A',
  '#29B6F6',
]


