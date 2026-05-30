import { supabaseClient } from '../../../shared/lib'
import type { Tenant } from '../domain/tenant'

export const tenantsQueryKey = ['tenants'] as const

export function tenantQueryKey(tenantId: string) {
  return [...tenantsQueryKey, tenantId] as const
}

const tenantSelectColumns =
  'id, organization_id, full_name, phone, email, identity_notes, emergency_contact_name, emergency_contact_phone, notes, created_at, updated_at'

export async function listTenants(): Promise<Tenant[]> {
  const { data, error } = await supabaseClient
    .from('tenants')
    .select(tenantSelectColumns)
    .order('created_at', { ascending: false })
    .returns<Tenant[]>()

  if (error !== null) {
    throw new Error(`Could not load tenants: ${error.message}`)
  }

  return data
}
