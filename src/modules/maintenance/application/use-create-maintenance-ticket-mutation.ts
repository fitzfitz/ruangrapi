import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { CreateMaintenanceTicketInput } from '../domain/maintenance'
import {
  createMaintenanceTicket,
  maintenanceTicketsQueryKey,
} from '../infrastructure/maintenance-repository'

export function useCreateMaintenanceTicketMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateMaintenanceTicketInput) =>
      createMaintenanceTicket(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: maintenanceTicketsQueryKey,
      })
    },
  })
}
