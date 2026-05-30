import { useQuery } from '@tanstack/react-query'

import {
  getTenantById,
  tenantQueryKey,
  tenantsQueryKey,
} from '../infrastructure/tenants-repository'

export function useTenantQuery(tenantId: string | undefined) {
  return useQuery({
    queryKey:
      tenantId !== undefined
        ? tenantQueryKey(tenantId)
        : ([...tenantsQueryKey, 'missing-tenant-id'] as const),
    queryFn: () => {
      if (!tenantId) {
        return Promise.resolve(null)
      }

      return getTenantById(tenantId)
    },
    enabled: tenantId !== undefined,
  })
}
