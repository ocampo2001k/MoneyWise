/* eslint-disable no-console */
// One-time correction: Opos Amzn Mktpl Ca 866-2 was imported with date 2026-05-08
// The screenshot confirms the correct date is 2026-05-11.
// Run with: DATABASE_URL="file:./prisma/dev.db" node prisma/fix-amazon-date.js
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

function externalId(date, amountCents, type, note) {
  const key = `${date}|${amountCents}|${type}|${note}`
  return Buffer.from(key, 'utf-8').toString('base64')
}

async function main() {
  const oldExtId = externalId('2026-05-08', 1723, 'EXPENSE', 'Opos Amzn Mktpl Ca 866-2')
  const newExtId = externalId('2026-05-11', 1723, 'EXPENSE', 'Opos Amzn Mktpl Ca 866-2')

  const existing = await prisma.transaction.findUnique({ where: { externalId: oldExtId } })
  if (!existing) {
    console.log('Transaction not found — may already be corrected or not yet imported')
    return
  }

  await prisma.transaction.update({
    where: { externalId: oldExtId },
    data: { date: new Date('2026-05-11'), externalId: newExtId },
  })
  console.log('✓ Corrected Amazon transaction date: 2026-05-08 → 2026-05-11')
}

main()
  .then(async () => { await prisma.$disconnect() })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
