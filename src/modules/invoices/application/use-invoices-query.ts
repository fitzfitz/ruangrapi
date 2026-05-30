import { useQuery } from '@tanstack/react-query'

import {
  invoicesQueryKey,
  listInvoices,
} from '../infrastructure/invoices-repository'

export function useInvoicesQuery() {
  return useQuery({
    queryKey: invoicesQueryKey,
    queryFn: listInvoices,
  })
}
