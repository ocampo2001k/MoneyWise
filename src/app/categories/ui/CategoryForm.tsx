'use client'

import { useState } from 'react'

export default function CategoryForm() {
  const [name, setName] = useState('')
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, type }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error ?? 'Failed to create category')
      }
      setName('')
      setType('EXPENSE')
      window.location.reload()
    } catch (e: any) {
      setError(e.message ?? 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
      <div>
        <label className="block text-xs font-medium mb-1">Name</label>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Groceries" required />
      </div>
      <div>
        <label className="block text-xs font-medium mb-1">Type</label>
        <select className="input" value={type} onChange={(e) => setType(e.target.value as 'INCOME' | 'EXPENSE')}>
          <option value="EXPENSE">EXPENSE</option>
          <option value="INCOME">INCOME</option>
        </select>
      </div>
      <div className="flex gap-2">
        <button className="btn btn-primary" disabled={loading} type="submit">{loading ? 'Saving…' : 'Add'}</button>
      </div>
      {error && <p className="text-sm" style={{ color: 'var(--color-error)' }}>{error}</p>}
    </form>
  )
}


