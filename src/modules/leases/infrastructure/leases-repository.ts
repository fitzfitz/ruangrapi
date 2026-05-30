import { supabaseClient } from '../../../shared/lib'
import type { CreateLeaseInput } from '../domain/create-lease-schema'
import type { LeaseListItem, LeaseStatus } from '../domain/lease'
import type { Lease } from '../domain/lease'

export const leasesQueryKey = ['leases'] as const
export const leaseFormOptionsQueryKey = ['leases', 'form-options'] as const

const leaseListSelectColumns = `
  id,
  organization_id,
  tenant_id,
  unit_id,
  start_date,
  end_date,
  monthly_rent_amount,
  billing_day,
  deposit_amount,
  status,
  cancelled_at,
  created_at,
  updated_at,
  tenants (
    full_name
  ),
  units (
    name,
    properties (
      name
    )
  )
`

const leaseSelectColumns =
  'id, organization_id, tenant_id, unit_id, start_date, end_date, monthly_rent_amount, billing_day, deposit_amount, status, cancelled_at, created_at, updated_at'

type LeaseListRow = {
  id: string
  organization_id: string
  tenant_id: string
  unit_id: string
  start_date: string
  end_date: string | null
  monthly_rent_amount: number
  billing_day: number
  deposit_amount: number | null
  status: LeaseStatus
  cancelled_at: string | null
  created_at: string
  updated_at: string
  tenants: { full_name: string } | null
  units: { name: string; properties: { name: string } | null } | null
}

export type LeaseTenantOption = {
  id: string
  full_name: string
}

export type LeaseUnitOption = {
  id: string
  name: string
  property_name: string | null
}

export type LeaseFormOptions = {
  tenants: LeaseTenantOption[]
  units: LeaseUnitOption[]
}

type LeaseUnitOptionRow = {
  id: string
  name: string
  properties: { name: string } | null
}

type ActiveLeaseReferenceRow = {
  tenant_id: string
  unit_id: string
}

type CreateLeaseRecord = CreateLeaseInput & {
  organization_id: string
}

function mapLeaseListRow(row: LeaseListRow): LeaseListItem {
  return {
    id: row.id,
    organization_id: row.organization_id,
    tenant_id: row.tenant_id,
    unit_id: row.unit_id,
    start_date: row.start_date,
    end_date: row.end_date,
    monthly_rent_amount: row.monthly_rent_amount,
    billing_day: row.billing_day,
    deposit_amount: row.deposit_amount,
    status: row.status,
    cancelled_at: row.cancelled_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
    tenant_name: row.tenants?.full_name ?? 'Unknown tenant',
    unit_name: row.units?.name ?? 'Unknown unit',
    property_name: row.units?.properties?.name ?? null,
  }
}

function mapLeaseUnitOptionRow(row: LeaseUnitOptionRow): LeaseUnitOption {
  return {
    id: row.id,
    name: row.name,
    property_name: row.properties?.name ?? null,
  }
}

export async function listLeases(): Promise<LeaseListItem[]> {
  const { data, error } = await supabaseClient
    .from('leases')
    .select(leaseListSelectColumns)
    .order('created_at', { ascending: false })
    .returns<LeaseListRow[]>()

  if (error !== null) {
    throw new Error(`Could not load leases: ${error.message}`)
  }

  return data.map(mapLeaseListRow)
}

export async function listLeaseFormOptions(): Promise<LeaseFormOptions> {
  const [tenantsResult, unitsResult, activeLeasesResult] = await Promise.all([
    supabaseClient
      .from('tenants')
      .select('id, full_name')
      .order('full_name', { ascending: true })
      .returns<LeaseTenantOption[]>(),
    supabaseClient
      .from('units')
      .select(
        `
          id,
          name,
          properties (
            name
          )
        `,
      )
      .order('name', { ascending: true })
      .returns<LeaseUnitOptionRow[]>(),
    supabaseClient
      .from('leases')
      .select('tenant_id, unit_id')
      .eq('status', 'active')
      .returns<ActiveLeaseReferenceRow[]>(),
  ])

  if (tenantsResult.error !== null) {
    throw new Error(
      `Could not load lease tenants: ${tenantsResult.error.message}`,
    )
  }

  if (unitsResult.error !== null) {
    throw new Error(`Could not load lease units: ${unitsResult.error.message}`)
  }

  if (activeLeasesResult.error !== null) {
    throw new Error(
      `Could not load active leases: ${activeLeasesResult.error.message}`,
    )
  }

  const tenantIdsWithActiveLeases = new Set(
    activeLeasesResult.data.map((lease) => lease.tenant_id),
  )
  const unitIdsWithActiveLeases = new Set(
    activeLeasesResult.data.map((lease) => lease.unit_id),
  )

  return {
    tenants: tenantsResult.data.filter(
      (tenant) => !tenantIdsWithActiveLeases.has(tenant.id),
    ),
    units: unitsResult.data
      .filter((unit) => !unitIdsWithActiveLeases.has(unit.id))
      .map(mapLeaseUnitOptionRow),
  }
}

async function assertLeaseReferencesAreAvailable({
  organization_id,
  tenant_id,
  unit_id,
}: Pick<CreateLeaseRecord, 'organization_id' | 'tenant_id' | 'unit_id'>) {
  const [tenantResult, unitResult, activeLeaseResult] = await Promise.all([
    supabaseClient
      .from('tenants')
      .select('id')
      .eq('id', tenant_id)
      .eq('organization_id', organization_id)
      .maybeSingle<{ id: string }>(),
    supabaseClient
      .from('units')
      .select('id')
      .eq('id', unit_id)
      .eq('organization_id', organization_id)
      .maybeSingle<{ id: string }>(),
    supabaseClient
      .from('leases')
      .select('id')
      .eq('organization_id', organization_id)
      .eq('status', 'active')
      .or(`tenant_id.eq.${tenant_id},unit_id.eq.${unit_id}`)
      .limit(1)
      .maybeSingle<{ id: string }>(),
  ])

  if (tenantResult.error !== null) {
    throw new Error(
      `Could not validate lease tenant: ${tenantResult.error.message}`,
    )
  }

  if (unitResult.error !== null) {
    throw new Error(
      `Could not validate lease unit: ${unitResult.error.message}`,
    )
  }

  if (activeLeaseResult.error !== null) {
    throw new Error(
      `Could not validate active lease conflicts: ${activeLeaseResult.error.message}`,
    )
  }

  if (tenantResult.data === null || unitResult.data === null) {
    throw new Error('Lease tenant and unit must belong to this organization.')
  }

  if (activeLeaseResult.data !== null) {
    throw new Error('Tenant or unit already has an active lease.')
  }
}

export async function createLease({
  organization_id,
  tenant_id,
  unit_id,
  start_date,
  end_date,
  monthly_rent_amount,
  billing_day,
  deposit_amount,
}: CreateLeaseRecord): Promise<Lease> {
  await assertLeaseReferencesAreAvailable({
    organization_id,
    tenant_id,
    unit_id,
  })

  const { data, error } = await supabaseClient
    .from('leases')
    .insert({
      organization_id,
      tenant_id,
      unit_id,
      start_date,
      end_date,
      monthly_rent_amount,
      billing_day,
      deposit_amount,
    })
    .select(leaseSelectColumns)
    .single<Lease>()

  if (error !== null) {
    throw new Error(`Could not create lease: ${error.message}`)
  }

  return data
}
