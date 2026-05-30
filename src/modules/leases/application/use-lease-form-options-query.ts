import { useQuery } from '@tanstack/react-query'

import {
  leaseFormOptionsQueryKey,
  listLeaseFormOptions,
} from '../infrastructure/leases-repository'

export function useLeaseFormOptionsQuery() {
  return useQuery({
    queryKey: leaseFormOptionsQueryKey,
    queryFn: listLeaseFormOptions,
  })
}
