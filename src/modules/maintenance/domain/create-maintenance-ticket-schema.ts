import { z } from 'zod'

const optionalTextField = z
  .string()
  .trim()
  .transform((value) => (value.length > 0 ? value : null))

const optionalWholeRupiahField = z
  .union([z.string(), z.null()])
  .transform((value) => (value === null ? null : value.trim()))
  .transform((value) => (value !== null && value.length > 0 ? value : null))
  .pipe(
    z.union([
      z
        .string()
        .regex(/^\d+$/, 'Cost must be a whole number.')
        .transform(Number)
        .refine((value) => value >= 0, 'Cost must be zero or greater.'),
      z.null(),
    ]),
  )

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
  .min(1, 'Reported date is required.')
  .refine(isIsoDate, 'Enter a valid date.')

export const createMaintenanceTicketSchema = z.object({
  property_id: z.string().trim().min(1, 'Select a property.'),
  unit_id: z
    .string()
    .trim()
    .transform((value) => (value.length > 0 ? value : null)),
  title: z.string().trim().min(1, 'Title is required.'),
  description: optionalTextField,
  priority: z.enum(['low', 'medium', 'high', 'urgent'], {
    error: 'Select a priority.',
  }),
  reported_at: requiredDateField,
  estimated_cost: optionalWholeRupiahField,
  actual_cost: optionalWholeRupiahField,
})

export type CreateMaintenanceTicketInput = z.infer<
  typeof createMaintenanceTicketSchema
>
export type CreateMaintenanceTicketFormValues = z.input<
  typeof createMaintenanceTicketSchema
>
