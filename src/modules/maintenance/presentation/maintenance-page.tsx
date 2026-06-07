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

function buildMaintenanceSummary(tickets: MaintenanceTicketListItem[]) {
  const activeTicketsCount = tickets.filter(
    (t) => t.status === 'open' || t.status === 'in_progress',
  ).length
  const urgentCount = tickets.filter((t) => t.priority === 'urgent').length
  const resolvedCost = tickets
    .filter((t) => t.status === 'resolved' && t.actual_cost !== null)
    .reduce((sum, t) => sum + (t.actual_cost ?? 0), 0)

  return [
    {
      label: 'Active Work',
      value: activeTicketsCount.toString(),
      helper: 'Open or in-progress tickets',
    },
    {
      label: 'Urgent Priority',
      value: urgentCount.toString(),
      helper: 'Requires immediate attention',
    },
    {
      label: 'Resolved Cost',
      value: formatCurrency(resolvedCost),
      helper: 'Completed repairs ledger',
    },
  ]
}

function getPriorityClass(priority: MaintenanceTicketPriority) {
  switch (priority) {
    case 'urgent':
      return 'priority-badge priority-badge--urgent'
    case 'high':
      return 'priority-badge priority-badge--high'
    case 'medium':
      return 'priority-badge priority-badge--medium'
    case 'low':
      return 'priority-badge priority-badge--low'
  }
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

  const openTickets = (maintenanceTicketsQuery.data || []).filter(
    (t) => t.status === 'open',
  )
  const inProgressTickets = (maintenanceTicketsQuery.data || []).filter(
    (t) => t.status === 'in_progress',
  )
  const completedTickets = (maintenanceTicketsQuery.data || []).filter(
    (t) => t.status === 'resolved' || t.status === 'cancelled',
  )

  function renderMaintenanceCard(ticket: MaintenanceTicketListItem) {
    const isUpdating = updatingTicketIds[ticket.id] === true
    const hasUpdateError = updateErrorTicketIds[ticket.id] === true

    return (
      <article className="maintenance-card" key={ticket.id}>
        <div className="maintenance-card__header">
          <div>
            <p className="maintenance-card__property">
              {ticket.property_name}
              {ticket.unit_name !== null ? ` - ${ticket.unit_name}` : ''}
            </p>
            <h3>{ticket.title}</h3>
          </div>
        </div>

        <dl className="maintenance-card__details">
          <div>
            <dt>Priority</dt>
            <dd>
              <span className={getPriorityClass(ticket.priority)}>
                {formatPriority(ticket.priority)}
              </span>
            </dd>
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
            <dt>Est. cost</dt>
            <dd>{formatCurrency(ticket.estimated_cost)}</dd>
          </div>
          {ticket.status === 'resolved' ? (
            <div>
              <dt>Actual cost</dt>
              <dd>{formatCurrency(ticket.actual_cost)}</dd>
            </div>
          ) : null}
        </dl>

        {ticket.description !== null ? (
          <p className="maintenance-card__description">{ticket.description}</p>
        ) : null}

        <div
          className="maintenance-card__actions"
          aria-label={`Update ${ticket.title} status`}
        >
          {ticket.status === 'open' ? (
            <>
              <button
                disabled={isUpdating}
                onClick={() =>
                  void handleUpdateTicketStatus(ticket, 'in_progress')
                }
                type="button"
              >
                Start Work
              </button>
              <button
                className="reminder-card__actions button"
                disabled={isUpdating}
                onClick={() =>
                  void handleUpdateTicketStatus(ticket, 'cancelled')
                }
                type="button"
              >
                Cancel
              </button>
            </>
          ) : null}

          {ticket.status === 'in_progress' ? (
            <>
              <button
                disabled={isUpdating}
                onClick={() =>
                  void handleUpdateTicketStatus(ticket, 'resolved')
                }
                type="button"
              >
                Resolve
              </button>
              <button
                className="reminder-card__actions button"
                disabled={isUpdating}
                onClick={() => void handleUpdateTicketStatus(ticket, 'open')}
                type="button"
              >
                Put on Hold
              </button>
              <button
                className="reminder-card__actions button"
                disabled={isUpdating}
                onClick={() =>
                  void handleUpdateTicketStatus(ticket, 'cancelled')
                }
                type="button"
              >
                Cancel
              </button>
            </>
          ) : null}

          {ticket.status === 'resolved' || ticket.status === 'cancelled' ? (
            <button
              className="reminder-card__actions button"
              disabled={isUpdating}
              onClick={() => void handleUpdateTicketStatus(ticket, 'open')}
              type="button"
            >
              Reopen
            </button>
          ) : null}
        </div>

        {hasUpdateError ? (
          <p className="maintenance-card__error" role="alert">
            We could not update this ticket. Please try again.
          </p>
        ) : null}
      </article>
    )
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
          <>
            <div
              className="command-list-summary"
              aria-label="Maintenance summary"
            >
              {buildMaintenanceSummary(maintenanceTicketsQuery.data).map(
                (item) => (
                  <article
                    className="command-list-summary__item"
                    key={item.label}
                  >
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                    <p>{item.helper}</p>
                  </article>
                ),
              )}
            </div>

            <div
              className="maintenance-board"
              aria-label="Maintenance workflow board"
            >
              {/* Column 1: Open */}
              <div className="maintenance-column">
                <div className="maintenance-column__header">
                  <h3>Open</h3>
                  <span>{openTickets.length}</span>
                </div>
                {openTickets.length === 0 ? (
                  <p className="maintenance-column__empty">No open tickets</p>
                ) : (
                  <div className="maintenance-column__list">
                    {openTickets.map((ticket) => renderMaintenanceCard(ticket))}
                  </div>
                )}
              </div>

              {/* Column 2: In Progress */}
              <div className="maintenance-column">
                <div className="maintenance-column__header">
                  <h3>In Progress</h3>
                  <span>{inProgressTickets.length}</span>
                </div>
                {inProgressTickets.length === 0 ? (
                  <p className="maintenance-column__empty">No active repairs</p>
                ) : (
                  <div className="maintenance-column__list">
                    {inProgressTickets.map((ticket) =>
                      renderMaintenanceCard(ticket),
                    )}
                  </div>
                )}
              </div>

              {/* Column 3: Completed */}
              <div className="maintenance-column">
                <div className="maintenance-column__header">
                  <h3>Completed</h3>
                  <span>{completedTickets.length}</span>
                </div>
                {completedTickets.length === 0 ? (
                  <p className="maintenance-column__empty">No completed work</p>
                ) : (
                  <div className="maintenance-column__list">
                    {completedTickets.map((ticket) =>
                      renderMaintenanceCard(ticket),
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        ) : null}
      </section>
    </AppLayout>
  )
}
