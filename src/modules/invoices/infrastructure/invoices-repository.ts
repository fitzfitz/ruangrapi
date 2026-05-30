import { supabaseClient } from '../../../shared/lib'
import type { CreateInvoiceInput } from '../domain/create-invoice-schema'
import type { Invoice, InvoiceListItem, InvoiceStatus } from '../domain/invoice'

export const invoicesQueryKey = ['invoices'] as const
export const invoiceFormOptionsQueryKey = [
  ...invoicesQueryKey,
  'form-options',
] as const

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

const invoiceSelectColumns =
  'id, organization_id, lease_id, tenant_id, unit_id, billing_period, issued_at, due_date, subtotal_amount, total_amount, status, cancelled_at, notes, created_at, updated_at'

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

export type InvoiceLeaseOption = {
  id: string
  organization_id: string
  tenant_id: string
  unit_id: string
  start_date: string
  end_date: string | null
  monthly_rent_amount: number
  billing_day: number
  tenant_name: string
  unit_name: string
  property_name: string | null
}

export type InvoiceFormOptions = {
  leases: InvoiceLeaseOption[]
}

type InvoiceLeaseOptionRow = {
  id: string
  organization_id: string
  tenant_id: string
  unit_id: string
  start_date: string
  end_date: string | null
  monthly_rent_amount: number
  billing_day: number
  tenants: { full_name: string } | null
  units: { name: string; properties: { name: string } | null } | null
}

type CreateInvoiceRecord = CreateInvoiceInput & {
  organization_id: string
}

export type IssueInvoiceInput = {
  invoice_id: string
  organization_id: string
  due_date: string
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

function mapInvoiceLeaseOptionRow(
  row: InvoiceLeaseOptionRow,
): InvoiceLeaseOption {
  return {
    id: row.id,
    organization_id: row.organization_id,
    tenant_id: row.tenant_id,
    unit_id: row.unit_id,
    start_date: row.start_date,
    end_date: row.end_date,
    monthly_rent_amount: row.monthly_rent_amount,
    billing_day: row.billing_day,
    tenant_name: row.tenants?.full_name ?? 'Unknown tenant',
    unit_name: row.units?.name ?? 'Unknown unit',
    property_name: row.units?.properties?.name ?? null,
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

export async function listInvoiceFormOptions(): Promise<InvoiceFormOptions> {
  const { data, error } = await supabaseClient
    .from('leases')
    .select(
      `
        id,
        organization_id,
        tenant_id,
        unit_id,
        start_date,
        end_date,
        monthly_rent_amount,
        billing_day,
        tenants (
          full_name
        ),
        units (
          name,
          properties (
            name
          )
        )
      `,
    )
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .returns<InvoiceLeaseOptionRow[]>()

  if (error !== null) {
    throw new Error(`Could not load invoice leases: ${error.message}`)
  }

  return {
    leases: data.map(mapInvoiceLeaseOptionRow),
  }
}

async function getInvoiceLeaseOption({
  organization_id,
  lease_id,
}: Pick<
  CreateInvoiceRecord,
  'organization_id' | 'lease_id'
>): Promise<InvoiceLeaseOption | null> {
  const { data, error } = await supabaseClient
    .from('leases')
    .select(
      `
        id,
        organization_id,
        tenant_id,
        unit_id,
        start_date,
        end_date,
        monthly_rent_amount,
        billing_day,
        tenants (
          full_name
        ),
        units (
          name,
          properties (
            name
          )
        )
      `,
    )
    .eq('id', lease_id)
    .eq('organization_id', organization_id)
    .eq('status', 'active')
    .maybeSingle<InvoiceLeaseOptionRow>()

  if (error !== null) {
    throw new Error(`Could not validate invoice lease: ${error.message}`)
  }

  return data === null ? null : mapInvoiceLeaseOptionRow(data)
}

async function assertInvoiceDoesNotExist({
  organization_id,
  lease_id,
  billing_period,
}: Pick<
  CreateInvoiceRecord,
  'organization_id' | 'lease_id' | 'billing_period'
>) {
  const { data, error } = await supabaseClient
    .from('invoices')
    .select('id')
    .eq('organization_id', organization_id)
    .eq('lease_id', lease_id)
    .eq('billing_period', billing_period)
    .neq('status', 'cancelled')
    .limit(1)
    .maybeSingle<{ id: string }>()

  if (error !== null) {
    throw new Error(`Could not validate invoice duplicate: ${error.message}`)
  }

  if (data !== null) {
    throw new Error(
      'This lease already has an invoice for that billing period.',
    )
  }
}

export async function createDraftRentInvoice({
  organization_id,
  lease_id,
  billing_period,
  notes,
}: CreateInvoiceRecord): Promise<Invoice> {
  const lease = await getInvoiceLeaseOption({
    organization_id,
    lease_id,
  })

  if (lease === null) {
    throw new Error(
      'Invoice lease must be active and belong to this organization.',
    )
  }

  await assertInvoiceDoesNotExist({
    organization_id,
    lease_id,
    billing_period,
  })

  const { data, error } = await supabaseClient
    .from('invoices')
    .insert({
      organization_id,
      lease_id: lease.id,
      tenant_id: lease.tenant_id,
      unit_id: lease.unit_id,
      billing_period,
      subtotal_amount: lease.monthly_rent_amount,
      total_amount: lease.monthly_rent_amount,
      status: 'draft',
      notes,
    })
    .select(invoiceSelectColumns)
    .single<Invoice>()

  if (error !== null) {
    throw new Error(`Could not create invoice: ${error.message}`)
  }

  const { error: lineItemError } = await supabaseClient
    .from('invoice_line_items')
    .insert({
      organization_id,
      invoice_id: data.id,
      description: 'Monthly rent',
      line_type: 'rent',
      quantity: 1,
      unit_amount: lease.monthly_rent_amount,
      total_amount: lease.monthly_rent_amount,
      sort_order: 0,
    })

  if (lineItemError !== null) {
    throw new Error(
      `Invoice was created, but rent line item creation failed: ${lineItemError.message}`,
    )
  }

  return data
}

export async function issueInvoice({
  invoice_id,
  organization_id,
  due_date,
}: IssueInvoiceInput): Promise<Invoice> {
  const { data, error } = await supabaseClient
    .from('invoices')
    .update({
      status: 'unpaid',
      issued_at: new Date().toISOString(),
      due_date,
    })
    .eq('id', invoice_id)
    .eq('organization_id', organization_id)
    .eq('status', 'draft')
    .select(invoiceSelectColumns)
    .single<Invoice>()

  if (error !== null) {
    throw new Error(`Could not issue invoice: ${error.message}`)
  }

  return data
}
