export type ReminderChannel = 'whatsapp' | 'manual'

export type ReminderStatus = 'draft' | 'prepared' | 'sent' | 'cancelled'

export type Reminder = {
  id: string
  organization_id: string
  invoice_id: string
  tenant_id: string
  channel: ReminderChannel
  message: string
  status: ReminderStatus
  cancelled_at: string | null
  created_at: string
  updated_at: string
}

export type ReminderListItem = Reminder & {
  invoice_billing_period: string
  invoice_due_date: string | null
  invoice_total_amount: number
  invoice_status: string
  tenant_name: string
  tenant_phone: string | null
  unit_name: string
  property_name: string | null
  whatsapp_url: string | null
}

export type ReminderInvoiceOption = {
  id: string
  organization_id: string
  tenant_id: string
  billing_period: string
  due_date: string | null
  total_amount: number
  status: string
  tenant_name: string
  tenant_phone: string | null
  unit_name: string
  property_name: string | null
  paid_amount: number
  remaining_amount: number
  generated_message: string
  whatsapp_url: string | null
}

export type ReminderFormOptions = {
  invoices: ReminderInvoiceOption[]
}

export type CreateReminderInput = {
  organization_id: string
  invoice_id: string
  message: string
}

export type UpdateReminderStatusInput = {
  reminder_id: string
  status: Extract<ReminderStatus, 'prepared' | 'sent' | 'cancelled'>
}
