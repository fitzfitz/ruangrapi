import { supabaseClient } from '../../../shared/lib'
import type { Receipt } from '../domain/receipt'

export type CreateReceiptFromPaymentInput = {
  organization_id: string
  payment_id: string
}

const receiptSelectColumns =
  'id, organization_id, payment_id, receipt_number, issued_at, created_at, updated_at'

export async function createReceiptFromPayment({
  organization_id,
  payment_id,
}: CreateReceiptFromPaymentInput): Promise<Receipt> {
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
