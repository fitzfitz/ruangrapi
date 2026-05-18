import { useQuery } from '@tanstack/react-query'

import {
  listUnitsByProperty,
  unitsByPropertyQueryKey,
} from '../infrastructure/units-repository'

export function useUnitsByPropertyQuery(propertyId: string | undefined) {
  return useQuery({
    queryKey: unitsByPropertyQueryKey(propertyId ?? ''),
    queryFn: () => {
      if (!propertyId) {
        return []
      }

      return listUnitsByProperty(propertyId)
    },
    enabled: Boolean(propertyId),
  })
}
