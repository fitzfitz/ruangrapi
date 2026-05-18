import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { CreatePropertyInput } from '../domain/create-property-schema'
import {
  createProperty,
  propertiesQueryKey,
} from '../infrastructure/properties-repository'

type CreatePropertyMutationVariables = {
  organizationId: string
  input: CreatePropertyInput
}

export function useCreatePropertyMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ organizationId, input }: CreatePropertyMutationVariables) =>
      createProperty({
        organization_id: organizationId,
        ...input,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: propertiesQueryKey })
    },
  })
}
