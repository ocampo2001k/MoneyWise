/* eslint-disable no-console */
// Import script — Mobile app transactions April 27 – May 20, 2026
// Run with: node prisma/import-statement-apr27-may20-2026.js
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

function cents(amount) {
  return Math.round(amount * 100)
}

function externalId(date, amountCents, type, note) {
  const key = `${date}|${amountCents}|${type}|${note}`
  return Buffer.from(key, 'utf-8').toString('base64')
}

const NEW_CATEGORIES = [
  { name: 'Healthcare', type: 'EXPENSE' },
]

// 49 transactions from April 27 – May 20, 2026
// [date, note, dollarAmount, type, categoryName]
const TRANSACTIONS = [
  // ── April 27 ──────────────────────────────────────────────────────
  ['2026-04-27', 'Apos Billetterie Ter Longu',                          7.00,   'EXPENSE', 'Entertainment'],
  ['2026-04-27', 'Apos Pharmaprix #182 Bouch',                         14.94,   'EXPENSE', 'Healthcare'],
  ['2026-04-27', 'Opos Uber Canada/ubertriptoron',                     20.50,   'EXPENSE', 'Transportation'],
  ['2026-04-27', 'Apos Le Petit Sao Longu',                            67.59,   'EXPENSE', 'Dining'],
  ['2026-04-27', 'Apos Billard Doolys Longu',                          28.47,   'EXPENSE', 'Entertainment'],
  ['2026-04-27', 'Opos Uber Canada/ubertriptoron',                     35.26,   'EXPENSE', 'Transportation'],
  ['2026-04-27', 'Withdrawal Free Interac e-transfer',                 29.00,   'EXPENSE', 'Transfer Out'],
  ['2026-04-27', 'Apos Dollarama #1048 Montr',                          5.06,   'EXPENSE', 'Shopping'],
  ['2026-04-27', 'Deposit Free Interac e-transfer',                    18.00,   'INCOME',  'E-Transfer Income'],
  ['2026-04-27', 'Deposit Free Interac e-transfer',                    10.00,   'INCOME',  'E-Transfer Income'],
  // ── April 30 ──────────────────────────────────────────────────────
  ['2026-04-30', 'Opos Amazon Channels Amazo',                         17.23,   'EXPENSE', 'Subscriptions'],
  ['2026-04-30', 'Apos Funhub Dix30 Bross',                            82.78,   'EXPENSE', 'Entertainment'],
  ['2026-04-30', 'Deposit Free Interac e-transfer',                    20.00,   'INCOME',  'E-Transfer Income'],
  // ── May 1 ─────────────────────────────────────────────────────────
  ['2026-05-01', 'Opos Mcdonalds 13766 Montr',                         16.78,   'EXPENSE', 'Dining'],
  ['2026-05-01', 'Deposit Free Interac e-transfer',                    25.00,   'INCOME',  'E-Transfer Income'],
  // ── May 4 ─────────────────────────────────────────────────────────
  ['2026-05-04', 'Apos Pharmaprix 1838 Montr',                         11.15,   'EXPENSE', 'Healthcare'],
  ['2026-05-04', 'Opos Claude.Ai Subscripti+1415',                     32.19,   'EXPENSE', 'Subscriptions'],
  ['2026-05-04', 'Opos Chrono-recharge Opusmontr',                     11.25,   'EXPENSE', 'Transportation'],
  ['2026-05-04', 'Opos Device Protection 855-5',                       14.69,   'EXPENSE', 'Subscriptions'],
  // ── May 5 ─────────────────────────────────────────────────────────
  ['2026-05-05', 'Solidarity Tax Credit Gouv. Quebec',                 66.67,   'INCOME',  'Government Benefits'],
  // ── May 6 ─────────────────────────────────────────────────────────
  ['2026-05-06', 'Opos Google *Google One g.co/',                       6.31,   'EXPENSE', 'Subscriptions'],
  ['2026-05-06', 'Opos Playstation 800-3',                             45.98,   'EXPENSE', 'Subscriptions'],
  ['2026-05-06', 'Payroll Deposit Uem Mtl',                         1375.90,   'INCOME',  'Salary'],
  ['2026-05-06', 'Opos Chrono-recharge Opusmontr',                    104.50,   'EXPENSE', 'Transportation'],
  ['2026-05-06', 'Withdrawal Free Interac e-transfer',                590.00,   'EXPENSE', 'Transfer Out'],
  ['2026-05-06', 'Bill Payment Mb-Scotia Scene+ Visa Card 66287260',  300.00,   'EXPENSE', 'Visa Payment'],
  ['2026-05-06', 'Apos Alimentation Kh Montr',                         28.83,   'EXPENSE', 'Groceries'],
  ['2026-05-06', 'Opos Chrono-recharge Opusmontr',                      3.75,   'EXPENSE', 'Transportation'],
  ['2026-05-06', 'Opos Chrono-recharge Opusmontr (2)',                   3.75,   'EXPENSE', 'Transportation'],
  ['2026-05-06', 'Correction Opos Chrono-recharge Opusmontr',           3.75,   'INCOME',  'Refund'],
  ['2026-05-06', 'Apos Ls Le Blue Saint',                             121.33,   'EXPENSE', 'Dining'],
  ['2026-05-06', 'Opos Uber Canada/ubertriptoron',                     13.69,   'EXPENSE', 'Transportation'],
  // ── May 7 ─────────────────────────────────────────────────────────
  ['2026-05-07', 'Opos Uber Canada/ubertriptoron',                     29.69,   'EXPENSE', 'Transportation'],
  ['2026-05-07', 'Bill Payment Mb-Scotia Scene+ Visa Card 67400722',  200.00,   'EXPENSE', 'Visa Payment'],
  ['2026-05-07', 'Opos Uber Canada/ubertriptoron',                      1.28,   'EXPENSE', 'Transportation'],
  // ── May 8 ─────────────────────────────────────────────────────────
  ['2026-05-08', 'Deposit Free Interac e-transfer',                   100.00,   'INCOME',  'E-Transfer Income'],
  ['2026-05-08', 'Deposit Free Interac e-transfer',                    15.00,   'INCOME',  'E-Transfer Income'],
  ['2026-05-08', 'Withdrawal Free Interac e-transfer',                122.92,   'EXPENSE', 'Transfer Out'],
  ['2026-05-08', 'Deposit Free Interac e-transfer',                    17.25,   'INCOME',  'E-Transfer Income'],
  // ── May 11 ────────────────────────────────────────────────────────
  ['2026-05-11', 'Opos Amzn Mktpl Ca 866-2',                           17.23,   'EXPENSE', 'Shopping'],
  // ── May 13 ────────────────────────────────────────────────────────
  ['2026-05-13', 'Customer Transfer Cr. Sceneplus Cash Credit',        30.00,   'INCOME',  'Refund'],
  ['2026-05-13', 'Withdrawal Free Interac e-transfer',                 30.00,   'EXPENSE', 'Transfer Out'],
  ['2026-05-13', 'Deposit Free Interac e-transfer',                    23.00,   'INCOME',  'E-Transfer Income'],
  ['2026-05-13', 'Withdrawal Free Interac e-transfer',                 23.00,   'EXPENSE', 'Transfer Out'],
  // ── May 14 ────────────────────────────────────────────────────────
  ['2026-05-14', 'Deposit Free Interac e-transfer',                    18.51,   'INCOME',  'E-Transfer Income'],
  // ── May 15 ────────────────────────────────────────────────────────
  ['2026-05-15', 'Opos Mcdonalds 13766 Montr',                         16.89,   'EXPENSE', 'Dining'],
  // ── May 20 ────────────────────────────────────────────────────────
  ['2026-05-20', 'Payroll Deposit Uem Mtl',                         1375.90,   'INCOME',  'Salary'],
  ['2026-05-20', 'Withdrawal Free Interac e-transfer',                100.00,   'EXPENSE', 'Transfer Out'],
  ['2026-05-20', 'Withdrawal Free Interac e-transfer',                 60.00,   'EXPENSE', 'Transfer Out'],
]

async function main() {
  // Add new categories (upsert is safe if they already exist)
  for (const cat of NEW_CATEGORIES) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: { type: cat.type },
      create: cat,
    })
  }
  console.log(`✓ Categories ready`)

  // Build full category map
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
