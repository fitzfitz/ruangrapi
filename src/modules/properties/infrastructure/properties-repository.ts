import { supabaseClient } from '../../../shared/lib'
import type { Property } from '../domain/property'

export const propertiesQueryKey = ['properties'] as const

export async function listProperties(): Promise<Property[]> {
  const { data, error } = await supabaseClient
    .from('properties')
    .select('id, organization_id, name, address, notes, created_at, updated_at')
    .order('created_at', { ascending: false })
    .returns<Property[]>()

  if (error !== null) {
    throw error
  }

  return data
}
