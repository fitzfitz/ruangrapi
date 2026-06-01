import { useQuery } from '@tanstack/react-query'

import {
  listReminders,
  remindersQueryKey,
} from '../infrastructure/reminders-repository'

export function useRemindersQuery() {
  return useQuery({
    queryKey: remindersQueryKey,
    queryFn: listReminders,
  })
}
