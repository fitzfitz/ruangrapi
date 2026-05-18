import { z } from 'zod'

const unitTypes = ['room', 'house', 'apartment', 'studio', 'other'] as const

const optionalTextField = z
  .string()
  .trim()
  .transform((value) => (value.length > 0 ? value : null))

const unitTypeField = z.enum(unitTypes, {
  message: 'Unit type is required.',
})

export const updateUnitSchema = z.object({
  name: z.string().trim().min(1, 'Unit name is required.'),
  type: unitTypeField,
  notes: optionalTextField,
})

export type UpdateUnitInput = z.infer<typeof updateUnitSchema>
export type UpdateUnitFormValues = z.input<typeof updateUnitSchema>
