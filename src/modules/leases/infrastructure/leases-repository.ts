import { supabaseClient } from '../../../shared/lib'
import type { LeaseListItem, LeaseStatus } from '../domain/lease'

export const leasesQueryKey = ['leases'] as const

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
