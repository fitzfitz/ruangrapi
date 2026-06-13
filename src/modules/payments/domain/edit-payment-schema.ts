import { z } from 'zod'

export const editPaymentSchema = z.object({
  amount: z.coerce
    .number({ error: 'Amount is required.' })
    .int('Amount must be a whole number.')
    .positive('Amount must be greater than zero.'),
  payment_date: z.string().trim().min(1, 'Payment date is required.'),
  payment_method: z.enum(['cash', 'bank_transfer', 'e_wallet', 'other'], {
    error: 'Select a payment method.',
  }),
  reference_number: z
    .string()
    .trim()
    .max(120, 'Reference number must be 120 characters or fewer.')
    .transform((value) => value || null),
  notes: z
    .string()
    .trim()
    .max(1000, 'Notes must be 1000 characters or fewer.')
    .transform((value) => value || null),
})

export type EditPaymentFormValues = z.input<typeof editPaymentSchema>
export type EditPaymentInput = z.output<typeof editPaymentSchema>
