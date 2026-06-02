import { useQuery } from '@tanstack/react-query'

import {
  listMaintenanceFormOptions,
  maintenanceFormOptionsQueryKey,
} from '../infrastructure/maintenance-repository'

export function useMaintenanceFormOptionsQuery() {
  return useQuery({
    queryKey: maintenanceFormOptionsQueryKey,
    queryFn: listMaintenanceFormOptions,
  })
}
