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
  receipt_id: string | null
  receipt_number: string | null
  receipt_issued_at: string | null
}

export type PayableInvoiceStatus = 'unpaid' | 'partially_paid' | 'overdue'

export type PaymentEditInvoiceContext = {
  id: string
  billing_period: string
  total_amount: number
  status: string
  tenant_name: string
  unit_name: string
  property_name: string | null
  paid_amount: number
  other_paid_amount: number
  editable_remaining_amount: number
}

export type PaymentEditDetail = Payment & {
  receipt_id: string | null
  receipt_number: string | null
  receipt_issued_at: string | null
  invoice: PaymentEditInvoiceContext
}
