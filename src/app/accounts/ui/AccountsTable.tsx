'use client'

import { useState } from 'react'
import { formatCurrencyCents } from '@/lib/format'

type AccountType = 'CHEQUING' | 'SAVINGS' | 'CREDIT_CARD'

type Account = {
  id: number
  name: string
  type: AccountType
  balanceCents: number
  txnCount: number
}

const TYPE_LABELS: Record<AccountType, string> = {
  CHEQUING: 'Chequing',
  SAVINGS: 'Savings',
  CREDIT_CARD: 'Credit Card',
}

export default function AccountsTable({ accounts }: { accounts: Account[] }) {
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [editType, setEditType] = useState<AccountType>('CHEQUING')

  const startEdit = (acc: Account) => {
    setEditingId(acc.id)
    setEditName(acc.name)
    setEditType(acc.type)
  }

  const cancel = () => setEditingId(null)

  const save = async (id: number) => {
    const res = await fetch(`/api/accounts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName.trim(), type: editType }),
    })
    if (res.ok) window.location.reload()
  }

  const remove = async (acc: Account) => {
    if (!confirm(`Delete "${acc.name}"? This cannot be undone.`)) return
    const res = await fetch(`/api/accounts/${acc.id}`, { method: 'DELETE' })
    if (res.ok) {
      window.location.reload()
    } else {
      const data = await res.json().catch(() => ({}))
      alert(data?.error ?? 'Could not delete account')
    }
  }

  return (
    <div className="space-y-3">
      {accounts.map((acc) => {
        const isCreditCard = acc.type === 'CREDIT_CARD'
        const balanceColor = isCreditCard
          ? acc.balanceCents > 0 ? 'var(--color-error)' : 'var(--color-success)'
          : acc.balanceCents >= 0 ? 'var(--color-success)' : 'var(--color-error)'

        return (
          <div key={acc.id} className="card p-5">
            {editingId === acc.id ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                <div>
                  <label className="block text-xs font-medium mb-1">Name</label>
                  <input
                    className="input"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Type</label>
                  <select className="input" value={editType} onChange={(e) => setEditType(e.target.value as AccountType)}>
                    {(Object.keys(TYPE_LABELS) as AccountType[]).map((t) => (
                      <option key={t} value={t}>{TYPE_LABELS[t]}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2">
                  <button className="btn btn-secondary flex-1" type="button" onClick={cancel}>Cancel</button>
                  <button className="btn btn-primary flex-1" type="button" onClick={() => save(acc.id)}>Save</button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium">{acc.name}</p>
                  <p className="text-muted text-sm">{TYPE_LABELS[acc.type]} · {acc.txnCount} transactions</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="h2" style={{ color: balanceColor }}>{formatCurrencyCents(acc.balanceCents)}</p>
                    <p className="text-muted text-xs">{isCreditCard ? 'owed' : 'available'}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="btn btn-secondary" type="button" onClick={() => startEdit(acc)}>Edit</button>
                    <button className="btn btn-danger" type="button" onClick={() => remove(acc)}>Delete</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
