import { useMutation, useQueryClient } from '@tanstack/react-query'

import { paymentsQueryKey } from '../../payments'
import {
  createReceiptFromPayment,
  type CreateReceiptFromPaymentInput,
} from '../infrastructure/receipts-repository'

export function useCreateReceiptMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateReceiptFromPaymentInput) =>
      createReceiptFromPayment(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: paymentsQueryKey })
    },
  })
}
