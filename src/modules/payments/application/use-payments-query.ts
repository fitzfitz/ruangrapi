import { useQuery } from '@tanstack/react-query'

import {
  listPayments,
  paymentsQueryKey,
} from '../infrastructure/payments-repository'

export function usePaymentsQuery() {
  return useQuery({
    queryKey: paymentsQueryKey,
    queryFn: listPayments,
  })
}
