import { useQuery } from '@tanstack/react-query'

import {
  getTenantById,
  tenantQueryKey,
} from '../infrastructure/tenants-repository'

export function useTenantQuery(tenantId: string | undefined) {
  return useQuery({
    queryKey: tenantId ? tenantQueryKey(tenantId) : tenantQueryKey('missing'),
    queryFn: () => {
      if (!tenantId) {
        return Promise.resolve(null)
      }

      return getTenantById(tenantId)
    },
  })
}
