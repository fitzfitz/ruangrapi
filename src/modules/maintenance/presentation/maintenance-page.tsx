import { useState } from 'react'
import { Link } from 'react-router-dom'

import { AppLayout } from '../../../app/layouts'
import { routePaths } from '../../../app/router/route-paths'
import { useMaintenanceTicketsQuery } from '../application/use-maintenance-tickets-query'
import { useUpdateMaintenanceTicketStatusMutation } from '../application/use-update-maintenance-ticket-status-mutation'
import type {
  MaintenanceTicketListItem,
  MaintenanceTicketPriority,
  MaintenanceTicketStatus,
} from '../domain/maintenance'

type TicketActionState = Record<string, true>

const ticketStatuses: MaintenanceTicketStatus[] = [
  'open',
  'in_progress',
  'resolved',
  'cancelled',
]

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function formatCurrency(value: number | null) {
  if (value === null) {
    return 'Not recorded'
  }

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatStatus(status: MaintenanceTicketStatus) {
  return status.replaceAll('_', ' ')
}

function formatPriority(priority: MaintenanceTicketPriority) {
  return priority.replaceAll('_', ' ')
}

function getStatusDate(ticket: MaintenanceTicketListItem) {
  if (ticket.status === 'resolved' && ticket.resolved_at !== null) {
    return ticket.resolved_at
  }

  if (ticket.status === 'cancelled' && ticket.cancelled_at !== null) {
    return ticket.cancelled_at
  }

  return ticket.updated_at
}

function getStatusDateLabel(status: MaintenanceTicketStatus) {
  if (status === 'resolved') {
    return 'Resolved'
  }

  if (status === 'cancelled') {
    return 'Cancelled'
  }

  return 'Last updated'
}

export function MaintenancePage() {
  const maintenanceTicketsQuery = useMaintenanceTicketsQuery()
  const updateTicketStatusMutation = useUpdateMaintenanceTicketStatusMutation()
  const [updatingTicketIds, setUpdatingTicketIds] = useState<TicketActionState>(
    {},
  )
  const [updateErrorTicketIds, setUpdateErrorTicketIds] =
    useState<TicketActionState>({})

  function markTicketUpdating(ticketId: string) {
    setUpdatingTicketIds((currentTicketIds) => ({
      ...currentTicketIds,
      [ticketId]: true,
    }))
  }

  function clearTicketUpdating(ticketId: string) {
    setUpdatingTicketIds((currentTicketIds) => {
      const nextTicketIds = { ...currentTicketIds }
      delete nextTicketIds[ticketId]

      return nextTicketIds
    })
  }

  function markTicketUpdateError(ticketId: string) {
    setUpdateErrorTicketIds((currentTicketIds) => ({
      ...currentTicketIds,
      [ticketId]: true,
    }))
  }

  function clearTicketUpdateError(ticketId: string) {
    setUpdateErrorTicketIds((currentTicketIds) => {
      const nextTicketIds = { ...currentTicketIds }
      delete nextTicketIds[ticketId]

      return nextTicketIds
    })
  }

  async function handleUpdateTicketStatus(
    ticket: MaintenanceTicketListItem,
    status: MaintenanceTicketStatus,
  ) {
    if (ticket.status === status || updatingTicketIds[ticket.id] === true) {
      return
    }

    markTicketUpdating(ticket.id)
    clearTicketUpdateError(ticket.id)

    try {
      await updateTicketStatusMutation.mutateAsync({
        ticket_id: ticket.id,
        status,
      })
      clearTicketUpdateError(ticket.id)
    } catch {
      markTicketUpdateError(ticket.id)
    } finally {
      clearTicketUpdating(ticket.id)
    }
  }

  return (
    <AppLayout>
      <section className="maintenance-page" aria-labelledby="maintenance-title">
        <div className="maintenance-page__header">
          <div>
            <h2 id="maintenance-title">Maintenance</h2>
            <p>
              Track repair requests, status changes, priorities, and costs
              across properties and units.
            </p>
          </div>
          <Link to={routePaths.dashboardMaintenanceNew}>Add ticket</Link>
        </div>

        {maintenanceTicketsQuery.isLoading ? (
          <p className="maintenance-page__status">
            Loading maintenance tickets...
          </p>
        ) : null}

        {maintenanceTicketsQuery.isError ? (
          <p className="maintenance-page__error" role="alert">
            We could not load maintenance tickets right now. Please try again
            later.
          </p>
        ) : null}

        {maintenanceTicketsQuery.isSuccess &&
        maintenanceTicketsQuery.data.length === 0 ? (
          <div className="maintenance-page__empty">
            <h3>No maintenance tickets yet</h3>
            <p>
              Create a ticket when a repair request needs tracking from report
              through resolution.
            </p>
            <Link to={routePaths.dashboardMaintenanceNew}>Add ticket</Link>
          </div>
        ) : null}

        {maintenanceTicketsQuery.isSuccess &&
        maintenanceTicketsQuery.data.length > 0 ? (
          <div
            className="maintenance-page__list"
            aria-label="Maintenance ticket list"
          >
            {maintenanceTicketsQuery.data.map((ticket) => {
              const isUpdating = updatingTicketIds[ticket.id] === true
              const hasUpdateError = updateErrorTicketIds[ticket.id] === true

              return (
                <article className="maintenance-card" key={ticket.id}>
                  <div className="maintenance-card__header">
                    <div>
                      <p className="maintenance-card__property">
                        {ticket.property_name}
                        {ticket.unit_name !== null
                          ? ` - ${ticket.unit_name}`
                          : ''}
                      </p>
                      <h3>{ticket.title}</h3>
                    </div>
                    <span className="maintenance-card__status">
                      {formatStatus(ticket.status)}
                    </span>
                  </div>

                  <dl className="maintenance-card__details">
                    <div>
                      <dt>Priority</dt>
                      <dd>{formatPriority(ticket.priority)}</dd>
                    </div>
                    <div>
                      <dt>Reported</dt>
                      <dd>{formatDateTime(ticket.reported_at)}</dd>
                    </div>
                    <div>
                      <dt>{getStatusDateLabel(ticket.status)}</dt>
                      <dd>{formatDateTime(getStatusDate(ticket))}</dd>
                    </div>
                    <div>
                      <dt>Estimated cost</dt>
                      <dd>{formatCurrency(ticket.estimated_cost)}</dd>
                    </div>
                    <div>
                      <dt>Actual cost</dt>
                      <dd>{formatCurrency(ticket.actual_cost)}</dd>
                    </div>
                  </dl>

                  {ticket.description !== null ? (
                    <p className="maintenance-card__description">
                      {ticket.description}
                    </p>
                  ) : null}

                  <div
                    className="maintenance-card__actions"
                    aria-label={`Update ${ticket.title} status`}
                  >
                    {ticketStatuses.map((status) => (
                      <button
                        disabled={ticket.status === status || isUpdating}
                        key={status}
                        onClick={() =>
                          void handleUpdateTicketStatus(ticket, status)
                        }
                        type="button"
                      >
                        {formatStatus(status)}
                      </button>
                    ))}
                  </div>

                  {hasUpdateError ? (
                    <p className="maintenance-card__error" role="alert">
                      We could not update this ticket. Please try again.
                    </p>
                  ) : null}
                </article>
              )
            })}
          </div>
        ) : null}
      </section>
    </AppLayout>
  )
}
