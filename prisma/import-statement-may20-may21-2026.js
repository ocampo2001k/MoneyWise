/* eslint-disable no-console */
// Import script — Additional May 20, 2026 transactions + all May 21, 2026 transactions
// (May 20 already has: Payroll +$1,375.90, Withdrawal -$100, Withdrawal -$60 imported earlier)
// Run with: DATABASE_URL="file:./prisma/dev.db" node prisma/import-statement-may20-may21-2026.js
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

function cents(amount) {
  return Math.round(amount * 100)
}

function externalId(date, amountCents, type, note) {
  const key = `${date}|${amountCents}|${type}|${note}`
  return Buffer.from(key, 'utf-8').toString('base64')
}

// 11 transactions — all categories already exist from prior import scripts
// [date, note, dollarAmount, type, categoryName]
const TRANSACTIONS = [
  // ── May 20 (additional — balance continues from $1,217.54 after prior withdrawals) ──
  ['2026-05-20', 'Apos Alimentation Kh Montr',                          10.48,   'EXPENSE', 'Groceries'],
  ['2026-05-20', 'Withdrawal Free Interac e-transfer',                  150.00,   'EXPENSE', 'Transfer Out'],
  ['2026-05-20', 'Opos Rogers ******15888-7',                           132.80,   'EXPENSE', 'Phone & Internet'],
  ['2026-05-20', 'Bill Payment Mb-Scotia Scene+ Visa Card 01055218',    530.21,   'EXPENSE', 'Visa Payment'],
  ['2026-05-20', 'Customer Transfer Dr. Mb-transfer',                   200.00,   'EXPENSE', 'Transfer Out'],
  ['2026-05-20', 'Opos apple.com/bill 866-7',                             4.59,   'EXPENSE', 'Subscriptions'],
  ['2026-05-20', 'Opos apple.com/bill 866-7 (2)',                         4.59,   'EXPENSE', 'Subscriptions'],
  // ── May 21 ─────────────────────────────────────────────────────────────────────────
  ['2026-05-21', 'Withdrawal Free Interac e-transfer',                   29.52,   'EXPENSE', 'Transfer Out'],
  ['2026-05-21', 'Apos Masa Montr',                                      54.67,   'EXPENSE', 'Dining'],
  ['2026-05-21', 'Deposit Free Interac e-transfer',                      25.00,   'INCOME',  'E-Transfer Income'],
  ['2026-05-21', 'Withdrawal Free Interac e-transfer',                   25.00,   'EXPENSE', 'Transfer Out'],
]

async function main() {
  const allCats = await prisma.category.findMany()
  const categoryMap = Object.fromEntries(allCats.map((c) => [c.name, c.id]))

  let inserted = 0
  let skipped = 0

  for (const [date, note, amount, type, categoryName] of TRANSACTIONS) {
    const amountCents = cents(amount)
    const categoryId = categoryMap[categoryName]
    if (!categoryId) {
      console.error(`✗ Unknown category: "${categoryName}"`)
      process.exit(1)
    }
    const extId = externalId(date, amountCents, type, note)
    const existing = await prisma.transaction.findUnique({ where: { externalId: extId } })
    if (existing) { skipped++; continue }

    await prisma.transaction.create({
      data: { date: new Date(date), amountCents, categoryId, type, note, externalId: extId },
    })
    inserted++
  }

  console.log(`✓ ${inserted} transactions imported, ${skipped} already existed`)
}

main()
  .then(async () => { await prisma.$disconnect() })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
