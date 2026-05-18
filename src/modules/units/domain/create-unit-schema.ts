import { z } from 'zod'

const unitTypes = ['room', 'house', 'apartment', 'studio', 'other'] as const

const optionalTextField = z
  .string()
  .trim()
  .transform((value) => (value.length > 0 ? value : null))

const unitTypeField = z
  .union([z.enum(unitTypes), z.literal('')])
  .transform((value, context) => {
    if (value === '') {
      context.addIssue({
        code: 'custom',
        message: 'Unit type is required.',
      })

      return z.NEVER
    }

    return value
  })

export const createUnitSchema = z.object({
  name: z.string().trim().min(1, 'Unit name is required.'),
  type: unitTypeField,
  notes: optionalTextField,
})

export type CreateUnitInput = z.infer<typeof createUnitSchema>
export type CreateUnitFormValues = z.input<typeof createUnitSchema>
