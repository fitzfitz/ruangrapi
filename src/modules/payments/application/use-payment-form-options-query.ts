import { useQuery } from '@tanstack/react-query'

import {
  listPaymentFormOptions,
  paymentFormOptionsQueryKey,
} from '../infrastructure/payments-repository'

export function usePaymentFormOptionsQuery() {
  return useQuery({
    queryKey: paymentFormOptionsQueryKey,
    queryFn: listPaymentFormOptions,
  })
}
