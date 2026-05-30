import { useMutation, useQueryClient } from '@tanstack/react-query'

import { invoicesQueryKey } from '../../invoices'
import type { CreatePaymentInput } from '../domain/create-payment-schema'
import {
  createPayment,
  paymentFormOptionsQueryKey,
  paymentsQueryKey,
} from '../infrastructure/payments-repository'

type CreatePaymentMutationVariables = {
  organizationId: string
  input: CreatePaymentInput
}

export function useCreatePaymentMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ organizationId, input }: CreatePaymentMutationVariables) =>
      createPayment({
        organization_id: organizationId,
        ...input,
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: paymentsQueryKey }),
        queryClient.invalidateQueries({ queryKey: paymentFormOptionsQueryKey }),
        queryClient.invalidateQueries({ queryKey: invoicesQueryKey }),
      ])
    },
  })
}
