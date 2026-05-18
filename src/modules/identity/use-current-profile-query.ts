import { useQuery } from '@tanstack/react-query'

import { useAuthSession } from './use-auth-session'
import {
  currentProfileQueryKey,
  fetchCurrentProfile,
} from './current-profile-query'

export function useCurrentProfileQuery() {
  const { user } = useAuthSession()
  const userId = user?.id ?? null

  return useQuery({
    queryKey: currentProfileQueryKey(userId),
    queryFn: () => {
      if (userId === null) {
        return null
      }

      return fetchCurrentProfile(userId)
    },
    enabled: userId !== null,
  })
}
