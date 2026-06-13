import { useMutation, useQueryClient } from '@tanstack/react-query'

import { invoicesQueryKey } from '../../invoices'
import type { EditPaymentInput } from '../domain/edit-payment-schema'
import {
  paymentEditQueryKey,
  paymentFormOptionsQueryKey,
  paymentsQueryKey,
  updatePayment,
} from '../infrastructure/payments-repository'

type UpdatePaymentMutationVariables = {
  organizationId: string
  paymentId: string
  input: EditPaymentInput
}

export function useUpdatePaymentMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      organizationId,
      paymentId,
      input,
    }: UpdatePaymentMutationVariables) =>
      updatePayment({
        organization_id: organizationId,
        payment_id: paymentId,
        ...input,
      }),
    onSuccess: async (_payment, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: paymentsQueryKey }),
        queryClient.invalidateQueries({
          queryKey: paymentEditQueryKey(variables.paymentId),
        }),
        queryClient.invalidateQueries({
          queryKey: paymentFormOptionsQueryKey,
        }),
        queryClient.invalidateQueries({ queryKey: invoicesQueryKey }),
      ])
    },
  })
}
