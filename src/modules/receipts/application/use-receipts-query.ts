import { useQuery } from '@tanstack/react-query'

import {
  listReceipts,
  receiptsQueryKey,
} from '../infrastructure/receipts-repository'

export function useReceiptsQuery() {
  return useQuery({
    queryKey: receiptsQueryKey,
    queryFn: listReceipts,
  })
}
