import { z } from 'zod'

export const TransactionTypeSchema = z.enum(['INCOME', 'EXPENSE'])

const DateStringSchema = z
  .string()
  .refine((s) => !Number.isNaN(new Date(s).getTime()), { message: 'Invalid date string' })
  .transform((s) => new Date(s))

export const TransactionCreateSchema = z.object({
  amountCents: z.number().int().nonnegative(),
  categoryId: z.number().int().positive(),
  type: TransactionTypeSchema,
  date: DateStringSchema,
  note: z.string().nullable().optional(),
  externalId: z.string().nullable().optional(),
})

export const TransactionUpdateSchema = TransactionCreateSchema.partial()

export const CategoryCreateSchema = z.object({
  name: z.string().min(1).max(64),
  type: TransactionTypeSchema,
})

export const CategoryUpdateSchema = CategoryCreateSchema.partial()

export type TransactionCreateInput = z.infer<typeof TransactionCreateSchema>
export type TransactionUpdateInput = z.infer<typeof TransactionUpdateSchema>
export type CategoryCreateInput = z.infer<typeof CategoryCreateSchema>
export type CategoryUpdateInput = z.infer<typeof CategoryUpdateSchema>

export const TransactionImportRowSchema = TransactionCreateSchema.extend({
  externalId: z.string().min(1),
})

export const TransactionImportSchema = z.array(TransactionImportRowSchema).min(1).max(500)

export type TransactionImportRow = z.infer<typeof TransactionImportRowSchema>

export function formatZodError(error: z.ZodError) {
  return {
    error: 'Invalid payload',
    issues: error.issues.map((i) => ({
      path: i.path.join('.'),
      message: i.message,
    })),
  }
}
