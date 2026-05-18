import { supabaseClient } from '../../shared/lib'
import type { CurrentOrganization } from './organization-types'

export const currentOrganizationQueryKey = (organizationId: string | null) => [
  'identity',
  'current-organization',
  organizationId,
]

export async function fetchCurrentOrganization(
  organizationId: string,
): Promise<CurrentOrganization | null> {
  const { data, error } = await supabaseClient
    .from('organizations')
    .select('id, name, created_at, updated_at')
    .eq('id', organizationId)
    .maybeSingle<CurrentOrganization>()

  if (error !== null) {
    throw error
  }

  return data
}
