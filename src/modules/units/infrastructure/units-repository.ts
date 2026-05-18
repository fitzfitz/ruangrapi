import { supabaseClient } from '../../../shared/lib'
import type { CreateUnitInput } from '../domain/create-unit-schema'
import type { Unit } from '../domain/unit'
import type { UpdateUnitInput } from '../domain/update-unit-schema'

export const unitsQueryKey = ['units'] as const

export function unitsByPropertyQueryKey(propertyId: string) {
  return [...unitsQueryKey, 'by-property', propertyId] as const
}

export function unitDetailQueryKey(propertyId: string, unitId: string) {
  return [...unitsByPropertyQueryKey(propertyId), 'detail', unitId] as const
}

const unitSelectColumns =
  'id, organization_id, property_id, name, type, status, base_rent_amount, notes, created_at, updated_at'

type CreateUnitRecord = CreateUnitInput & {
  organization_id: string
  property_id: string
}

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

export async function createUnit({
  organization_id,
  property_id,
  name,
  type,
  notes,
}: CreateUnitRecord): Promise<Unit> {
  const { data, error } = await supabaseClient
    .from('units')
    .insert({
      organization_id,
      property_id,
      name,
      type,
      notes,
    })
    .select(unitSelectColumns)
    .single<Unit>()

  if (error !== null) {
    throw new Error(`Could not create unit: ${error.message}`)
  }

  return data
}

export async function getUnitById(
  propertyId: string,
  unitId: string,
): Promise<Unit | null> {
  const { data, error } = await supabaseClient
    .from('units')
    .select(unitSelectColumns)
    .eq('property_id', propertyId)
    .eq('id', unitId)
    .maybeSingle<Unit>()

  if (error !== null) {
    throw new Error(`Could not load unit: ${error.message}`)
  }

  return data
}

export async function updateUnit(
  propertyId: string,
  unitId: string,
  { name, type, notes }: UpdateUnitInput,
): Promise<Unit> {
  const { data, error } = await supabaseClient
    .from('units')
    .update({
      name,
      type,
      notes,
    })
    .eq('property_id', propertyId)
    .eq('id', unitId)
    .select(unitSelectColumns)
    .single<Unit>()

  if (error !== null) {
    throw new Error(`Could not update unit: ${error.message}`)
  }

  return data
}
