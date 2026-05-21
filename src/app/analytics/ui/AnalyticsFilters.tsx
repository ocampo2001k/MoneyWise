'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function AnalyticsFilters() {
  const router = useRouter()
  const params = useSearchParams()
  const [type, setType] = useState<string>(params.get('type') ?? 'ALL')
  const [from, setFrom] = useState<string>(params.get('from') ?? '')
  const [to, setTo] = useState<string>(params.get('to') ?? '')

  useEffect(() => {
    setType(params.get('type') ?? 'ALL')
    setFrom(params.get('from') ?? '')
    setTo(params.get('to') ?? '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.toString()])

  const apply = () => {
    const qs = new URLSearchParams()
    if (type && type !== 'ALL') qs.set('type', type)
    if (from) qs.set('from', from)
    if (to) qs.set('to', to)
    router.push(`/analytics${qs.toString() ? `?${qs}` : ''}`)
  }

  const reset = () => {
    setType('ALL'); setFrom(''); setTo(''); router.push('/analytics')
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
      <div>
        <label className="block text-xs font-medium mb-1">Type</label>
        <select className="input" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="ALL">All</option>
          <option value="INCOME">INCOME</option>
          <option value="EXPENSE">EXPENSE</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium mb-1">From</label>
        <input type="date" className="input" value={from} onChange={(e) => setFrom(e.target.value)} />
      </div>
      <div>
        <label className="block text-xs font-medium mb-1">To</label>
        <input type="date" className="input" value={to} onChange={(e) => setTo(e.target.value)} />
      </div>
      <div className="flex gap-2 md:col-span-2">
        <button className="btn btn-secondary" type="button" onClick={reset}>Reset</button>
        <button className="btn btn-primary" type="button" onClick={apply}>Apply</button>
      </div>
    </div>
  )
}


