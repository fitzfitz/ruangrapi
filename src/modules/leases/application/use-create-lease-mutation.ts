import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { CreateLeaseInput } from '../domain/create-lease-schema'
import {
  createLease,
  leasesQueryKey,
} from '../infrastructure/leases-repository'

type CreateLeaseMutationVariables = {
  organizationId: string
  input: CreateLeaseInput
}

export function useCreateLeaseMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ organizationId, input }: CreateLeaseMutationVariables) =>
      createLease({
        organization_id: organizationId,
        ...input,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: leasesQueryKey })
    },
  })
}
