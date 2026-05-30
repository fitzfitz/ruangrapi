import { z } from 'zod'

const optionalTextField = z
  .string()
  .trim()
  .transform((value) => (value.length > 0 ? value : null))

const wholeRupiahField = z
  .string()
  .trim()
  .min(1, 'Amount is required.')
  .regex(/^\d+$/, 'Amount must be a whole number.')
  .transform(Number)
  .refine((value) => value > 0, 'Amount must be greater than zero.')

export const createPaymentSchema = z.object({
  invoice_id: z.string().trim().min(1, 'Select an invoice.'),
  amount: wholeRupiahField,
  payment_date: z.string().trim().min(1, 'Payment date is required.'),
  payment_method: z.enum(['cash', 'bank_transfer', 'e_wallet', 'other'], {
    error: 'Select a payment method.',
  }),
  reference_number: optionalTextField,
  notes: optionalTextField,
})

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>
export type CreatePaymentFormValues = z.input<typeof createPaymentSchema>
