import { supabaseClient } from '../../../shared/lib'
import type { Unit } from '../domain/unit'

export const unitsQueryKey = ['units'] as const

export function unitsByPropertyQueryKey(propertyId: string) {
  return [...unitsQueryKey, 'by-property', propertyId] as const
}

const unitSelectColumns =
  'id, organization_id, property_id, name, type, status, base_rent_amount, notes, created_at, updated_at'

export async function listUnitsByProperty(propertyId: string): Promise<Unit[]> {
  const { data, error } = await supabaseClient
    .from('units')
    .select(unitSelectColumns)
    .eq('property_id', propertyId)
    .order('name', { ascending: true })
    .returns<Unit[]>()

  if (error !== null) {
    throw new Error(`Could not load units for property: ${error.message}`)
  }

  return data
}
