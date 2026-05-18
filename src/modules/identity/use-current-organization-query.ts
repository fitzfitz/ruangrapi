import { useQuery } from '@tanstack/react-query'

import { useAuthSession } from './use-auth-session'
import {
  currentOrganizationQueryKey,
  fetchCurrentOrganization,
} from './current-organization-query'
import { useCurrentProfileQuery } from './use-current-profile-query'

export function useCurrentOrganizationQuery() {
  const { user } = useAuthSession()
  const currentProfileQuery = useCurrentProfileQuery()
  const organizationId = currentProfileQuery.data?.organization_id ?? null

  return useQuery({
    queryKey: currentOrganizationQueryKey(organizationId),
    queryFn: () => {
      if (organizationId === null) {
        return null
      }

      return fetchCurrentOrganization(organizationId)
    },
    enabled:
      user !== null &&
      currentProfileQuery.data !== null &&
      organizationId !== null,
  })
}
