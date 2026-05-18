import { supabaseClient } from '../../shared/lib'
import type { CurrentProfile } from './profile-types'

export const currentProfileQueryKey = (userId: string | null) => [
  'identity',
  'current-profile',
  userId,
]

export async function fetchCurrentProfile(
  userId: string,
): Promise<CurrentProfile | null> {
  const { data, error } = await supabaseClient
    .from('profiles')
    .select('id, organization_id, full_name, role, created_at, updated_at')
    .eq('id', userId)
    .maybeSingle<CurrentProfile>()

  if (error !== null) {
    throw error
  }

  return data
}
