import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { TenantFormInput } from '../domain/tenant-form-schema'
import {
  createTenant,
  tenantsQueryKey,
} from '../infrastructure/tenants-repository'

type CreateTenantMutationVariables = {
  organizationId: string
  input: TenantFormInput
}

export function useCreateTenantMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ organizationId, input }: CreateTenantMutationVariables) =>
      createTenant({
        organization_id: organizationId,
        ...input,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: tenantsQueryKey })
    },
  })
}
