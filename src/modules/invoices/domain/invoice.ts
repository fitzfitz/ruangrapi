export type InvoiceStatus =
  | 'draft'
  | 'unpaid'
  | 'partially_paid'
  | 'paid'
  | 'overdue'
  | 'cancelled'

export type InvoiceLineItemType = 'rent' | 'utility' | 'other'

export type Invoice = {
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
}

export type InvoiceLineItem = {
  id: string
  organization_id: string
  invoice_id: string
  description: string
  line_type: InvoiceLineItemType
  quantity: number
  unit_amount: number
  total_amount: number
  sort_order: number
  created_at: string
  updated_at: string
}

export type InvoiceListItem = Invoice & {
  tenant_name: string
  unit_name: string
  property_name: string | null
  lease_start_date: string
  lease_end_date: string | null
}
