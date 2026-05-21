'use client'

import { useEffect, useState } from 'react'
import { formatDateYYYYMMDD } from '@/lib/format'

type TransactionType = 'INCOME' | 'EXPENSE'

export default function NewTransactionForm() {
  const [amount, setAmount] = useState<string>('')
  const [categoryId, setCategoryId] = useState<number | ''>('')
  const [categories, setCategories] = useState<Array<{ id: number; name: string; type: 'INCOME' | 'EXPENSE' }>>([])
  const [type, setType] = useState<TransactionType>('EXPENSE')
  const [date, setDate] = useState<string>('')
  useEffect(() => {
    // Set default date on client only to avoid SSR hydration mismatch
    setDate(formatDateYYYYMMDD(new Date()))
  }, [])

  const [note, setNote] = useState<string>('')
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSuccess(null)
    setSubmitting(true)
    try {
      const amountNumber = Number(amount)
      if (!Number.isFinite(amountNumber)) {
        throw new Error('Amount must be a number')
      }
      const amountCents = Math.round(amountNumber * 100)
      const isoDate = new Date(date).toISOString()

      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amountCents,
          categoryId: categoryId === '' ? undefined : Number(categoryId),
          type,
          date: isoDate,
          note: note.trim() === '' ? null : note,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error ?? 'Failed to create transaction')
      }

      setSuccess('Transaction created')
      setAmount('')
      setCategoryId('')
      setType('EXPENSE')
      setDate(new Date().toISOString().slice(0, 10))
      setNote('')

      // Simple refresh to show new data
      if (typeof window !== 'undefined') {
        window.location.reload()
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Unknown error'
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  useEffect(() => {
    ;(async () => {
      const res = await fetch('/api/categories')
      if (res.ok) {
        const data = await res.json()
        setCategories(data)
      }
    })()
  }, [])

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
      <div>
        <label className="block text-xs font-medium mb-1">Amount (USD)</label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="input"
          placeholder="0.00"
          required
        />
      </div>

      <div>
        <label className="block text-xs font-medium mb-1">Category</label>
        <select className="input" value={String(categoryId)} onChange={(e) => setCategoryId(e.target.value === '' ? '' : Number(e.target.value))} required>
          <option value="">Select…</option>
          {categories.filter((c) => c.type === type).map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium mb-1">Type</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as TransactionType)}
          className="input"
        >
          <option value="EXPENSE">EXPENSE</option>
          <option value="INCOME">INCOME</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium mb-1">Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="input"
          required
        />
      </div>

      <div className="md:col-span-5">
        <label className="block text-xs font-medium mb-1">Note</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="input flex-1"
            placeholder="Optional"
          />
          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary disabled:opacity-50"
          >
            {submitting ? 'Saving...' : 'Add'}
          </button>
        </div>
        {error && <p className="text-sm mt-2" style={{color: 'var(--color-error)'}}>{error}</p>}
        {success && <p className="text-sm mt-2" style={{color: 'var(--color-success)'}}>{success}</p>}
      </div>
    </form>
  )
}


