import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { CreateUnitInput } from '../domain/create-unit-schema'
import {
  createUnit,
  unitsByPropertyQueryKey,
} from '../infrastructure/units-repository'

type CreateUnitMutationVariables = {
  organizationId: string
  propertyId: string
  input: CreateUnitInput
}

export function useCreateUnitMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      organizationId,
      propertyId,
      input,
    }: CreateUnitMutationVariables) =>
      createUnit({
        organization_id: organizationId,
        property_id: propertyId,
        ...input,
      }),
    onSuccess: async (_createdUnit, { propertyId }) => {
      await queryClient.invalidateQueries({
        queryKey: unitsByPropertyQueryKey(propertyId),
      })
    },
  })
}
