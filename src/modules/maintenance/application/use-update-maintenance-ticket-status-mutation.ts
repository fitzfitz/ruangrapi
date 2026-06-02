import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { UpdateMaintenanceTicketStatusInput } from '../domain/maintenance'
import {
  maintenanceTicketsQueryKey,
  updateMaintenanceTicketStatus,
} from '../infrastructure/maintenance-repository'

export function useUpdateMaintenanceTicketStatusMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateMaintenanceTicketStatusInput) =>
      updateMaintenanceTicketStatus(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: maintenanceTicketsQueryKey,
      })
    },
  })
}
