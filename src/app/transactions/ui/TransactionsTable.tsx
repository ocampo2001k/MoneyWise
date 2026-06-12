'use client'

import { useState } from 'react'
import { formatCurrencyCents, formatDateYYYYMMDD } from '@/lib/format'

type Transaction = {
  id: number
  amountCents: number
  category: { id: number; name: string; type: 'INCOME' | 'EXPENSE' }
  account: { id: number; name: string } | null
  type: 'INCOME' | 'EXPENSE'
  date: string | Date
  note: string | null
}

function formatAmountCents(amountCents: number): string {
  return formatCurrencyCents(amountCents)
}

type EditForm = {
  amountCents: number
  category: string
  type: 'INCOME' | 'EXPENSE'
  date: string
  note: string
}

export default function TransactionsTable({ transactions }: { transactions: Transaction[] }) {
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<EditForm | null>(null)

  const startEdit = (t: Transaction) => {
    setEditingId(t.id)
    const iso = (typeof t.date === 'string' ? new Date(t.date) : t.date).toISOString()
    setForm({
      amountCents: t.amountCents,
      category: t.category.name,
      type: t.type,
      date: iso.slice(0, 10),
      note: t.note ?? '',
    })
  }

  const cancel = () => {
    setEditingId(null)
    setForm(null)
  }

  const save = async (id: number) => {
    if (!form) return
    const payload = {
      amountCents: form.amountCents,
      category: form.category,
      type: form.type,
      date: new Date(form.date).toISOString(),
      note: form.note,
    }

    const res = await fetch(`/api/transactions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (res.ok) {
      window.location.reload()
    }
  }

  const remove = async (id: number) => {
    const res = await fetch(`/api/transactions/${id}`, { method: 'DELETE' })
    if (res.ok) {
      window.location.reload()
    }
  }

  return (
    <div className="overflow-x-auto card">
      <table className="table text-sm">
        <thead className="text-left">
          <tr>
            <th className="font-medium">Date</th>
            <th className="font-medium">Account</th>
            <th className="font-medium">Category</th>
            <th className="font-medium">Type</th>
            <th className="font-medium text-right">Amount</th>
            <th className="font-medium">Note</th>
            <th className="font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {transactions.length === 0 ? (
            <tr>
              <td className="py-6 text-center text-muted" colSpan={7}>No transactions yet.</td>
            </tr>
          ) : (
            transactions.map((t) => (
              <tr key={t.id}>
                <td>
                  {editingId === t.id && form ? (
                    <input className="input" type="date" value={form.date} onChange={(e) => setForm((f) => f && { ...f, date: e.target.value })} />
                  ) : (
                    formatDateYYYYMMDD(t.date)
                  )}
                </td>
                <td className="text-muted text-xs">{t.account?.name ?? '—'}</td>
                <td>{t.category.name}</td>
                <td>
                  {editingId === t.id && form ? (
                    <select className="input" value={form.type} onChange={(e) => setForm((f) => f && { ...f, type: e.target.value as Transaction['type'] })}>
                      <option value="INCOME">INCOME</option>
                      <option value="EXPENSE">EXPENSE</option>
                    </select>
                  ) : (
                    <span className={t.type === 'INCOME' ? 'inline-flex items-center rounded-full bg-green-50 text-green-700 px-2 py-0.5 text-xs font-medium' : 'inline-flex items-center rounded-full bg-red-50 text-red-700 px-2 py-0.5 text-xs font-medium'}>{t.type}</span>
                  )}
                </td>
                <td className="text-right font-medium">
                  {editingId === t.id && form ? (
                    <input className="input text-right" type="number" step="1" value={String(form.amountCents)} onChange={(e) => setForm((f) => f && { ...f, amountCents: Number(e.target.value) })} />
                  ) : (
                    formatAmountCents(t.amountCents)
                  )}
                </td>
                <td>
                  {editingId === t.id && form ? (
                    <input className="input" value={form.note} onChange={(e) => setForm((f) => f && { ...f, note: e.target.value })} />
                  ) : (
                    t.note ?? ''
                  )}
                </td>
                <td className="text-right">
                  {editingId === t.id ? (
                    <div className="flex gap-2 justify-end">
                      <button className="btn btn-secondary" onClick={cancel} type="button">Cancel</button>
                      <button className="btn btn-primary" onClick={() => save(t.id)} type="button">Save</button>
                    </div>
                  ) : (
                    <div className="flex gap-2 justify-end">
                      <button className="btn btn-secondary" onClick={() => startEdit(t)} type="button">Edit</button>
                      <button className="btn btn-danger" onClick={() => remove(t.id)} type="button">Delete</button>
                    </div>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}


