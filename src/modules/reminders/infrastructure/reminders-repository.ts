import { supabaseClient } from '../../../shared/lib'
import type {
  CreateReminderInput,
  Reminder,
  ReminderFormOptions,
  ReminderInvoiceOption,
  ReminderListItem,
  ReminderStatus,
  UpdateReminderStatusInput,
} from '../domain/reminder'

export const remindersQueryKey = ['reminders'] as const
export const reminderFormOptionsQueryKey = [
  ...remindersQueryKey,
  'form-options',
] as const

export const payableInvoiceStatuses = [
  'unpaid',
  'partially_paid',
  'overdue',
] as const
const queueReminderStatuses = ['prepared', 'sent'] as const

const reminderSelectColumns = `
  id,
  organization_id,
  invoice_id,
  tenant_id,
  channel,
  message,
  status,
  cancelled_at,
  created_at,
  updated_at,
  invoices (
    billing_period,
    due_date,
    total_amount,
    status,
    tenants (
      full_name,
      phone
    ),
    units (
      name,
      properties (
        name
      )
    )
  )
`

const reminderInvoiceOptionSelectColumns = `
  id,
  organization_id,
  tenant_id,
  billing_period,
  due_date,
  total_amount,
  status,
  tenants (
    full_name,
    phone
  ),
  units (
    name,
    properties (
      name
    )
  ),
  payments (
    amount
  )
`

const reminderBaseSelectColumns =
  'id, organization_id, invoice_id, tenant_id, channel, message, status, cancelled_at, created_at, updated_at'

type ReminderRow = Reminder & {
  invoices: {
    billing_period: string
    due_date: string | null
    total_amount: number
    status: string
    tenants: { full_name: string; phone: string | null } | null
    units: { name: string; properties: { name: string } | null } | null
  } | null
}

type ReminderInvoiceOptionRow = {
  id: string
  organization_id: string
  tenant_id: string
  billing_period: string
  due_date: string | null
  total_amount: number
  status: string
  tenants: { full_name: string; phone: string | null } | null
  units: { name: string; properties: { name: string } | null } | null
  payments: { amount: number }[] | null
}

type ReminderInvoiceValidationRow = {
  id: string
  organization_id: string
  tenant_id: string
  total_amount: number
  payments: { amount: number }[] | null
}

function formatBillingPeriod(value: string) {
  const [year, month] = value.split('-').map(Number)

  return new Intl.DateTimeFormat('id-ID', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(year, month - 1, 1))
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDueDate(value: string | null) {
  if (value === null) {
    return 'saat memungkinkan'
  }

  const [year, month, day] = value.split('-').map(Number)

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(year, month - 1, day))
}

function formatUnitProperty(unitName: string, propertyName: string | null) {
  return propertyName === null ? unitName : `${unitName} - ${propertyName}`
}

function sumPaymentAmounts(payments: { amount: number }[] | null) {
  return payments?.reduce((total, payment) => total + payment.amount, 0) ?? 0
}

export function normalizeWhatsAppPhone(phone: string | null) {
  const digits = phone?.replace(/\D/g, '') ?? ''

  if (digits.length === 0) {
    return null
  }

  if (digits.startsWith('0')) {
    return `62${digits.slice(1)}`
  }

  return digits
}

