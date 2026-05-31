export type { Receipt } from './domain/receipt'
export { useCreateReceiptMutation } from './application/use-create-receipt-mutation'
export {
  createReceiptFromPayment,
  type CreateReceiptFromPaymentInput,
} from './infrastructure/receipts-repository'
