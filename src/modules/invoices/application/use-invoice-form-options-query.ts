import { useQuery } from '@tanstack/react-query'

import {
  invoiceFormOptionsQueryKey,
  listInvoiceFormOptions,
} from '../infrastructure/invoices-repository'

export function useInvoiceFormOptionsQuery() {
  return useQuery({
    queryKey: invoiceFormOptionsQueryKey,
    queryFn: listInvoiceFormOptions,
  })
}
