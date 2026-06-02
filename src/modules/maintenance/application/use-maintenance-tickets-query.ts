import { useQuery } from '@tanstack/react-query'

import {
  listMaintenanceTickets,
  maintenanceTicketsQueryKey,
} from '../infrastructure/maintenance-repository'

export function useMaintenanceTicketsQuery() {
  return useQuery({
    queryKey: maintenanceTicketsQueryKey,
    queryFn: listMaintenanceTickets,
  })
}
