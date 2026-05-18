export type UnitType = 'room' | 'house' | 'apartment' | 'studio' | 'other'

export type UnitStatus = 'vacant' | 'occupied' | 'maintenance' | 'inactive'

export type Unit = {
  id: string
  organization_id: string
  property_id: string
  name: string
  type: UnitType
  status: UnitStatus
  base_rent_amount: number | null
  notes: string | null
  created_at: string
  updated_at: string
}
