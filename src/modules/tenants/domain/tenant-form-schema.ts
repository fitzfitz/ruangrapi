import { z } from 'zod'

export const optionalTextField = z
  .string()
  .trim()
  .transform((value) => (value.length > 0 ? value : null))

const optionalEmailField = z
  .string()
  .trim()
  .refine(
    (value) => value.length === 0 || z.string().email().safeParse(value).success,
    'Enter a valid email address.',
  )
  .transform((value) => (value.length > 0 ? value : null))

export const tenantFormSchema = z.object({
  full_name: z.string().trim().min(1, 'Full name is required.'),
  phone: optionalTextField,
  email: optionalEmailField,
  identity_notes: optionalTextField,
  emergency_contact_name: optionalTextField,
  emergency_contact_phone: optionalTextField,
  notes: optionalTextField,
})

export type TenantFormInput = z.infer<typeof tenantFormSchema>
export type TenantFormValues = z.input<typeof tenantFormSchema>
