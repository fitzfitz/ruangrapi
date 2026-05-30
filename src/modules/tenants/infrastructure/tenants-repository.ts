import { supabaseClient } from '../../../shared/lib'
import type { Tenant } from '../domain/tenant'
import type { TenantFormInput } from '../domain/tenant-form-schema'

export const tenantsQueryKey = ['tenants'] as const

export function tenantQueryKey(tenantId: string) {
  return [...tenantsQueryKey, tenantId] as const
}

const tenantSelectColumns =
  'id, organization_id, full_name, phone, email, identity_notes, emergency_contact_name, emergency_contact_phone, notes, created_at, updated_at'

type CreateTenantRecord = TenantFormInput & {
  organization_id: string
}

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

export async function createTenant({
  organization_id,
  full_name,
  phone,
  email,
  identity_notes,
  emergency_contact_name,
  emergency_contact_phone,
  notes,
}: CreateTenantRecord): Promise<Tenant> {
  const { data, error } = await supabaseClient
    .from('tenants')
    .insert({
      organization_id,
      full_name,
      phone,
      email,
      identity_notes,
      emergency_contact_name,
      emergency_contact_phone,
      notes,
    })
    .select(tenantSelectColumns)
    .single<Tenant>()

  if (error !== null) {
    throw new Error(`Could not create tenant: ${error.message}`)
  }

  return data
}
