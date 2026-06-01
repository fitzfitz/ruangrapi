import { useQuery } from '@tanstack/react-query'

import {
  listReminderFormOptions,
  reminderFormOptionsQueryKey,
} from '../infrastructure/reminders-repository'

export function useReminderFormOptionsQuery() {
  return useQuery({
    queryKey: reminderFormOptionsQueryKey,
    queryFn: listReminderFormOptions,
  })
}
