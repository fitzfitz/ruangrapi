import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { UpdateReminderStatusInput } from '../domain/reminder'
import {
  remindersQueryKey,
  updateReminderStatus,
} from '../infrastructure/reminders-repository'

export function useUpdateReminderStatusMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateReminderStatusInput) =>
      updateReminderStatus(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: remindersQueryKey })
    },
  })
}
