import { prisma } from '@/lib/prisma'
import CategoryForm from '@/app/categories/ui/CategoryForm'
import CategoriesTable from '@/app/categories/ui/CategoriesTable'

export default async function CategoriesPage() {
  const categories = await (prisma.category as any).findMany({ orderBy: { type: 'asc' } })

  return (
    <div className="mx-auto max-w-3xl w-full py-6 px-2 space-y-6">
      <header className="space-y-2">
        <h1 className="h1">Categories</h1>
        <p className="text-muted">Manage income and expense categories used by your transactions.</p>
      </header>

      <section className="card p-4">
        <CategoryForm />
      </section>

      <section className="space-y-3">
        <h2 className="h2">All categories</h2>
        <CategoriesTable categories={categories} />
      </section>
    </div>
  )
}


