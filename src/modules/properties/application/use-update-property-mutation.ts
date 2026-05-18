import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { UpdatePropertyInput } from '../domain/update-property-schema'
import {
  propertiesQueryKey,
  propertyQueryKey,
  updateProperty,
} from '../infrastructure/properties-repository'

type UpdatePropertyMutationVariables = {
  propertyId: string
  input: UpdatePropertyInput
}

export function useUpdatePropertyMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ propertyId, input }: UpdatePropertyMutationVariables) =>
      updateProperty(propertyId, input),
    onSuccess: async (property) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: propertiesQueryKey }),
        queryClient.invalidateQueries({
          queryKey: propertyQueryKey(property.id),
        }),
      ])
    },
  })
}
