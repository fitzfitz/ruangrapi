import { useQuery } from '@tanstack/react-query'

import {
  leasesQueryKey,
  listLeases,
} from '../infrastructure/leases-repository'

export function useLeasesQuery() {
  return useQuery({
    queryKey: leasesQueryKey,
    queryFn: listLeases,
  })
}
