import { useQuery } from '@tanstack/react-query'

import {
  getTenantById,
  tenantsQueryKey,
} from '../infrastructure/tenants-repository'

export function useTenantQuery(tenantId: string | undefined) {
  return useQuery({
    queryKey: [...tenantsQueryKey, 'detail', tenantId ?? null],
    queryFn: () => {
      if (!tenantId) {
        return Promise.resolve(null)
      }

      return getTenantById(tenantId)
    },
    enabled: tenantId !== undefined,
  })
}
