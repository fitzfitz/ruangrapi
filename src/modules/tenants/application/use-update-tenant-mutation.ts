import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { TenantFormInput } from '../domain/tenant-form-schema'
import {
  tenantQueryKey,
  tenantsQueryKey,
  updateTenant,
} from '../infrastructure/tenants-repository'

type UpdateTenantMutationVariables = {
  tenantId: string
  input: TenantFormInput
}

export function useUpdateTenantMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ tenantId, input }: UpdateTenantMutationVariables) =>
      updateTenant(tenantId, input),
    onSuccess: async (tenant) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: tenantsQueryKey }),
        queryClient.invalidateQueries({
          queryKey: tenantQueryKey(tenant.id),
        }),
      ])
    },
  })
}
