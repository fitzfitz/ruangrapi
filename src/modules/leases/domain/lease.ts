export type LeaseStatus = 'active' | 'ended' | 'cancelled'

export type Lease = {
  id: string
  organization_id: string
  tenant_id: string
  unit_id: string
  start_date: string
  end_date: string | null
  monthly_rent_amount: number
  billing_day: number
  deposit_amount: number | null
  status: LeaseStatus
  cancelled_at: string | null
  created_at: string
  updated_at: string
}

export type LeaseListItem = Lease & {
  tenant_name: string
  unit_name: string
  property_name: string | null
}
