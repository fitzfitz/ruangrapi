export type Receipt = {
  id: string
  organization_id: string
  payment_id: string
  receipt_number: string
  issued_at: string
  created_at: string
  updated_at: string
}

export type ReceiptListItem = Receipt & {
  payment_amount: number
  payment_date: string
  payment_method: string
  payment_reference_number: string | null
  invoice_billing_period: string
  invoice_status: string
  tenant_name: string
  unit_name: string
  property_name: string | null
}

export type ReceiptDetail = ReceiptListItem & {
  payment_notes: string | null
  invoice_total_amount: number
  invoice_due_date: string | null
}
