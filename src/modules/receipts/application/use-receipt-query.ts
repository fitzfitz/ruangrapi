import { useQuery } from '@tanstack/react-query'

import {
  getReceipt,
  receiptQueryKey,
} from '../infrastructure/receipts-repository'

export function useReceiptQuery(receiptId: string | undefined) {
  return useQuery({
    queryKey:
      receiptId === undefined
        ? ([...receiptQueryKey('missing-receipt-id')] as const)
        : receiptQueryKey(receiptId),
    queryFn: () => getReceipt(receiptId ?? ''),
    enabled: receiptId !== undefined,
  })
}
