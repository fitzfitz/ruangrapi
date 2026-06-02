export type MaintenanceTicketStatus =
  | 'open'
  | 'in_progress'
  | 'resolved'
  | 'cancelled'

export type MaintenanceTicketPriority = 'low' | 'medium' | 'high' | 'urgent'

export type MaintenanceTicket = {
  id: string
  organization_id: string
  property_id: string
  unit_id: string | null
  title: string
  description: string | null
  status: MaintenanceTicketStatus
  priority: MaintenanceTicketPriority
  estimated_cost: number | null
  actual_cost: number | null
  reported_at: string
  resolved_at: string | null
  cancelled_at: string | null
  created_at: string
  updated_at: string
}

export type MaintenanceTicketListItem = MaintenanceTicket & {
  property_name: string
  unit_name: string | null
}

export type MaintenancePropertyOption = {
  id: string
  organization_id: string
  name: string
}

export type MaintenanceUnitOption = {
  id: string
  organization_id: string
  property_id: string
  name: string
}

export type MaintenanceFormOptions = {
  properties: MaintenancePropertyOption[]
  units: MaintenanceUnitOption[]
}

export type CreateMaintenanceTicketInput = {
  organization_id: string
  property_id: string
  unit_id: string | null
  title: string
  description: string | null
  priority: MaintenanceTicketPriority
  reported_at: string
  estimated_cost: number | null
  actual_cost: number | null
}

export type UpdateMaintenanceTicketStatusInput = {
  ticket_id: string
  status: MaintenanceTicketStatus
}
