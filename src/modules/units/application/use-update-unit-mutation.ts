import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { UpdateUnitInput } from '../domain/update-unit-schema'
import {
  unitDetailQueryKey,
  unitsByPropertyQueryKey,
  updateUnit,
} from '../infrastructure/units-repository'

type UpdateUnitMutationVariables = {
  propertyId: string
  unitId: string
  input: UpdateUnitInput
}

export function useUpdateUnitMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ propertyId, unitId, input }: UpdateUnitMutationVariables) =>
      updateUnit(propertyId, unitId, input),
    onSuccess: async (unit) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: unitsByPropertyQueryKey(unit.property_id),
        }),
        queryClient.invalidateQueries({
          queryKey: unitDetailQueryKey(unit.property_id, unit.id),
        }),
      ])
    },
  })
}
