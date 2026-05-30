import { useQuery } from '@tanstack/react-query'

import {
  listTenants,
  tenantsQueryKey,
} from '../infrastructure/tenants-repository'

export function useTenantsQuery() {
  return useQuery({
    queryKey: tenantsQueryKey,
    queryFn: listTenants,
  })
}
