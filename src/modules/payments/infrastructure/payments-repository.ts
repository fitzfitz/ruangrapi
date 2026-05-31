import { supabaseClient } from '../../../shared/lib'
import type { CreatePaymentInput } from '../domain/create-payment-schema'
import type {
  PayableInvoiceStatus,
  Payment,
  PaymentListItem,
  PaymentMethod,
} from '../domain/payment'

export const paymentsQueryKey = ['payments'] as const
export const paymentFormOptionsQueryKey = [
  ...paymentsQueryKey,
  'form-options',
] as const

const payableInvoiceStatuses = ['unpaid', 'partially_paid', 'overdue'] as const

const paymentListSelectColumns = `
  id,
  organization_id,
  invoice_id,
  amount,
  payment_date,
  payment_method,
  reference_number,
  notes,
  created_at,
  updated_at,
  receipt:receipts (
    id,
    receipt_number,
    issued_at
  ),
  invoices (
    billing_period,
    status,
    tenants (
      full_name
    ),
    units (
      name,
      properties (
        name
      )
    )
  )
`

type PaymentReceiptRow = {
  id: string
  receipt_number: string
  issued_at: string
}

type PaymentListRow = {
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
  receipt: PaymentReceiptRow | null
  invoices: {
    billing_period: string
    status: string
    tenants: { full_name: string } | null
    units: { name: string; properties: { name: string } | null } | null
  } | null
}

export type PaymentInvoiceOption = {
  id: string
  organization_id: string
  billing_period: string
  due_date: string | null
  total_amount: number
  status: PayableInvoiceStatus
  tenant_name: string
  unit_name: string
  property_name: string | null
  paid_amount: number
  remaining_amount: number
}

export type PaymentFormOptions = {
  invoices: PaymentInvoiceOption[]
}

type PaymentInvoiceOptionRow = {
  id: string
  organization_id: string
  billing_period: string
  due_date: string | null
  total_amount: number
  status: PayableInvoiceStatus
  tenants: { full_name: string } | null
  units: { name: string; properties: { name: string } | null } | null
  payments: { amount: number }[] | null
}

type CreatePaymentRecord = CreatePaymentInput & {
  organization_id: string
}

const paymentSelectColumns =
  'id, organization_id, invoice_id, amount, payment_date, payment_method, reference_number, notes, created_at, updated_at'

function mapPaymentListRow(row: PaymentListRow): PaymentListItem {
  const receipt = row.receipt

  return {
    id: row.id,
    organization_id: row.organization_id,
    invoice_id: row.invoice_id,
    amount: row.amount,
    payment_date: row.payment_date,
    payment_method: row.payment_method,
    reference_number: row.reference_number,
    notes: row.notes,
    created_at: row.created_at,
    updated_at: row.updated_at,
    tenant_name: row.invoices?.tenants?.full_name ?? 'Unknown tenant',
    unit_name: row.invoices?.units?.name ?? 'Unknown unit',
    property_name: row.invoices?.units?.properties?.name ?? null,
    invoice_billing_period:
      row.invoices?.billing_period ?? `${row.payment_date.slice(0, 7)}-01`,
    invoice_status: row.invoices?.status ?? 'unknown',
    receipt_id: receipt?.id ?? null,
    receipt_number: receipt?.receipt_number ?? null,
    receipt_issued_at: receipt?.issued_at ?? null,
  }
}

function sumPaymentAmounts(payments: { amount: number }[] | null) {
  return payments?.reduce((total, payment) => total + payment.amount, 0) ?? 0
}

function mapPaymentInvoiceOptionRow(
  row: PaymentInvoiceOptionRow,
): PaymentInvoiceOption {
  const paidAmount = sumPaymentAmounts(row.payments)
  const remainingAmount = Math.max(row.total_amount - paidAmount, 0)

  return {
    id: row.id,
    organization_id: row.organization_id,
    billing_period: row.billing_period,
    due_date: row.due_date,
    total_amount: row.total_amount,
    status: row.status,
    tenant_name: row.tenants?.full_name ?? 'Unknown tenant',
    unit_name: row.units?.name ?? 'Unknown unit',
    property_name: row.units?.properties?.name ?? null,
    paid_amount: paidAmount,
    remaining_amount: remainingAmount,
  }
}