export function buildWhatsAppUrl(phone: string | null, message: string) {
  const normalizedPhone = normalizeWhatsAppPhone(phone)

  if (normalizedPhone === null) {
    return null
  }

  return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(message)}`
}

export function generateReminderMessage(invoice: {
  tenant_name: string
  unit_name: string
  property_name: string | null
  billing_period: string
  due_date: string | null
  remaining_amount: number
}) {
  const placeName = formatUnitProperty(invoice.unit_name, invoice.property_name)
  const dueText =
    invoice.due_date === null
      ? 'Mohon melakukan pembayaran saat memungkinkan.'
      : `Mohon melakukan pembayaran sebelum/sekitar ${formatDueDate(
          invoice.due_date,
        )}.`

  return `Halo ${invoice.tenant_name}, ini pengingat pembayaran untuk ${placeName} periode ${formatBillingPeriod(
    invoice.billing_period,
  )}. Sisa tagihan adalah ${formatCurrency(
    invoice.remaining_amount,
  )}. ${dueText} Terima kasih.`
}

function mapReminderRow(row: ReminderRow): ReminderListItem {
  const invoice = row.invoices
  const tenant = invoice?.tenants
  const unit = invoice?.units

  return {
    id: row.id,
    organization_id: row.organization_id,
    invoice_id: row.invoice_id,
    tenant_id: row.tenant_id,
    channel: row.channel,
    message: row.message,
    status: row.status,
    cancelled_at: row.cancelled_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
    invoice_billing_period:
      invoice?.billing_period ?? row.created_at.slice(0, 7),
    invoice_due_date: invoice?.due_date ?? null,
    invoice_total_amount: invoice?.total_amount ?? 0,
    invoice_status: invoice?.status ?? 'unknown',
    tenant_name: tenant?.full_name ?? 'Unknown tenant',
    tenant_phone: tenant?.phone ?? null,
    unit_name: unit?.name ?? 'Unknown unit',
    property_name: unit?.properties?.name ?? null,
    whatsapp_url: buildWhatsAppUrl(tenant?.phone ?? null, row.message),
  }
}

function mapReminderInvoiceOptionRow(
  row: ReminderInvoiceOptionRow,
): ReminderInvoiceOption {
  const paidAmount = sumPaymentAmounts(row.payments)
  const remainingAmount = Math.max(row.total_amount - paidAmount, 0)
  const tenantName = row.tenants?.full_name ?? 'Unknown tenant'
  const unitName = row.units?.name ?? 'Unknown unit'
  const propertyName = row.units?.properties?.name ?? null
  const generatedMessage = generateReminderMessage({
    tenant_name: tenantName,
    unit_name: unitName,
    property_name: propertyName,
    billing_period: row.billing_period,
    due_date: row.due_date,
    remaining_amount: remainingAmount,
  })

  return {
    id: row.id,
    organization_id: row.organization_id,
    tenant_id: row.tenant_id,
    billing_period: row.billing_period,
    due_date: row.due_date,
    total_amount: row.total_amount,
    status: row.status,
    tenant_name: tenantName,
    tenant_phone: row.tenants?.phone ?? null,
    unit_name: unitName,
    property_name: propertyName,
    paid_amount: paidAmount,
    remaining_amount: remainingAmount,
    generated_message: generatedMessage,
    whatsapp_url: buildWhatsAppUrl(
      row.tenants?.phone ?? null,
      generatedMessage,
    ),
  }
}

export async function listReminders(): Promise<ReminderListItem[]> {
  const { data, error } = await supabaseClient
    .from('reminders')
    .select(reminderSelectColumns)
    .in('status', [...queueReminderStatuses])
    .order('updated_at', { ascending: false })
    .returns<ReminderRow[]>()

  if (error !== null) {
    throw new Error(`Could not load reminders: ${error.message}`)
  }

  return data.map(mapReminderRow)
}

export async function listReminderFormOptions(): Promise<ReminderFormOptions> {
  const { data, error } = await supabaseClient
    .from('invoices')
    .select(reminderInvoiceOptionSelectColumns)
    .in('status', [...payableInvoiceStatuses])
    .order('billing_period', { ascending: false })
    .returns<ReminderInvoiceOptionRow[]>()

  if (error !== null) {
    throw new Error(`Could not load reminder invoices: ${error.message}`)
  }

  return {
    invoices: data
      .map(mapReminderInvoiceOptionRow)
      .filter((invoice) => invoice.remaining_amount > 0),
  }
}

async function getPayableReminderInvoice({
  organization_id,
  invoice_id,
}: Pick<
  CreateReminderInput,
  'organization_id' | 'invoice_id'
>): Promise<ReminderInvoiceValidationRow | null> {
  const { data, error } = await supabaseClient
    .from('invoices')
    .select(
      `
        id,
        organization_id,
        tenant_id,
        total_amount,
        payments (
          amount
        )
      `,
    )
    .eq('id', invoice_id)
    .eq('organization_id', organization_id)
    .in('status', [...payableInvoiceStatuses])
    .maybeSingle<ReminderInvoiceValidationRow>()

  if (error !== null) {
    throw new Error(`Could not validate reminder invoice: ${error.message}`)
  }

  return data
}

export async function createReminder(
  input: CreateReminderInput,
): Promise<Reminder> {
  const invoice = await getPayableReminderInvoice({
    organization_id: input.organization_id,
    invoice_id: input.invoice_id,
  })

  if (invoice === null) {
    throw new Error(
      'Reminder invoice must be payable and belong to this organization.',
    )
  }

  const paidAmount = sumPaymentAmounts(invoice.payments)
  const remainingAmount = Math.max(invoice.total_amount - paidAmount, 0)

  if (remainingAmount <= 0) {
    throw new Error('Reminder invoice must have a remaining balance.')
  }

  const { data, error } = await supabaseClient
    .from('reminders')
    .insert({
      organization_id: input.organization_id,
      invoice_id: input.invoice_id,
      tenant_id: invoice.tenant_id,
      channel: 'whatsapp',
      message: input.message,
      status: 'prepared',
    })
    .select(reminderBaseSelectColumns)
    .single<Reminder>()

  if (error !== null) {
    throw new Error(`Could not create reminder: ${error.message}`)
  }

  return data
}

export async function updateReminderStatus({
  reminder_id,
  status,
}: UpdateReminderStatusInput): Promise<Reminder> {
  const updateRecord: {
    status: ReminderStatus
    cancelled_at?: string | null
  } = {
    status,
  }

  if (status === 'cancelled') {
    updateRecord.cancelled_at = new Date().toISOString()
  } else {
    updateRecord.cancelled_at = null
  }

  const { data, error } = await supabaseClient
    .from('reminders')
    .update(updateRecord)
    .eq('id', reminder_id)
    .select(reminderBaseSelectColumns)
    .single<Reminder>()

  if (error !== null) {
    throw new Error(`Could not update reminder: ${error.message}`)
  }

  return data
}
