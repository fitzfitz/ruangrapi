export type PaymentMethod = 'cash' | 'bank_transfer' | 'e_wallet' | 'other'

export type Payment = {
  id: string
  organization_id: string
  invoice_id: string
  amount: number
  payment_date: string
  payment_method: PaymentMethod
  reference_number: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type PaymentListItem = Payment & {
  tenant_name: string
  unit_name: string
  property_name: string | null
  invoice_billing_period: string
  invoice_status: string
}

export type PayableInvoiceStatus = 'unpaid' | 'partially_paid' | 'overdue'
