import { useQuery } from '@tanstack/react-query'

import {
  getPropertyById,
  propertyQueryKey,
} from '../infrastructure/properties-repository'

export function usePropertyQuery(propertyId: string | undefined) {
  return useQuery({
    queryKey: propertyQueryKey(propertyId ?? ''),
    queryFn: () => {
      if (!propertyId) {
        return null
      }

      return getPropertyById(propertyId)
    },
    enabled: Boolean(propertyId),
  })
}
