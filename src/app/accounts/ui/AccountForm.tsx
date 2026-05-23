'use client'

import { useState } from 'react'

type AccountType = 'CHEQUING' | 'SAVINGS' | 'CREDIT_CARD'

const TYPE_LABELS: Record<AccountType, string> = {
  CHEQUING: 'Chequing',
  SAVINGS: 'Savings',
  CREDIT_CARD: 'Credit Card',
}

export default function AccountForm() {
  const [name, setName] = useState('')
  const [type, setType] = useState<AccountType>('CHEQUING')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const res = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), type }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error ?? 'Failed to create account')
      }
      setName('')
      setType('CHEQUING')
      window.location.reload()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
      <div>
        <label className="block text-xs font-medium mb-1">Account Name</label>
        <input
          className="input"
          type="text"
          placeholder="e.g. TD Savings"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block text-xs font-medium mb-1">Type</label>
        <select className="input" value={type} onChange={(e) => setType(e.target.value as AccountType)}>
          {(Object.keys(TYPE_LABELS) as AccountType[]).map((t) => (
            <option key={t} value={t}>{TYPE_LABELS[t]}</option>
          ))}
        </select>
      </div>
      <div>
        <button type="submit" disabled={submitting} className="btn btn-primary w-full disabled:opacity-50">
          {submitting ? 'Adding...' : 'Add Account'}
        </button>
        {error && <p className="text-sm mt-2" style={{ color: 'var(--color-error)' }}>{error}</p>}
      </div>
    </form>
  )
}
