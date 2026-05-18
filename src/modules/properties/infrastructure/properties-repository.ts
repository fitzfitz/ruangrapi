import { supabaseClient } from '../../../shared/lib'
import type { CreatePropertyInput } from '../domain/create-property-schema'
import type { Property } from '../domain/property'
import type { UpdatePropertyInput } from '../domain/update-property-schema'

export const propertiesQueryKey = ['properties'] as const

export function propertyQueryKey(propertyId: string) {
  return [...propertiesQueryKey, propertyId] as const
}

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

export async function getPropertyById(
  propertyId: string,
): Promise<Property | null> {
  const { data, error } = await supabaseClient
    .from('properties')
    .select(propertySelectColumns)
    .eq('id', propertyId)
    .maybeSingle<Property>()

  if (error !== null) {
    throw new Error(`Could not load property: ${error.message}`)
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

export async function updateProperty(
  propertyId: string,
  { name, address, notes }: UpdatePropertyInput,
): Promise<Property> {
  const { data, error } = await supabaseClient
    .from('properties')
    .update({
      name,
      address,
      notes,
    })
    .eq('id', propertyId)
    .select(propertySelectColumns)
    .single<Property>()

  if (error !== null) {
    throw new Error(`Could not update property: ${error.message}`)
  }

  return data
}
