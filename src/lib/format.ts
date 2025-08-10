export function formatCurrencyCents(amountCents: number): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return formatter.format(amountCents / 100)
}

export function formatDateYYYYMMDD(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  // Render in UTC to avoid timezone-induced day shifts
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
    .toISOString()
    .slice(0, 10)
}


