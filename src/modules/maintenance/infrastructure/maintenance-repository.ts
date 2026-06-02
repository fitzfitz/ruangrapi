import { supabaseClient } from '../../../shared/lib'
import type {
  CreateMaintenanceTicketInput,
  MaintenanceFormOptions,
  MaintenancePropertyOption,
  MaintenanceTicket,
  MaintenanceTicketListItem,
  MaintenanceTicketStatus,
  MaintenanceUnitOption,
  UpdateMaintenanceTicketStatusInput,
} from '../domain/maintenance'

export const maintenanceTicketsQueryKey = ['maintenance-tickets'] as const
export const maintenanceFormOptionsQueryKey = [
  ...maintenanceTicketsQueryKey,
  'form-options',
] as const

const maintenanceTicketSelectColumns = `
  id,
  organization_id,
  property_id,
  unit_id,
  title,
  description,
  status,
  priority,
  estimated_cost,
  actual_cost,
  reported_at,
  resolved_at,
  cancelled_at,
  created_at,
  updated_at,
  properties (
    name
  ),
  units (
    name
  )
`

const maintenanceTicketBaseSelectColumns =
  'id, organization_id, property_id, unit_id, title, description, status, priority, estimated_cost, actual_cost, reported_at, resolved_at, cancelled_at, created_at, updated_at'

type MaintenanceTicketRow = MaintenanceTicket & {
  properties: { name: string } | null
  units: { name: string } | null
}

type PropertyOptionRow = {
  id: string
  organization_id: string
  name: string
}

type UnitOptionRow = {
  id: string
  organization_id: string
  property_id: string
  name: string
}

function mapMaintenanceTicketRow(
  row: MaintenanceTicketRow,
): MaintenanceTicketListItem {
  return {
    id: row.id,
    organization_id: row.organization_id,
    property_id: row.property_id,
    unit_id: row.unit_id,
    title: row.title,
    description: row.description,
    status: row.status,
    priority: row.priority,
    estimated_cost: row.estimated_cost,
    actual_cost: row.actual_cost,
    reported_at: row.reported_at,
    resolved_at: row.resolved_at,
    cancelled_at: row.cancelled_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
    property_name: row.properties?.name ?? 'Unknown property',
    unit_name: row.units?.name ?? null,
  }
}

function mapPropertyOption(row: PropertyOptionRow): MaintenancePropertyOption {
  return {
    id: row.id,
    organization_id: row.organization_id,
    name: row.name,
  }
}

function mapUnitOption(row: UnitOptionRow): MaintenanceUnitOption {
  return {
    id: row.id,
    organization_id: row.organization_id,
    property_id: row.property_id,
    name: row.name,
  }
}

export async function listMaintenanceTickets(): Promise<
  MaintenanceTicketListItem[]
> {
  const { data, error } = await supabaseClient
    .from('maintenance_tickets')
    .select(maintenanceTicketSelectColumns)
    .order('reported_at', { ascending: false })
    .order('created_at', { ascending: false })
    .returns<MaintenanceTicketRow[]>()

  if (error !== null) {
    throw new Error(`Could not load maintenance tickets: ${error.message}`)
  }

  return data.map(mapMaintenanceTicketRow)
}

export async function listMaintenanceFormOptions(): Promise<MaintenanceFormOptions> {
  const [
    { data: properties, error: propertiesError },
    { data: units, error: unitsError },
  ] = await Promise.all([
    supabaseClient
      .from('properties')
      .select('id, organization_id, name')
      .order('name', { ascending: true })
      .returns<PropertyOptionRow[]>(),
    supabaseClient
      .from('units')
      .select('id, organization_id, property_id, name')
      .order('name', { ascending: true })
      .returns<UnitOptionRow[]>(),
  ])

  if (propertiesError !== null) {
    throw new Error(
      `Could not load maintenance properties: ${propertiesError.message}`,
    )
  }

  if (unitsError !== null) {
    throw new Error(`Could not load maintenance units: ${unitsError.message}`)
  }

  return {
    properties: properties.map(mapPropertyOption),
    units: units.map(mapUnitOption),
  }
}

async function validateMaintenanceLocation({
  organization_id,
  property_id,
  unit_id,
}: Pick<
  CreateMaintenanceTicketInput,
  'organization_id' | 'property_id' | 'unit_id'
>) {
  const { data: property, error: propertyError } = await supabaseClient
    .from('properties')
    .select('id')
    .eq('id', property_id)
    .eq('organization_id', organization_id)
    .maybeSingle<{ id: string }>()

  if (propertyError !== null) {
    throw new Error(
      `Could not validate maintenance property: ${propertyError.message}`,
    )
  }

  if (property === null) {
    throw new Error(
      'Maintenance ticket property must belong to this organization.',
    )
  }

  if (unit_id === null) {
    return
  }

  const { data: unit, error: unitError } = await supabaseClient
    .from('units')
    .select('id')
    .eq('id', unit_id)
    .eq('property_id', property_id)
    .eq('organization_id', organization_id)
    .maybeSingle<{ id: string }>()

  if (unitError !== null) {
    throw new Error(`Could not validate maintenance unit: ${unitError.message}`)
  }

  if (unit === null) {
    throw new Error(
      'Maintenance ticket unit must belong to the selected property and organization.',
    )
  }
}

export async function createMaintenanceTicket(
  input: CreateMaintenanceTicketInput,
): Promise<MaintenanceTicket> {
  await validateMaintenanceLocation({
    organization_id: input.organization_id,
    property_id: input.property_id,
    unit_id: input.unit_id,
  })

  const { data, error } = await supabaseClient
    .from('maintenance_tickets')
    .insert({
      organization_id: input.organization_id,
      property_id: input.property_id,
      unit_id: input.unit_id,
      title: input.title,
      description: input.description,
      priority: input.priority,
      reported_at: input.reported_at,
      estimated_cost: input.estimated_cost,
      actual_cost: input.actual_cost,
    })
    .select(maintenanceTicketBaseSelectColumns)
    .single<MaintenanceTicket>()

  if (error !== null) {
    throw new Error(`Could not create maintenance ticket: ${error.message}`)
  }

  return data
}

export async function updateMaintenanceTicketStatus({
  ticket_id,
  status,
}: UpdateMaintenanceTicketStatusInput): Promise<MaintenanceTicket> {
  const updateRecord: {
    status: MaintenanceTicketStatus
    resolved_at: string | null
    cancelled_at: string | null
  } = {
    status,
    resolved_at: null,
    cancelled_at: null,
  }

  if (status === 'resolved') {
    updateRecord.resolved_at = new Date().toISOString()
  }

  if (status === 'cancelled') {
    updateRecord.cancelled_at = new Date().toISOString()
  }

  const { data, error } = await supabaseClient
    .from('maintenance_tickets')
    .update(updateRecord)
    .eq('id', ticket_id)
    .select(maintenanceTicketBaseSelectColumns)
    .single<MaintenanceTicket>()

  if (error !== null) {
    throw new Error(`Could not update maintenance ticket: ${error.message}`)
  }

  return data
}
