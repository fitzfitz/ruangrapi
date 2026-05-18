import { useQuery } from '@tanstack/react-query'

import {
  listProperties,
  propertiesQueryKey,
} from '../infrastructure/properties-repository'

export function usePropertiesQuery() {
  return useQuery({
    queryKey: propertiesQueryKey,
    queryFn: listProperties,
  })
}
