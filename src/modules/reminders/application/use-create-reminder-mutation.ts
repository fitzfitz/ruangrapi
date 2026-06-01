import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { CreateReminderInput } from '../domain/reminder'
import {
  createReminder,
  reminderFormOptionsQueryKey,
  remindersQueryKey,
} from '../infrastructure/reminders-repository'

export function useCreateReminderMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateReminderInput) => createReminder(input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: remindersQueryKey }),
        queryClient.invalidateQueries({
          queryKey: reminderFormOptionsQueryKey,
        }),
      ])
    },
  })
}
