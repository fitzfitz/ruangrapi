import { z } from 'zod'

const requiredIdField = z.string().trim().min(1, 'Select an option.')

const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/

function isIsoDate(value: string) {
  if (!isoDatePattern.test(value)) {
    return false
  }

  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(year, month - 1, day)

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  )
}

const requiredDateField = z
  .string()
  .trim()
  .min(1, 'Start date is required.')
  .refine(isIsoDate, 'Enter a valid date.')

const requiredWholeNumberField = (message: string, schema: z.ZodNumber) =>
  z.preprocess(
    (value) => {
      if (typeof value !== 'string') {
        return value
      }

      const trimmedValue = value.trim()

      return trimmedValue.length > 0 ? trimmedValue : undefined
    },
    z.coerce.number({ error: message }).pipe(schema),
  )

const requiredMoneyField = requiredWholeNumberField(
  'Enter a whole number.',
  z.number().int('Enter a whole number.').min(0, 'Enter zero or more.'),
)

const optionalMoneyField = z.preprocess(
  (value) => {
    if (typeof value !== 'string') {
      return value
    }

    const trimmedValue = value.trim()

    return trimmedValue.length > 0 ? trimmedValue : null
  },
  z.coerce
    .number({
      error: 'Enter a whole number.',
    })
    .int('Enter a whole number.')
    .min(0, 'Enter zero or more.')
    .nullable(),
)

const optionalDateField = z
  .string()
  .trim()
  .refine((value) => value.length === 0 || isIsoDate(value), {
    message: 'Enter a valid date.',
  })
  .transform((value) => (value.length > 0 ? value : null))

export const createLeaseSchema = z
  .object({
    tenant_id: requiredIdField,
    unit_id: requiredIdField,
    start_date: requiredDateField,
    end_date: optionalDateField,
    monthly_rent_amount: requiredMoneyField,
    billing_day: requiredWholeNumberField(
      'Enter a billing day.',
      z
        .number()
        .int('Enter a whole billing day.')
        .min(1, 'Billing day must be between 1 and 31.')
        .max(31, 'Billing day must be between 1 and 31.'),
    ),
    deposit_amount: optionalMoneyField,
  })
  .refine(
    (input) => input.end_date === null || input.end_date >= input.start_date,
    {
      message: 'End date cannot be before start date.',
      path: ['end_date'],
    },
  )

export type CreateLeaseInput = z.infer<typeof createLeaseSchema>
export type CreateLeaseFormValues = z.input<typeof createLeaseSchema>
