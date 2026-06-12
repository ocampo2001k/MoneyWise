export type ParsedCsvRow = {
  rowIndex: number
  date: string
  amountCents: number
  type: 'INCOME' | 'EXPENSE'
  note: string
  categoryId: number | ''
  externalId: string
  valid: boolean
  error: string | null
}

type Category = { id: number; name: string; type: 'INCOME' | 'EXPENSE' }

function parseCsvLine(line: string): string[] {
  const fields: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (ch === ',' && !inQuotes) {
      fields.push(current.trim())
      current = ''
    } else {
      current += ch
    }
  }
  fields.push(current.trim())
  return fields
}

function computeExternalId(date: string, amountCents: number, type: string, note: string): string {
  const key = `${date}|${amountCents}|${type}|${note}`
  const encoded = new TextEncoder().encode(key)
  let binary = ''
  for (let i = 0; i < encoded.length; i++) {
    binary += String.fromCharCode(encoded[i])
  }
  return btoa(binary)
}

function parseScotiabankDate(raw: string): string | null {
  const mmddyyyy = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (mmddyyyy) {
    const [, mm, dd, yyyy] = mmddyyyy
    const d = new Date(Date.UTC(Number(yyyy), Number(mm) - 1, Number(dd)))
    if (isNaN(d.getTime())) return null
    return d.toISOString().slice(0, 10)
  }
  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (iso) {
    const d = new Date(Date.UTC(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3])))
    if (isNaN(d.getTime())) return null
    return raw
  }
  return null
}

export function parseCsvScotiabank(text: string): ParsedCsvRow[] {
  const lines = text
    .replace(/^﻿/, '')
    .split('\n')
    .map((l) => l.replace(/\r$/, ''))

  let headerIdx = -1
  let colDate = -1
  let colDesc = -1
  let colWithdraw = -1
  let colDeposit = -1

  for (let i = 0; i < lines.length; i++) {
    const lower = lines[i].toLowerCase()
    if (lower.includes('date') && (lower.includes('withdraw') || lower.includes('deposit'))) {
      const headers = parseCsvLine(lines[i]).map((h) => h.toLowerCase().replace(/[^a-z]/g, ''))
      const dateIdx = headers.findIndex((h) => h === 'date')
      const withdrawIdx = headers.findIndex((h) => h.includes('withdraw') || h.includes('debit'))
      const depositIdx = headers.findIndex((h) => h.includes('deposit') || h.includes('credit'))
      if (dateIdx !== -1 && withdrawIdx !== -1 && depositIdx !== -1) {
        colDate = dateIdx
        colWithdraw = withdrawIdx
        colDeposit = depositIdx
        const taken = new Set([dateIdx, withdrawIdx, depositIdx])
        colDesc = headers.findIndex((h, idx) => !taken.has(idx) && !h.includes('balance'))
        if (colDesc === -1) colDesc = 1
        headerIdx = i
        break
      }
    }
  }

  if (headerIdx === -1) {
    throw new Error(
      'Could not find header row. Expected columns: Date, Description/Transactions, Withdrawals, Deposits.'
    )
  }

  const rows: ParsedCsvRow[] = []
  for (let i = headerIdx + 1; i < lines.length; i++) {
    const line = lines[i]
    if (line.trim() === '') continue

    const fields = parseCsvLine(line)
    const rawDate = fields[colDate]?.trim() ?? ''
    const rawDesc = fields[colDesc]?.trim() ?? ''
    const rawWithdraw = fields[colWithdraw]?.trim() ?? ''
    const rawDeposit = fields[colDeposit]?.trim() ?? ''

    const date = parseScotiabankDate(rawDate)
    if (date === null) {
      rows.push({
        rowIndex: i,
        date: rawDate,
        amountCents: 0,
        type: 'EXPENSE',
        note: rawDesc,
        categoryId: '',
        externalId: '',
        valid: false,
        error: `Invalid date: "${rawDate}"`,
      })
      continue
    }

    const isExpense = rawWithdraw !== '' && rawWithdraw !== '0.00' && rawWithdraw !== '0'
    const isIncome = rawDeposit !== '' && rawDeposit !== '0.00' && rawDeposit !== '0'

    if (!isExpense && !isIncome) {
      rows.push({
        rowIndex: i,
        date,
        amountCents: 0,
        type: 'EXPENSE',
        note: rawDesc,
        categoryId: '',
        externalId: '',
        valid: false,
        error: 'No withdrawal or deposit amount found',
      })
      continue
    }

    const type: 'INCOME' | 'EXPENSE' = isExpense ? 'EXPENSE' : 'INCOME'
    const rawAmount = isExpense ? rawWithdraw : rawDeposit
    const amountFloat = parseFloat(rawAmount.replace(/,/g, ''))

    if (!Number.isFinite(amountFloat) || amountFloat <= 0) {
      rows.push({
        rowIndex: i,
        date,
        amountCents: 0,
        type,
        note: rawDesc,
        categoryId: '',
        externalId: '',
        valid: false,
        error: `Invalid amount: "${rawAmount}"`,
      })
      continue
    }

    const amountCents = Math.round(amountFloat * 100)
    const externalId = computeExternalId(date, amountCents, type, rawDesc)

    rows.push({
      rowIndex: i,
      date,
      amountCents,
      type,
      note: rawDesc,
      categoryId: '',
      externalId,
      valid: true,
      error: null,
    })
  }

  return rows
}

const CATEGORY_PATTERNS: Array<{
  patterns: RegExp[]
  income: string | null
  expense: string | null
}> = [
  { patterns: [/point of sale/i], income: null, expense: 'Shopping' },
  { patterns: [/interac e-transfer/i, /free interac/i], income: 'E-Transfer', expense: 'Transfer' },
  { patterns: [/mb-transfer from/i, /transfer from/i], income: 'Transfer', expense: null },
  { patterns: [/mb-transfer to/i, /transfer to/i], income: null, expense: 'Transfer' },
  { patterns: [/uber/i], income: null, expense: 'Transport' },
  { patterns: [/amazon/i], income: null, expense: 'Shopping' },
  { patterns: [/salary|payroll|paycheck/i], income: 'Salary', expense: null },
  { patterns: [/grocery|groceries|supermarket/i], income: null, expense: 'Groceries' },
  { patterns: [/air canada|aircanada|flight/i], income: null, expense: 'Travel' },
]

export function suggestCategory(
  description: string,
  type: 'INCOME' | 'EXPENSE',
  categories: Category[]
): number | '' {
  const byType = categories.filter((c) => c.type === type)
  for (const { patterns, income, expense } of CATEGORY_PATTERNS) {
    if (patterns.some((p) => p.test(description))) {
      const targetName = type === 'INCOME' ? income : expense
      if (targetName === null) continue
      const match = byType.find((c) => c.name.toLowerCase() === targetName.toLowerCase())
      if (match) return match.id
    }
  }
  return ''
}
