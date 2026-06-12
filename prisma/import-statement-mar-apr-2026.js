/* eslint-disable no-console */
// Import script — Scotiabank statement March 27 – April 25, 2026
// Run with: node prisma/import-statement-mar-apr-2026.js
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

function cents(amount) {
  return Math.round(amount * 100)
}

function externalId(date, amountCents, type, note) {
  const key = `${date}|${amountCents}|${type}|${note}`
  return Buffer.from(key, 'utf-8').toString('base64')
}

const CATEGORIES = [
  // INCOME
  { name: 'Salary',              type: 'INCOME' },
  { name: 'E-Transfer Income',   type: 'INCOME' },
  { name: 'Government Benefits', type: 'INCOME' },
  { name: 'Transfer In',         type: 'INCOME' },
  { name: 'Refund',              type: 'INCOME' },
  // EXPENSE
  { name: 'Transportation',      type: 'EXPENSE' },
  { name: 'Shopping',            type: 'EXPENSE' },
  { name: 'Groceries',           type: 'EXPENSE' },
  { name: 'Phone & Internet',    type: 'EXPENSE' },
  { name: 'Subscriptions',       type: 'EXPENSE' },
  { name: 'Dining',              type: 'EXPENSE' },
  { name: 'Transfer Out',        type: 'EXPENSE' },
  { name: 'Visa Payment',        type: 'EXPENSE' },
  { name: 'Travel',              type: 'EXPENSE' },
  { name: 'Entertainment',       type: 'EXPENSE' },
  { name: 'Fitness',             type: 'EXPENSE' },
  { name: 'Education',           type: 'EXPENSE' },
  { name: 'ATM Withdrawal',      type: 'EXPENSE' },
  { name: 'Utilities',           type: 'EXPENSE' },
]

