/* eslint-disable no-console */
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const defaults = [
    // Income
    { name: 'Salary', type: 'INCOME' },
    { name: 'Bonus', type: 'INCOME' },
    { name: 'Investments', type: 'INCOME' },
    // Expense
    { name: 'Rent', type: 'EXPENSE' },
    { name: 'Groceries', type: 'EXPENSE' },
    { name: 'Utilities', type: 'EXPENSE' },
    { name: 'Transportation', type: 'EXPENSE' },
    { name: 'Dining', type: 'EXPENSE' },
    { name: 'Entertainment', type: 'EXPENSE' },
    { name: 'Healthcare', type: 'EXPENSE' },
    { name: 'Subscriptions', type: 'EXPENSE' },
    { name: 'Education', type: 'EXPENSE' },
    { name: 'Misc', type: 'EXPENSE' },
  ]

  for (const cat of defaults) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: { type: cat.type },
      create: cat,
    })
  }

  console.log('Seeded default categories')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })


