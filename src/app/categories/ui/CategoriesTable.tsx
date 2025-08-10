'use client'

import { useState } from 'react'

type Category = { id: number; name: string; type: 'INCOME' | 'EXPENSE' }

export default function CategoriesTable({ categories }: { categories: Category[] }) {
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<Partial<Category>>({})

  const start = (c: Category) => {
    setEditingId(c.id)
    setForm({ name: c.name, type: c.type })
  }
  const cancel = () => { setEditingId(null); setForm({}) }

  const save = async (id: number) => {
    const res = await fetch(`/api/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) window.location.reload()
  }

  const remove = async (id: number) => {
    const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' })
    if (res.ok) window.location.reload()
  }

  return (
    <div className="overflow-x-auto card">
      <table className="table text-sm">
        <thead className="text-left">
          <tr>
            <th className="font-medium">Name</th>
            <th className="font-medium">Type</th>
            <th className="font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.length === 0 ? (
            <tr><td className="py-6 text-center text-muted" colSpan={3}>No categories yet.</td></tr>
          ) : (
            categories.map((c) => (
              <tr key={c.id}>
                <td>
                  {editingId === c.id ? (
                    <input className="input" value={String(form.name ?? '')} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
                  ) : (
                    c.name
                  )}
                </td>
                <td>
                  {editingId === c.id ? (
                    <select className="input" value={String(form.type)} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as Category['type'] }))}>
                      <option value="INCOME">INCOME</option>
                      <option value="EXPENSE">EXPENSE</option>
                    </select>
                  ) : c.type}
                </td>
                <td className="text-right">
                  {editingId === c.id ? (
                    <div className="flex gap-2 justify-end">
                      <button className="btn btn-secondary" onClick={cancel} type="button">Cancel</button>
                      <button className="btn btn-primary" onClick={() => save(c.id)} type="button">Save</button>
                    </div>
                  ) : (
                    <div className="flex gap-2 justify-end">
                      <button className="btn btn-secondary" onClick={() => start(c)} type="button">Edit</button>
                      <button className="btn btn-danger" onClick={() => remove(c.id)} type="button">Delete</button>
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


