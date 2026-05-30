import { supabaseClient } from '../../../shared/lib'
import type { InvoiceListItem, InvoiceStatus } from '../domain/invoice'

export const invoicesQueryKey = ['invoices'] as const

const invoiceListSelectColumns = `
  id,
  organization_id,
  lease_id,
  tenant_id,
  unit_id,
  billing_period,
  issued_at,
  due_date,
  subtotal_amount,
  total_amount,
  status,
  cancelled_at,
  notes,
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
  ),
  leases (
    start_date,
    end_date
  )
`

type InvoiceListRow = {
  id: string
  organization_id: string
  lease_id: string
  tenant_id: string
  unit_id: string
  billing_period: string
  issued_at: string | null
  due_date: string | null
  subtotal_amount: number
  total_amount: number
  status: InvoiceStatus
  cancelled_at: string | null
  notes: string | null
  created_at: string
  updated_at: string
  tenants: { full_name: string } | null
  units: { name: string; properties: { name: string } | null } | null
  leases: { start_date: string; end_date: string | null } | null
}

function mapInvoiceListRow(row: InvoiceListRow): InvoiceListItem {
  return {
    id: row.id,
    organization_id: row.organization_id,
    lease_id: row.lease_id,
    tenant_id: row.tenant_id,
    unit_id: row.unit_id,
    billing_period: row.billing_period,
    issued_at: row.issued_at,
    due_date: row.due_date,
    subtotal_amount: row.subtotal_amount,
    total_amount: row.total_amount,
    status: row.status,
    cancelled_at: row.cancelled_at,
    notes: row.notes,
    created_at: row.created_at,
    updated_at: row.updated_at,
    tenant_name: row.tenants?.full_name ?? 'Unknown tenant',
    unit_name: row.units?.name ?? 'Unknown unit',
    property_name: row.units?.properties?.name ?? null,
    lease_start_date: row.leases?.start_date ?? row.billing_period,
    lease_end_date: row.leases?.end_date ?? null,
  }
}

export async function listInvoices(): Promise<InvoiceListItem[]> {
  const { data, error } = await supabaseClient
    .from('invoices')
    .select(invoiceListSelectColumns)
    .order('created_at', { ascending: false })
    .returns<InvoiceListRow[]>()

  if (error !== null) {
    throw new Error(`Could not load invoices: ${error.message}`)
  }

  return data.map(mapInvoiceListRow)
}