// All 99 transactions from the March 27 – April 25, 2026 statement
// Format: [date, note/description, dollarAmount, type, categoryName]
const TRANSACTIONS = [
  // ── March 27 ──────────────────────────────────────────────────────
  ['2026-03-27', 'Deposit 61482470 Free Interac E-Transfer',                         40.90,    'INCOME',  'E-Transfer Income'],
  ['2026-03-27', 'Point of sale purchase Opos Amazon.CA +1877586323BCCA',             40.89,    'EXPENSE', 'Shopping'],
  ['2026-03-27', 'Point of sale purchase Opos Agence de Mobilite Dmontreal Pqca',      3.57,    'EXPENSE', 'Transportation'],
  // ── March 28 ──────────────────────────────────────────────────────
  ['2026-03-28', 'Point of sale purchase Opos Uber Canada/ Ubertriptoronto ONCA',     29.69,    'EXPENSE', 'Transportation'],
  ['2026-03-28', 'MB-Transfer from 30171 05704 78',                                  500.00,    'INCOME',  'Transfer In'],
  ['2026-03-28', 'Withdrawal 64376080 Free Interac E-Transfer',                      500.00,    'EXPENSE', 'Transfer Out'],
  ['2026-03-28', 'Point of sale purchase Opos Uber *Trip Help.Ubertoronto ONCA',      22.07,    'EXPENSE', 'Transportation'],
  ['2026-03-28', 'Point of sale purchase Opos Uber Canada/ Ubertriptoronto ONCA',     21.60,    'EXPENSE', 'Transportation'],
  ['2026-03-28', 'Point of sale purchase Opos Uber Canada/ Ubertriptoronto ONCA',     24.88,    'EXPENSE', 'Transportation'],
  ['2026-03-28', 'Error correction Opos Uber Canada/ Ubertriptoronto ONCA',           21.60,    'INCOME',  'Refund'],
  // ── March 30 ──────────────────────────────────────────────────────
  ['2026-03-30', 'Deposit 68311289 Free Interac E-Transfer',                          31.23,    'INCOME',  'E-Transfer Income'],
  ['2026-03-30', 'Deposit 68692831 Free Interac E-Transfer',                         700.00,    'INCOME',  'E-Transfer Income'],
  ['2026-03-30', 'MB-Transfer to 30171 05704 78',                                    500.00,    'EXPENSE', 'Transfer Out'],
  ['2026-03-30', 'Point of sale purchase Opos Amazon Channels amazon.ca BCCA',        17.23,    'EXPENSE', 'Subscriptions'],
  // ── March 31 ──────────────────────────────────────────────────────
  ['2026-03-31', 'Point of sale purchase Opos Air Can* Aircanada.Cmbca',              65.00,    'EXPENSE', 'Travel'],
  // ── April 1 ───────────────────────────────────────────────────────
  ['2026-04-01', 'Point of sale purchase Opos Uber * Pending Toronto ONCA',           29.08,    'EXPENSE', 'Transportation'],
  ['2026-04-01', 'MB-Transfer from 30171 05704 78',                                  800.00,    'INCOME',  'Transfer In'],
  ['2026-04-01', 'MB-Bill payment Scotia Scene+ VISA Card',                          800.00,    'EXPENSE', 'Visa Payment'],
  ['2026-04-01', 'Point of sale purchase Opos Device Protection 855-562-195BCCA',    14.69,    'EXPENSE', 'Subscriptions'],
  // ── April 2 ───────────────────────────────────────────────────────
  ['2026-04-02', 'Solidarity Tax Credit Gouv. Quebec',                                66.67,    'INCOME',  'Government Benefits'],
  ['2026-04-02', 'GST Canada',                                                       114.58,    'INCOME',  'Government Benefits'],
  ['2026-04-02', 'Withdrawal 76845499 Free Interac E-Transfer',                       81.62,    'EXPENSE', 'Transfer Out'],
  ['2026-04-02', 'Point of sale purchase Opos Apple.Com/Bill 866-712-775ONCA',         0.79,    'EXPENSE', 'Subscriptions'],
  // ── April 4 ───────────────────────────────────────────────────────
  ['2026-04-04', 'Point of sale purchase Opos Claude.Ai Subscripti+1415236059C- Aus', 32.19,   'EXPENSE', 'Subscriptions'],
  ['2026-04-04', 'Withdrawal 83187015 Free Interac E-Transfer',                       60.00,    'EXPENSE', 'Transfer Out'],
  ['2026-04-04', 'Error correction Opos Air Can* Aircanada.Cmbca',                   65.00,    'INCOME',  'Refund'],
  // ── April 6 ───────────────────────────────────────────────────────
  ['2026-04-06', 'Withdrawal 85514145 Free Interac E-Transfer',                       42.00,    'EXPENSE', 'Transfer Out'],
  ['2026-04-06', 'Deposit 87908449 Free Interac E-Transfer',                          81.62,    'INCOME',  'E-Transfer Income'],
  // ── April 7 ───────────────────────────────────────────────────────
  ['2026-04-07', 'Point of sale purchase Apos Marche Newon Montreal QCCA',             7.96,    'EXPENSE', 'Groceries'],
  ['2026-04-07', 'Deposit 90860973 Free Interac E-Transfer',                         160.00,    'INCOME',  'E-Transfer Income'],
  // ── April 8 ───────────────────────────────────────────────────────
  ['2026-04-08', 'Point of sale purchase Opos Uber * Pending Toronto ONCA',           29.89,    'EXPENSE', 'Transportation'],
  ['2026-04-08', 'Deposit 91266822 Free Interac E-Transfer',                          13.00,    'INCOME',  'E-Transfer Income'],
  ['2026-04-08', 'Deposit 92627861 Free Interac E-Transfer',                          18.00,    'INCOME',  'E-Transfer Income'],
  ['2026-04-08', 'Payroll dep. Uem Mtl',                                           1324.11,    'INCOME',  'Salary'],
  ['2026-04-08', 'Point of sale purchase Opos Rogers ******15888-764-377ONCA',     1156.93,    'EXPENSE', 'Phone & Internet'],
  ['2026-04-08', 'MB-Transfer to 30171 05704 78',                                    300.00,    'EXPENSE', 'Transfer Out'],
  ['2026-04-08', 'Withdrawal 93198724 Free Interac E-Transfer',                       20.00,    'EXPENSE', 'Transfer Out'],
  // ── April 9 ───────────────────────────────────────────────────────
  ['2026-04-09', 'MB-Bill payment Scotia Scene+ VISA Card',                          200.00,    'EXPENSE', 'Visa Payment'],
  ['2026-04-09', 'Point of sale purchase Apos Maxi Cie #890 St- Laurent QCCA',        54.73,    'EXPENSE', 'Groceries'],
  ['2026-04-09', 'Point of sale purchase Apos Maxi Cie #890 Saint-Laureqcca',          6.50,    'EXPENSE', 'Groceries'],
  ['2026-04-09', 'Deposit 95651616 Free Interac E-Transfer',                          50.10,    'INCOME',  'E-Transfer Income'],
  ['2026-04-09', 'Point of sale purchase Opos Amzn Mktp CA 866-216-107ONCA',          43.68,    'EXPENSE', 'Shopping'],
  // ── April 10 ──────────────────────────────────────────────────────
  ['2026-04-10', 'Point of sale purchase Opos Www.Newcit* Newcityg+1514879116Pqca',   46.33,    'EXPENSE', 'Utilities'],
  ['2026-04-10', 'Deposit 98580295 Free Interac E-Transfer',                          18.88,    'INCOME',  'E-Transfer Income'],
  ['2026-04-10', 'Point of sale purchase Opos Uber Canada/ Ubertriptoronto ONCA',     18.88,    'EXPENSE', 'Transportation'],
  ['2026-04-10', 'Error correction Opos Uber Canada/ Ubertriptoronto ONCA',           18.88,    'INCOME',  'Refund'],
  ['2026-04-10', 'Point of sale purchase Opos Uber Canada/ Ubertriptoronto ONCA',      6.48,    'EXPENSE', 'Transportation'],
  ['2026-04-10', 'Point of sale purchase Opos Uber * Pending Toronto ONCA',           19.12,    'EXPENSE', 'Transportation'],
  ['2026-04-10', 'Point of sale purchase Apos Pizza Hut Queen Montreal QCCA',          37.00,    'EXPENSE', 'Dining'],
  // ── April 11 ──────────────────────────────────────────────────────
  ['2026-04-11', 'Point of sale purchase Opos Amazon +1888280433BCCA',                11.49,    'EXPENSE', 'Shopping'],
  ['2026-04-11', 'Withdrawal 01615354 Free Interac E-Transfer',                       60.00,    'EXPENSE', 'Transfer Out'],
  ['2026-04-11', 'Point of sale purchase Opos Uber Canada/ Ubertriptoronto ONCA',     13.10,    'EXPENSE', 'Transportation'],
  ['2026-04-11', 'Error correction Opos Uber Canada/ Ubertriptoronto ONCA',           13.10,    'INCOME',  'Refund'],
  // ── April 13 ──────────────────────────────────────────────────────
  ['2026-04-13', 'Point of sale purchase Opos Uber Canada/ Ubertriptoronto ONCA',     14.86,    'EXPENSE', 'Transportation'],
  // ── April 14 ──────────────────────────────────────────────────────
  ['2026-04-14', 'Deposit 06701827 Free Interac E-Transfer',                          60.00,    'INCOME',  'E-Transfer Income'],
  ['2026-04-14', 'Deposit 08181409 Free Interac E-Transfer',                          53.25,    'INCOME',  'E-Transfer Income'],
  ['2026-04-14', 'Point of sale purchase Opos Amzn Mktp CA 866-216-107ONCA',          53.25,    'EXPENSE', 'Shopping'],
  // ── April 17 ──────────────────────────────────────────────────────
  ['2026-04-17', 'Point of sale purchase Opos Apple.Com/Bill 866-712-775ONCA',         4.59,    'EXPENSE', 'Subscriptions'],
  // ── April 18 ──────────────────────────────────────────────────────
  ['2026-04-18', 'Deposit 18549941 Free Interac E-Transfer',                          15.00,    'INCOME',  'E-Transfer Income'],
  ['2026-04-18', 'Deposit 18594014 Free Interac E-Transfer',                           3.00,    'INCOME',  'E-Transfer Income'],
  // ── April 20 ──────────────────────────────────────────────────────
  ['2026-04-20', 'MB-Transfer from 30171 05704 78',                                  500.00,    'INCOME',  'Transfer In'],
  ['2026-04-20', 'Withdrawal 19549381 Free Interac E-Transfer',                      500.00,    'EXPENSE', 'Transfer Out'],
  ['2026-04-20', 'Point of sale purchase Apos Walmart Store # Montreal QCCA',          3.41,    'EXPENSE', 'Shopping'],
  ['2026-04-20', 'Point of sale purchase Apos Salle de Quille Montreal QCCA',         20.19,    'EXPENSE', 'Entertainment'],
  ['2026-04-20', 'Point of sale purchase Apos Salle de Quille Montreal QCCA',         13.66,    'EXPENSE', 'Entertainment'],
  ['2026-04-20', 'MB-Transfer from 30171 05704 78',                                  100.00,    'INCOME',  'Transfer In'],
  ['2026-04-20', 'Misc. payment Alberto Jose Pons Rodriguez',                         112.00,    'INCOME',  'E-Transfer Income'],
  ['2026-04-20', 'MB-Transfer to 30171 05704 78',                                    200.00,    'EXPENSE', 'Transfer Out'],
  ['2026-04-20', 'MB-Transfer from 30171 05704 78',                                  300.00,    'INCOME',  'Transfer In'],
  ['2026-04-20', 'Withdrawal 22321044 Free Interac E-Transfer',                      150.00,    'EXPENSE', 'Transfer Out'],
  // ── April 21 ──────────────────────────────────────────────────────
  ['2026-04-21', 'MB-Transfer to 30171 05704 78',                                    150.00,    'EXPENSE', 'Transfer Out'],
  ['2026-04-21', 'Point of sale purchase Opos Uber Holdings Canadatoronto ONCA',      31.07,    'EXPENSE', 'Transportation'],
  ['2026-04-21', 'Point of sale purchase Opos Uber Holdings Canadatoronto ONCA',      31.24,    'EXPENSE', 'Transportation'],
  ['2026-04-21', 'Error correction Opos Uber Holdings Canadatoronto ONCA',            31.07,    'INCOME',  'Refund'],
  // ── April 22 ──────────────────────────────────────────────────────
  ['2026-04-22', 'Payroll dep. Uem Mtl',                                           1331.51,    'INCOME',  'Salary'],
  ['2026-04-22', 'Point of sale purchase Apos Alimentation Kh Montreal QCCA',         49.46,    'EXPENSE', 'Groceries'],
  ['2026-04-22', 'Withdrawal 28012708 Free Interac E-Transfer',                      300.00,    'EXPENSE', 'Transfer Out'],
  // ── April 23 ──────────────────────────────────────────────────────
  ['2026-04-23', 'MB-Bill payment Scotia Scene+ VISA Card',                          100.00,    'EXPENSE', 'Visa Payment'],
  ['2026-04-23', 'Point of sale purchase Opos Google *Youtubepremig.co/ helppansca',  14.94,    'EXPENSE', 'Subscriptions'],
  ['2026-04-23', 'Point of sale purchase Opos Uber Canada/ Ubertriptoronto ONCA',     24.22,    'EXPENSE', 'Transportation'],
  ['2026-04-23', 'Point of sale purchase Apos C.S. Henri-Bour Montreal QCCA',         13.50,    'EXPENSE', 'Dining'],
  ['2026-04-23', 'Point of sale purchase Opos Uber * Pending Toronto ONCA',           18.08,    'EXPENSE', 'Transportation'],
  ['2026-04-23', 'Point of sale purchase Opos Econofitness Admin Mblainville Pqca',   20.28,    'EXPENSE', 'Fitness'],
  ['2026-04-23', 'Point of sale purchase Opos Apple.Com/Bill 866-712-775ONCA',         5.38,    'EXPENSE', 'Subscriptions'],
  ['2026-04-23', 'Point of sale purchase Apos Ecole de Condui Montreal QCCA',        172.46,    'EXPENSE', 'Education'],
  ['2026-04-23', 'Point of sale purchase Apos Maxi Cie 8661 Montreal QCCA',           46.12,    'EXPENSE', 'Groceries'],
  ['2026-04-23', 'Point of sale purchase Opos Mcdonalds 13766 Montreal Pqca',         13.79,    'EXPENSE', 'Dining'],
  ['2026-04-23', 'Shared ABM withdrawal Interac',                                    503.50,    'EXPENSE', 'ATM Withdrawal'],
  // ── April 24 ──────────────────────────────────────────────────────
  ['2026-04-24', 'Point of sale purchase Apos C.S. Henri-Bour Montreal QCCA',         33.75,    'EXPENSE', 'Dining'],
  ['2026-04-24', 'MB-Transfer from 30171 05704 78',                                  450.00,    'INCOME',  'Transfer In'],
  ['2026-04-24', 'Point of sale purchase Apos C.S. Henri-Bour Montreal QCCA',         71.74,    'EXPENSE', 'Dining'],
  ['2026-04-24', 'Point of sale purchase Apos Subway Montreal QCCA',                  17.24,    'EXPENSE', 'Dining'],
  ['2026-04-24', 'Point of sale purchase Opos Uber Canada/ Ubertriptoronto ONCA',     14.97,    'EXPENSE', 'Transportation'],
  ['2026-04-24', 'Point of sale purchase Opos Uber Canada/ Ubereatstoronto ONCA',     21.42,    'EXPENSE', 'Dining'],
  // ── April 25 ──────────────────────────────────────────────────────
  ['2026-04-25', 'Withdrawal 35252176 Free Interac E-Transfer',                       40.00,    'EXPENSE', 'Transfer Out'],
  ['2026-04-25', 'Withdrawal 35543477 Free Interac E-Transfer',                       50.00,    'EXPENSE', 'Transfer Out'],
  ['2026-04-25', 'Deposit 35871518 Free Interac E-Transfer',                          33.32,    'INCOME',  'E-Transfer Income'],
  ['2026-04-25', 'Deposit 36056692 Interac E-Transfer Rtn',                           40.00,    'INCOME',  'Refund'],
]

async function main() {
  // 1. Upsert all categories
  const categoryMap = {}
  for (const cat of CATEGORIES) {
    const record = await prisma.category.upsert({
      where: { name: cat.name },
      update: { type: cat.type },
      create: cat,
    })
    categoryMap[cat.name] = record.id
  }
  console.log(`✓ ${CATEGORIES.length} categories ready`)

  // 2. Insert transactions (skip duplicates via externalId)
  let inserted = 0
  let skipped = 0

  for (const [date, note, amount, type, categoryName] of TRANSACTIONS) {
    const amountCents = cents(amount)
    const categoryId = categoryMap[categoryName]
    const extId = externalId(date, amountCents, type, note)

    const existing = await prisma.transaction.findUnique({ where: { externalId: extId } })
    if (existing) { skipped++; continue }

    await prisma.transaction.create({
      data: {
        date: new Date(date),
        amountCents,
        categoryId,
        type,
        note,
        externalId: extId,
      },
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
