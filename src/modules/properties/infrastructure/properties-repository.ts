import { supabaseClient } from '../../../shared/lib'
import type { CreatePropertyInput } from '../domain/create-property-schema'
import type { Property } from '../domain/property'

export const propertiesQueryKey = ['properties'] as const

const propertySelectColumns =
  'id, organization_id, name, address, notes, created_at, updated_at'

type CreatePropertyRecord = CreatePropertyInput & {
  organization_id: string
}

export async function listProperties(): Promise<Property[]> {
  const { data, error } = await supabaseClient
    .from('properties')
    .select(propertySelectColumns)
    .order('created_at', { ascending: false })
    .returns<Property[]>()

  if (error !== null) {
    throw error
  }

  return data
}

export async function createProperty({
  organization_id,
  name,
  address,
  notes,
}: CreatePropertyRecord): Promise<Property> {
  const { data, error } = await supabaseClient
    .from('properties')
    .insert({
      organization_id,
      name,
      address,
      notes,
    })
    .select(propertySelectColumns)
    .single<Property>()

  if (error !== null) {
    throw error
  }

  return data
}
