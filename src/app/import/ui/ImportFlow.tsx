'use client'

import { useState } from 'react'
import { parseCsvScotiabank, suggestCategory, type ParsedCsvRow } from '@/lib/parseCsvScotiabank'
import { formatCurrencyCents } from '@/lib/format'

type Category = { id: number; name: string; type: 'INCOME' | 'EXPENSE' }

type ImportState =
  | { phase: 'idle' }
  | { phase: 'file-selected'; file: File }
  | { phase: 'parsing' }
  | { phase: 'preview'; rows: ParsedCsvRow[]; categories: Category[] }
  | { phase: 'importing' }
  | { phase: 'done'; imported: number; skipped: number }
  | { phase: 'error'; message: string }

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result)
      else reject(new Error('FileReader did not return a string'))
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}

async function fetchCategories(): Promise<Category[]> {
  const res = await fetch('/api/categories')
  if (!res.ok) throw new Error('Failed to fetch categories')
  return res.json() as Promise<Category[]>
}

export default function ImportFlow() {
  const [state, setState] = useState<ImportState>({ phase: 'idle' })

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) setState({ phase: 'file-selected', file })
  }

  async function handlePreview() {
    if (state.phase !== 'file-selected') return
    setState({ phase: 'parsing' })
    try {
      const [text, categories] = await Promise.all([
        readFileAsText(state.file),
        fetchCategories(),
      ])
      const parsed = parseCsvScotiabank(text)
      if (parsed.length === 0) throw new Error('No data rows found in the CSV file.')
      if (parsed.length > 500) {
        throw new Error(
          `File has ${parsed.length} rows. Maximum is 500. Please split the file into smaller batches.`
        )
      }
      const rows = parsed.map((row) => ({
        ...row,
        categoryId: row.valid
          ? suggestCategory(row.note, row.type, categories)
          : ('' as const),
      }))
      setState({ phase: 'preview', rows, categories })
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to parse CSV'
      setState({ phase: 'error', message })
    }
  }

  function handleCategoryChange(rowIndex: number, categoryId: number | '') {
    if (state.phase !== 'preview') return
    setState({
      ...state,
      rows: state.rows.map((r) => (r.rowIndex === rowIndex ? { ...r, categoryId } : r)),
    })
  }

  async function handleImport() {
    if (state.phase !== 'preview') return
    const validRows = state.rows.filter((r) => r.valid && r.categoryId !== '')
    if (validRows.length === 0) return
    setState({ phase: 'importing' })
    try {
      const payload = validRows.map((r) => ({
        amountCents: r.amountCents,
        categoryId: r.categoryId as number,
        type: r.type,
        date: new Date(r.date).toISOString(),
        note: r.note || null,
        externalId: r.externalId,
      }))
      const res = await fetch('/api/transactions/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error((data as { error?: string }).error ?? 'Import failed')
      }
      const result = (await res.json()) as { imported: number; skipped: number }
      setState({ phase: 'done', imported: result.imported, skipped: result.skipped })
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Import failed'
      setState({ phase: 'error', message })
    }
  }

  if (state.phase === 'idle') {
    return (
      <label
        className="block cursor-pointer"
        style={{ display: 'block' }}
      >
        <div
          className="card p-8 text-center"
          style={{
            border: '2px dashed var(--color-border)',
            background: 'transparent',
          }}
        >
          <p className="text-muted mb-1">Click to upload your Scotiabank CSV statement</p>
          <p className="text-sm text-muted">CSV export from Scotiabank online banking · max 500 rows</p>
        </div>
        <input
          type="file"
          accept=".csv"
          className="sr-only"
          onChange={handleFileChange}
        />
      </label>
    )
  }

  if (state.phase === 'file-selected') {
    return (
      <div className="card p-4 flex items-center gap-4">
        <span className="text-sm flex-1">{state.file.name}</span>
        <button className="btn btn-primary" onClick={handlePreview}>
          Preview
        </button>
        <button className="btn btn-secondary" onClick={() => setState({ phase: 'idle' })}>
          Remove
        </button>
      </div>
    )
  }

  if (state.phase === 'parsing') {
    return <div className="card p-4 text-muted">Parsing CSV…</div>
  }

  if (state.phase === 'preview') {
    const validRows = state.rows.filter((r) => r.valid)
    const invalidCount = state.rows.filter((r) => !r.valid).length
    const unassigned = validRows.filter((r) => r.categoryId === '').length
    const readyToImport = validRows.length > 0 && unassigned === 0

    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <div className="flex flex-wrap gap-3 text-sm">
            <span>
              <span className="font-medium">{validRows.length}</span> rows ready
            </span>
            {invalidCount > 0 && (
              <span style={{ color: 'var(--color-error)' }}>
                {invalidCount} invalid (skipped)
              </span>
            )}
            {unassigned > 0 && (
              <span style={{ color: 'var(--color-error)' }}>
                {unassigned} rows need a category
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              className="btn btn-primary disabled:opacity-50"
              disabled={!readyToImport}
              onClick={handleImport}
            >
              Import {validRows.length} rows
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => setState({ phase: 'idle' })}
            >
              Start over
            </button>
          </div>
        </div>

        <div className="overflow-x-auto card">
          <table className="table text-sm">
            <thead className="text-left">
              <tr>
                <th className="font-medium">#</th>
                <th className="font-medium">Date</th>
                <th className="font-medium text-right">Amount</th>
                <th className="font-medium">Type</th>
                <th className="font-medium">Description</th>
                <th className="font-medium">Category</th>
                <th className="font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {state.rows.map((row) => (
                <tr key={row.rowIndex}>
                  <td className="text-muted">{row.rowIndex}</td>
                  <td>{row.date || '—'}</td>
                  <td className="text-right font-medium">
                    {row.valid ? formatCurrencyCents(row.amountCents) : '—'}
                  </td>
                  <td>
                    {row.valid && (
                      <span
                        className={
                          row.type === 'INCOME'
                            ? 'inline-flex items-center rounded-full bg-green-50 text-green-700 px-2 py-0.5 text-xs font-medium'
                            : 'inline-flex items-center rounded-full bg-red-50 text-red-700 px-2 py-0.5 text-xs font-medium'
                        }
                      >
                        {row.type}
                      </span>
                    )}
                  </td>
                  <td
                    style={{
                      maxWidth: '200px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    title={row.note}
                  >
                    {row.note || '—'}
                  </td>
                  <td>
                    {row.valid ? (
                      <select
                        className="input"
                        value={String(row.categoryId)}
                        onChange={(e) =>
                          handleCategoryChange(
                            row.rowIndex,
                            e.target.value === '' ? '' : Number(e.target.value)
                          )
                        }
                      >
                        <option value="">Select…</option>
                        {state.categories
                          .filter((c) => c.type === row.type)
                          .map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                      </select>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>
                    {row.valid ? (
                      <span
                        style={{
                          color:
                            row.categoryId !== ''
                              ? 'var(--color-success)'
                              : 'var(--color-error)',
                        }}
                      >
                        {row.categoryId !== '' ? 'Ready' : 'Needs category'}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--color-error)' }}>{row.error}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  if (state.phase === 'importing') {
    return <div className="card p-4 text-muted">Importing transactions…</div>
  }

  if (state.phase === 'done') {
    return (
      <div className="card p-6 space-y-4">
        <h2 className="h2">Import complete</h2>
        <div className="grid grid-cols-2 gap-4" style={{ maxWidth: '240px' }}>
          <div>
            <div className="text-sm text-muted">Imported</div>
            <div className="h2" style={{ color: 'var(--color-success)' }}>
              {state.imported}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted">Skipped</div>
            <div className="h2 text-muted">{state.skipped}</div>
          </div>
        </div>
        <div className="flex gap-2">
          <a href="/transactions" className="btn btn-primary">
            View Transactions
          </a>
          <button
            className="btn btn-secondary"
            onClick={() => setState({ phase: 'idle' })}
          >
            Import another file
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="card p-4 space-y-3">
      <p style={{ color: 'var(--color-error)' }}>{state.message}</p>
      <button className="btn btn-secondary" onClick={() => setState({ phase: 'idle' })}>
        Try again
      </button>
    </div>
  )
}
