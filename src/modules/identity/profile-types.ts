export type ProfileRole = 'owner' | 'admin'

export type CurrentProfile = {
  id: string
  organization_id: string
  full_name: string
  role: ProfileRole
  created_at: string
  updated_at: string
}
