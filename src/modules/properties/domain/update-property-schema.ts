import type { z } from 'zod'

import { createPropertySchema } from './create-property-schema'

export const updatePropertySchema = createPropertySchema

export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>
export type UpdatePropertyFormValues = z.input<typeof updatePropertySchema>
