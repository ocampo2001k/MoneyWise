'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

type Account = { id: number; name: string; type: string }

export default function TransactionsFilters() {
  const router = useRouter()
  const params = useSearchParams()

  const [accountId, setAccountId] = useState<string>(params.get('accountId') ?? '')
  const [categoryId, setCategoryId] = useState<string>(params.get('categoryId') ?? '')
  const [type, setType] = useState<string>(params.get('type') ?? '')
  const [from, setFrom] = useState<string>(params.get('from') ?? '')
  const [to, setTo] = useState<string>(params.get('to') ?? '')
  const [categories, setCategories] = useState<Array<{ id: number; name: string; type: 'INCOME' | 'EXPENSE' }>>([])
  const [accounts, setAccounts] = useState<Account[]>([])

  const apply = useCallback(() => {
    const qs = new URLSearchParams()
    if (accountId) qs.set('accountId', accountId)
    if (categoryId) qs.set('categoryId', categoryId)
    if (type) qs.set('type', type)
    if (from) qs.set('from', from)
    if (to) qs.set('to', to)
    const url = `/transactions${qs.toString() ? `?${qs}` : ''}`
    router.push(url)
  }, [router, accountId, categoryId, type, from, to])

  useEffect(() => {
    setAccountId(params.get('accountId') ?? '')
    setCategoryId(params.get('categoryId') ?? '')
    setType(params.get('type') ?? '')
    setFrom(params.get('from') ?? '')
    setTo(params.get('to') ?? '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.toString()])

  useEffect(() => {
    ;(async () => {
      const [catRes, accRes] = await Promise.all([fetch('/api/categories'), fetch('/api/accounts')])
      if (catRes.ok) setCategories(await catRes.json())
      if (accRes.ok) setAccounts(await accRes.json())
    })()
  }, [])

  const reset = () => {
    setAccountId('')
    setCategoryId('')
    setType('')
    setFrom('')
    setTo('')
    router.push('/transactions')
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
      <div>
        <label className="block text-xs font-medium mb-1">Account</label>
        <select className="input" value={accountId} onChange={(e) => setAccountId(e.target.value)}>
          <option value="">Any</option>
          {accounts.map((a) => (
            <option key={a.id} value={String(a.id)}>{a.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium mb-1">Category</label>
        <select className="input" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">Any</option>
          {categories.map((c) => (
            <option key={c.id} value={String(c.id)}>{c.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium mb-1">Type</label>
        <select className="input" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">Any</option>
          <option value="INCOME">INCOME</option>
          <option value="EXPENSE">EXPENSE</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium mb-1">From</label>
        <input className="input" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
      </div>
      <div>
        <label className="block text-xs font-medium mb-1">To</label>
        <input className="input" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
      </div>
      <div className="flex gap-2">
        <button className="btn btn-secondary" type="button" onClick={reset}>Reset</button>
        <button className="btn btn-primary" type="button" onClick={apply}>Apply</button>
      </div>
    </div>
  )
}
