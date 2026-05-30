import { z } from 'zod'

const monthPattern = /^\d{4}-\d{2}$/

function isValidMonth(value: string) {
  if (!monthPattern.test(value)) {
    return false
  }

  const [year, month] = value.split('-').map(Number)

  return year >= 1900 && month >= 1 && month <= 12
}

const optionalTextField = z
  .string()
  .trim()
  .transform((value) => (value.length > 0 ? value : null))

export const createInvoiceSchema = z.object({
  lease_id: z.string().trim().min(1, 'Select a lease.'),
  billing_period: z
    .string()
    .trim()
    .min(1, 'Billing period is required.')
    .refine(isValidMonth, 'Enter a valid billing month.')
    .transform((value) => `${value}-01`),
  notes: optionalTextField,
})

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>
export type CreateInvoiceFormValues = z.input<typeof createInvoiceSchema>
