import { useQuery } from '@tanstack/react-query'

import {
  getUnitById,
  unitDetailQueryKey,
} from '../infrastructure/units-repository'

export function useUnitQuery(
  propertyId: string | undefined,
  unitId: string | undefined,
) {
  return useQuery({
    queryKey: unitDetailQueryKey(propertyId ?? '', unitId ?? ''),
    queryFn: () => {
      if (!propertyId || !unitId) {
        return null
      }

      return getUnitById(propertyId, unitId)
    },
    enabled: Boolean(propertyId && unitId),
  })
}
