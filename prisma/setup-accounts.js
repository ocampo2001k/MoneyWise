/* eslint-disable no-console */
// Creates the 3 accounts, assigns all chequing transactions, and adds opening balances.
// Run with: DATABASE_URL="file:./prisma/dev.db" node prisma/setup-accounts.js
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

function cents(amount) {
  return Math.round(amount * 100)
}

function externalId(date, amountCents, type, note) {
  const key = `${date}|${amountCents}|${type}|${note}`
  return Buffer.from(key, 'utf-8').toString('base64')
}

async function main() {
  // Create accounts
  const chequing = await prisma.account.upsert({
    where: { name: 'Chequing' },
    update: { type: 'CHEQUING' },
    create: { name: 'Chequing', type: 'CHEQUING' },
  })
  const savings = await prisma.account.upsert({
    where: { name: 'Savings' },
    update: { type: 'SAVINGS' },
    create: { name: 'Savings', type: 'SAVINGS' },
  })
  const creditCard = await prisma.account.upsert({
    where: { name: 'Credit Card' },
    update: { type: 'CREDIT_CARD' },
    create: { name: 'Credit Card', type: 'CREDIT_CARD' },
  })
  console.log('✓ Accounts created')

  // Assign all existing transactions (without accountId) to Chequing
  const updated = await prisma.transaction.updateMany({
    where: { accountId: null },
    data: { accountId: chequing.id },
  })
  console.log(`✓ ${updated.count} transactions assigned to Chequing`)

  // Add Opening Balance category if it doesn't exist
  const openingCat = await prisma.category.upsert({
    where: { name: 'Opening Balance' },
    update: { type: 'INCOME' },
    create: { name: 'Opening Balance', type: 'INCOME' },
  })

  // Chequing opening balance: $285.29 (balance before March 27, 2026 tracking start)
  const chqExtId = externalId('2026-03-26', cents(285.29), 'INCOME', 'Opening Balance – Chequing')
  const existingChq = await prisma.transaction.findUnique({ where: { externalId: chqExtId } })
  if (!existingChq) {
    await prisma.transaction.create({
      data: {
        date: new Date('2026-03-26'),
        amountCents: cents(285.29),
        type: 'INCOME',
        categoryId: openingCat.id,
        accountId: chequing.id,
        note: 'Opening Balance – Chequing',
        externalId: chqExtId,
      },
    })
    console.log('✓ Chequing opening balance added ($285.29)')
  } else {
    console.log('– Chequing opening balance already exists')
  }

  // Savings opening balance: $200.43 INCOME
  const savingsExtId = externalId('2026-05-22', cents(200.43), 'INCOME', 'Opening Balance – Savings')
  const existingSavings = await prisma.transaction.findUnique({ where: { externalId: savingsExtId } })
  if (!existingSavings) {
    await prisma.transaction.create({
      data: {
        date: new Date('2026-05-22'),
        amountCents: cents(200.43),
        type: 'INCOME',
        categoryId: openingCat.id,
        accountId: savings.id,
        note: 'Opening Balance – Savings',
        externalId: savingsExtId,
      },
    })
    console.log('✓ Savings opening balance added ($200.43)')
  } else {
    console.log('– Savings opening balance already exists')
  }

  // Credit card opening balance: $463.17 EXPENSE (represents amount currently owed)
  const ccExtId = externalId('2026-05-22', cents(463.17), 'EXPENSE', 'Opening Balance – Credit Card')
  const existingCc = await prisma.transaction.findUnique({ where: { externalId: ccExtId } })
  if (!existingCc) {
    await prisma.transaction.create({
      data: {
        date: new Date('2026-05-22'),
        amountCents: cents(463.17),
        type: 'EXPENSE',
        categoryId: openingCat.id,
        accountId: creditCard.id,
        note: 'Opening Balance – Credit Card',
        externalId: ccExtId,
      },
    })
    console.log('✓ Credit Card opening balance added ($463.17 owed)')
  } else {
    console.log('– Credit Card opening balance already exists')
  }

  console.log('\nAccounts ready:')
  const accounts = await prisma.account.findMany()
  for (const acc of accounts) {
    const txns = await prisma.transaction.findMany({ where: { accountId: acc.id }, select: { amountCents: true, type: true } })
    const income = txns.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amountCents, 0)
    const expense = txns.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amountCents, 0)
    const balance = acc.type === 'CREDIT_CARD' ? expense - income : income - expense
    const dollars = (balance / 100).toFixed(2)
    const label = acc.type === 'CREDIT_CARD' ? `$${dollars} owed` : `$${dollars}`
    console.log(`  ${acc.name} (${acc.type}): ${label}`)
  }
}

main()
  .then(async () => { await prisma.$disconnect() })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
