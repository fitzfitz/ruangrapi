import { z } from 'zod'

const optionalTextField = z
  .string()
  .trim()
  .transform((value) => (value.length > 0 ? value : null))

export const createPropertySchema = z.object({
  name: z.string().trim().min(1, 'Property name is required.'),
  address: optionalTextField,
  notes: optionalTextField,
})

export type CreatePropertyInput = z.infer<typeof createPropertySchema>
export type CreatePropertyFormValues = z.input<typeof createPropertySchema>