export async function listPayments(): Promise<PaymentListItem[]> {
  const { data, error } = await supabaseClient
    .from('payments')
    .select(paymentListSelectColumns)
    .order('payment_date', { ascending: false })
    .order('created_at', { ascending: false })
    .returns<PaymentListRow[]>()

  if (error !== null) {
    throw new Error(`Could not load payments: ${error.message}`)
  }

  return data.map(mapPaymentListRow)
}

export async function listPaymentFormOptions(): Promise<PaymentFormOptions> {
  const { data, error } = await supabaseClient
    .from('invoices')
    .select(
      `
        id,
        organization_id,
        billing_period,
        due_date,
        total_amount,
        status,
        tenants (
          full_name
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
      `,
    )
    .in('status', [...payableInvoiceStatuses])
    .order('billing_period', { ascending: false })
    .returns<PaymentInvoiceOptionRow[]>()

  if (error !== null) {
    throw new Error(`Could not load payable invoices: ${error.message}`)
  }

  return {
    invoices: data
      .map(mapPaymentInvoiceOptionRow)
      .filter((invoice) => invoice.remaining_amount > 0),
  }
}

async function getPayableInvoiceOption({
  organization_id,
  invoice_id,
}: Pick<
  CreatePaymentRecord,
  'organization_id' | 'invoice_id'
>): Promise<PaymentInvoiceOption | null> {
  const { data, error } = await supabaseClient
    .from('invoices')
    .select(
      `
        id,
        organization_id,
        billing_period,
        due_date,
        total_amount,
        status,
        tenants (
          full_name
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
      `,
    )
    .eq('id', invoice_id)
    .eq('organization_id', organization_id)
    .in('status', [...payableInvoiceStatuses])
    .maybeSingle<PaymentInvoiceOptionRow>()

  if (error !== null) {
    throw new Error(`Could not validate payable invoice: ${error.message}`)
  }

  return data === null ? null : mapPaymentInvoiceOptionRow(data)
}

export async function createPayment({
  organization_id,
  invoice_id,
  amount,
  payment_date,
  payment_method,
  reference_number,
  notes,
}: CreatePaymentRecord): Promise<Payment> {
  const invoice = await getPayableInvoiceOption({
    organization_id,
    invoice_id,
  })

  if (invoice === null) {
    throw new Error(
      'Payment invoice must be payable and belong to this organization.',
    )
  }

  if (amount > invoice.remaining_amount) {
    throw new Error('Payment amount cannot exceed the invoice remaining balance.')
  }

  const { data, error } = await supabaseClient
    .from('payments')
    .insert({
      organization_id,
      invoice_id,
      amount,
      payment_date,
      payment_method,
      reference_number,
      notes,
    })
    .select(paymentSelectColumns)
    .single<Payment>()

  if (error !== null) {
    throw new Error(`Could not record payment: ${error.message}`)
  }

  const newPaidAmount = invoice.paid_amount + amount
  const nextStatus =
    newPaidAmount >= invoice.total_amount ? 'paid' : 'partially_paid'

  const { data: updatedInvoice, error: invoiceError } = await supabaseClient
    .from('invoices')
    .update({ status: nextStatus })
    .eq('id', invoice.id)
    .eq('organization_id', organization_id)
    .in('status', [...payableInvoiceStatuses])
    .select('id')
    .maybeSingle<{ id: string }>()

  if (invoiceError !== null) {
    throw new Error(
      `Payment was recorded, but invoice status update failed: ${invoiceError.message}`,
    )
  }

  if (updatedInvoice === null) {
    throw new Error(
      'Payment was recorded, but invoice status could not be updated because the invoice is no longer payable.',
    )
  }

  return data
}
