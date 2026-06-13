import { useQuery } from '@tanstack/react-query'

import {
  getPaymentForEdit,
  paymentEditQueryKey,
} from '../infrastructure/payments-repository'

export function usePaymentEditQuery(paymentId: string | undefined) {
  return useQuery({
    queryKey: paymentEditQueryKey(paymentId),
    queryFn: () => {
      if (!paymentId) {
        return null
      }

      return getPaymentForEdit(paymentId)
    },
    enabled: Boolean(paymentId),
  })
}
