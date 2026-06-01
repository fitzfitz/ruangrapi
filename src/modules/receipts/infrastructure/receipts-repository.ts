import { supabaseClient } from '../../../shared/lib'
import type { Receipt, ReceiptDetail, ReceiptListItem } from '../domain/receipt'

export const receiptsQueryKey = ['receipts'] as const

export function receiptQueryKey(receiptId: string) {
  return [...receiptsQueryKey, receiptId] as const
}

export type CreateReceiptFromPaymentInput = {
  organization_id: string
  payment_id: string
}

const receiptSelectColumns =
  'id, organization_id, payment_id, receipt_number, issued_at, created_at, updated_at'

const receiptSummarySelectColumns = `
  id,
  organization_id,
  payment_id,
  receipt_number,
  issued_at,
  created_at,
  updated_at,
  payments (
    amount,
    payment_date,
    payment_method,
    reference_number,
    notes,
    invoices (
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
      )
    )
  )
`

type ReceiptSummaryRow = Receipt & {
  payments: {
    amount: number
    payment_date: string
    payment_method: string
    reference_number: string | null
    notes: string | null
    invoices: {
      billing_period: string
      due_date: string | null
      total_amount: number
      status: string
      tenants: { full_name: string } | null
      units: { name: string; properties: { name: string } | null } | null
    } | null
  } | null
}

function mapReceiptListRow(row: ReceiptSummaryRow): ReceiptListItem {
  const payment = row.payments
  const invoice = payment?.invoices

  return {
    id: row.id,
    organization_id: row.organization_id,
    payment_id: row.payment_id,
    receipt_number: row.receipt_number,
    issued_at: row.issued_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
    payment_amount: payment?.amount ?? 0,
    payment_date: payment?.payment_date ?? row.issued_at.slice(0, 10),
    payment_method: payment?.payment_method ?? 'unknown',
    payment_reference_number: payment?.reference_number ?? null,
    invoice_billing_period:
      invoice?.billing_period ?? row.issued_at.slice(0, 7),
    invoice_status: invoice?.status ?? 'unknown',
    tenant_name: invoice?.tenants?.full_name ?? 'Unknown tenant',
    unit_name: invoice?.units?.name ?? 'Unknown unit',
    property_name: invoice?.units?.properties?.name ?? null,
  }
}

function mapReceiptDetailRow(row: ReceiptSummaryRow): ReceiptDetail {
  const payment = row.payments
  const invoice = payment?.invoices

  return {
    ...mapReceiptListRow(row),
    payment_notes: payment?.notes ?? null,
    invoice_total_amount: invoice?.total_amount ?? 0,
    invoice_due_date: invoice?.due_date ?? null,
  }
}

export async function listReceipts(): Promise<ReceiptListItem[]> {
  const { data, error } = await supabaseClient
    .from('receipts')
    .select(receiptSummarySelectColumns)
    .order('issued_at', { ascending: false })
    .returns<ReceiptSummaryRow[]>()

  if (error !== null) {
    throw new Error(`Could not load receipts: ${error.message}`)
  }

  return data.map(mapReceiptListRow)
}

export async function getReceipt(
  receiptId: string,
): Promise<ReceiptDetail | null> {
  const { data, error } = await supabaseClient
    .from('receipts')
    .select(receiptSummarySelectColumns)
    .eq('id', receiptId)
    .maybeSingle<ReceiptSummaryRow>()

  if (error !== null) {
    throw new Error(`Could not load receipt: ${error.message}`)
  }

  return data === null ? null : mapReceiptDetailRow(data)
}

export async function createReceiptFromPayment({
  organization_id,
  payment_id,
}: CreateReceiptFromPaymentInput): Promise<Receipt> {
  const { data: payment, error: paymentError } = await supabaseClient
    .from('payments')
    .select('id')
    .eq('id', payment_id)
    .eq('organization_id', organization_id)
    .maybeSingle<{ id: string }>()

  if (paymentError !== null) {
    throw new Error(
      `Could not validate receipt payment: ${paymentError.message}`,
    )
  }

  if (payment === null) {
    throw new Error('Receipt payment must belong to this organization.')
  }

  const { data, error } = await supabaseClient
    .from('receipts')
    .insert({
      organization_id,
      payment_id,
    })
    .select(receiptSelectColumns)
    .single<Receipt>()

  if (error !== null) {
    throw new Error(`Could not generate receipt: ${error.message}`)
  }

  return data
}
