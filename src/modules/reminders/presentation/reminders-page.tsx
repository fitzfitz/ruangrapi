import { useMemo, useState } from 'react'

import { AppLayout } from '../../../app/layouts'
import { useCreateReminderMutation } from '../application/use-create-reminder-mutation'
import { useReminderFormOptionsQuery } from '../application/use-reminder-form-options-query'
import { useRemindersQuery } from '../application/use-reminders-query'
import { useUpdateReminderStatusMutation } from '../application/use-update-reminder-status-mutation'
import type {
  ReminderInvoiceOption,
  ReminderListItem,
  ReminderStatus,
} from '../domain/reminder'

type ReminderActionStatus = Extract<
  ReminderStatus,
  'prepared' | 'sent' | 'cancelled'
>

type ReminderActionState = Record<string, true>

function formatDate(value: string | null, emptyLabel: string) {
  if (value === null) {
    return emptyLabel
  }

  const [year, month, day] = value.split('-').map(Number)

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(year, month - 1, day))
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function formatBillingPeriod(value: string) {
  const [year, month] = value.split('-').map(Number)

  return new Intl.DateTimeFormat('id-ID', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(year, month - 1, 1))
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatPropertyName(propertyName: string | null) {
  return propertyName ?? 'No property name'
}

function formatChannel(channel: string) {
  return channel.replaceAll('_', ' ')
}

function formatStatus(status: string) {
  return status.replaceAll('_', ' ')
}

function formatInvoiceOption(invoice: ReminderInvoiceOption) {
  return `${invoice.tenant_name} / ${invoice.unit_name} - ${formatPropertyName(
    invoice.property_name,
  )} / ${formatBillingPeriod(invoice.billing_period)}`
}

function ReminderDetails({
  dueDate,
  billingPeriod,
  invoiceTotal,
}: {
  dueDate: string | null
  billingPeriod: string
  invoiceTotal: number
}) {
  return (
    <dl className="reminder-card__details">
      <div>
        <dt>Billing period</dt>
        <dd>{formatBillingPeriod(billingPeriod)}</dd>
      </div>
      <div>
        <dt>Due date</dt>
        <dd>{formatDate(dueDate, 'No due date')}</dd>
      </div>
      <div>
        <dt>Invoice total</dt>
        <dd>{formatCurrency(invoiceTotal)}</dd>
      </div>
    </dl>
  )
}

export function RemindersPage() {
  const formOptionsQuery = useReminderFormOptionsQuery()
  const remindersQuery = useRemindersQuery()
  const createReminderMutation = useCreateReminderMutation()
  const updateReminderStatusMutation = useUpdateReminderStatusMutation()
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('')
  const [createError, setCreateError] = useState(false)
  const [copiedReminderIds, setCopiedReminderIds] =
    useState<ReminderActionState>({})
  const [updatingReminderIds, setUpdatingReminderIds] =
    useState<ReminderActionState>({})
  const [updateErrorReminderIds, setUpdateErrorReminderIds] =
    useState<ReminderActionState>({})

  const formOptions = formOptionsQuery.data ?? null
  const invoices = useMemo(() => formOptions?.invoices ?? [], [formOptions])
  const selectedInvoice = useMemo(
    () => invoices.find((invoice) => invoice.id === selectedInvoiceId) ?? null,
    [invoices, selectedInvoiceId],
  )
  const hasInvoiceOptions = invoices.length > 0
  const isCreatingReminder = createReminderMutation.isPending
  const canPrepareReminder =
    selectedInvoice !== null && selectedInvoice.generated_message.length > 0

  function markCopied(reminderId: string) {
    setCopiedReminderIds((current) => ({ ...current, [reminderId]: true }))
    window.setTimeout(() => {
      setCopiedReminderIds((current) => {
        const next = { ...current }
        delete next[reminderId]

        return next
      })
    }, 1800)
  }

  async function handleCopyReminder(reminder: ReminderListItem) {
    if (navigator.clipboard === undefined) {
      return
    }

    try {
      await navigator.clipboard.writeText(reminder.message)
      markCopied(reminder.id)
    } catch {
      // The visible message remains available for manual selection.
    }
  }

  function markReminderUpdating(reminderId: string) {
    setUpdatingReminderIds((current) => ({ ...current, [reminderId]: true }))
  }

  function clearReminderUpdating(reminderId: string) {
    setUpdatingReminderIds((current) => {
      const next = { ...current }
      delete next[reminderId]

      return next
    })
  }

  function markReminderUpdateError(reminderId: string) {
    setUpdateErrorReminderIds((current) => ({
      ...current,
      [reminderId]: true,
    }))
  }

  function clearReminderUpdateError(reminderId: string) {
    setUpdateErrorReminderIds((current) => {
      const next = { ...current }
      delete next[reminderId]

      return next
    })
  }

  async function handleUpdateReminderStatus(
    reminder: ReminderListItem,
    status: ReminderActionStatus,
  ) {
    if (
      updatingReminderIds[reminder.id] === true ||
      reminder.status === status
    ) {
      return
    }

    markReminderUpdating(reminder.id)
    clearReminderUpdateError(reminder.id)

    try {
      await updateReminderStatusMutation.mutateAsync({
        reminder_id: reminder.id,
        status,
      })
      clearReminderUpdateError(reminder.id)
    } catch {
      markReminderUpdateError(reminder.id)
    } finally {
      clearReminderUpdating(reminder.id)
    }
  }

  function handlePrepareReminder() {
    if (selectedInvoice === null) {
      return
    }

    setCreateError(false)
    createReminderMutation.mutate(
      {
        organization_id: selectedInvoice.organization_id,
        invoice_id: selectedInvoice.id,
        message: selectedInvoice.generated_message,
      },
      {
        onSuccess: () => {
          setSelectedInvoiceId('')
          setCreateError(false)
        },
        onError: () => {
          setCreateError(true)
        },
      },
    )
  }

  return (
    <AppLayout>
      <section className="reminders-page" aria-labelledby="reminders-title">
        <div className="reminders-page__header">
          <div>
            <h2 id="reminders-title">Reminders</h2>
            <p>
              Prepare payment reminder messages from payable invoices, copy the
              text, open WhatsApp manually, and track each message status.
            </p>
          </div>
        </div>

        <section
          className="reminders-prepare"
          aria-labelledby="reminders-prepare-title"
        >
          <div className="reminders-prepare__header">
            <div>
              <h3 id="reminders-prepare-title">Prepare reminder</h3>
              <p>Select a payable invoice to preview the generated message.</p>
            </div>
          </div>

          {formOptionsQuery.isLoading ? (
            <p className="reminders-page__status">
              Loading payable invoices...
            </p>
          ) : null}

          {formOptionsQuery.isError ? (
            <p className="reminders-page__error" role="alert">
              We could not load payable invoices right now. Please try again
              later.
            </p>
          ) : null}

          {formOptionsQuery.isSuccess && !hasInvoiceOptions ? (
            <div className="reminders-page__empty">
              <h3>No payable invoices</h3>
              <p>
                Reminder options will appear after an invoice is unpaid,
                partially paid, or overdue.
              </p>
            </div>
          ) : null}

          {formOptionsQuery.isSuccess && hasInvoiceOptions ? (
            <div className="reminders-prepare__body">
              <div className="reminders-prepare__field">
                <label htmlFor="reminder-invoice">Invoice</label>
                <select
                  id="reminder-invoice"
                  value={selectedInvoiceId}
                  disabled={isCreatingReminder}
                  onChange={(event) => {
                    setSelectedInvoiceId(event.target.value)
                    setCreateError(false)
                  }}
                >
                  <option value="">Select a payable invoice</option>
                  {invoices.map((invoice) => (
                    <option value={invoice.id} key={invoice.id}>
                      {formatInvoiceOption(invoice)}
                    </option>
                  ))}
                </select>
              </div>

              {selectedInvoice !== null ? (
                <div className="reminders-prepare__preview">
                  <div className="reminders-prepare__summary">
                    <div>
                      <span>Tenant</span>
                      <strong>{selectedInvoice.tenant_name}</strong>
                    </div>
                    <div>
                      <span>Unit / property</span>
                      <strong>
                        {selectedInvoice.unit_name} -{' '}
                        {formatPropertyName(selectedInvoice.property_name)}
                      </strong>
                    </div>
                    <div>
                      <span>Billing period</span>
                      <strong>
                        {formatBillingPeriod(selectedInvoice.billing_period)}
                      </strong>
                    </div>
                    <div>
                      <span>Due date</span>
                      <strong>
                        {formatDate(selectedInvoice.due_date, 'No due date')}
                      </strong>
                    </div>
                    <div>
                      <span>Remaining amount</span>
                      <strong>
                        {formatCurrency(selectedInvoice.remaining_amount)}
                      </strong>
                    </div>
                  </div>

                  <div className="reminders-prepare__message">
                    <span>Generated message</span>
                    <p>{selectedInvoice.generated_message}</p>
                  </div>
                </div>
              ) : null}

              {createError ? (
                <p className="reminders-page__error" role="alert">
                  We could not prepare this reminder. Please try again.
                </p>
              ) : null}

              <div className="reminders-prepare__actions">
                <button
                  type="button"
                  disabled={!canPrepareReminder || isCreatingReminder}
                  onClick={handlePrepareReminder}
                >
                  {isCreatingReminder
                    ? 'Preparing reminder...'
                    : 'Prepare reminder'}
                </button>
              </div>
            </div>
          ) : null}
        </section>

        <section className="reminders-queue" aria-labelledby="reminders-queue">
          <div className="reminders-queue__header">
            <div>
              <h3 id="reminders-queue">Queue</h3>
              <p>Prepared and sent reminders remain visible for follow-up.</p>
            </div>
          </div>

          {remindersQuery.isLoading ? (
            <p className="reminders-page__status">Loading reminders...</p>
          ) : null}

          {remindersQuery.isError ? (
            <p className="reminders-page__error" role="alert">
              We could not load reminders right now. Please try again later.
            </p>
          ) : null}

          {remindersQuery.isSuccess && remindersQuery.data.length === 0 ? (
            <div className="reminders-page__empty">
              <h3>No reminders prepared</h3>
              <p>Prepared reminder messages will appear here.</p>
            </div>
          ) : null}

          {remindersQuery.isSuccess && remindersQuery.data.length > 0 ? (
            <div className="reminders-queue__list" aria-label="Reminder list">
              {remindersQuery.data.map((reminder) => {
                const isUpdating = updatingReminderIds[reminder.id] === true
                const hasUpdateError =
                  updateErrorReminderIds[reminder.id] === true
                const isCopied = copiedReminderIds[reminder.id] === true

                return (
                  <article className="reminder-card" key={reminder.id}>
                    <div className="reminder-card__header">
                      <div>
                        <h3>{reminder.tenant_name}</h3>
                        <p>
                          {reminder.unit_name} -{' '}
                          {formatPropertyName(reminder.property_name)}
                        </p>
                      </div>
                      <span className="reminder-card__status">
                        {formatStatus(reminder.status)}
                      </span>
                    </div>

                    <ReminderDetails
                      dueDate={reminder.invoice_due_date}
                      billingPeriod={reminder.invoice_billing_period}
                      invoiceTotal={reminder.invoice_total_amount}
                    />

                    <dl className="reminder-card__meta">
                      <div>
                        <dt>Channel</dt>
                        <dd>{formatChannel(reminder.channel)}</dd>
                      </div>
                      <div>
                        <dt>Updated</dt>
                        <dd>{formatDateTime(reminder.updated_at)}</dd>
                      </div>
                    </dl>

                    <div className="reminder-card__message">
                      <span>Message</span>
                      <p>{reminder.message}</p>
                    </div>

                    {hasUpdateError ? (
                      <p className="reminder-card__error" role="alert">
                        We could not update this reminder. Please try again.
                      </p>
                    ) : null}

                    <div className="reminder-card__actions">
                      <button
                        type="button"
                        onClick={() => {
                          void handleCopyReminder(reminder)
                        }}
                      >
                        {isCopied ? 'Copied' : 'Copy message'}
                      </button>
                      {reminder.whatsapp_url !== null ? (
                        <a
                          href={reminder.whatsapp_url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open WhatsApp
                        </a>
                      ) : null}
                      <button
                        type="button"
                        disabled={isUpdating || reminder.status === 'prepared'}
                        onClick={() => {
                          void handleUpdateReminderStatus(reminder, 'prepared')
                        }}
                      >
                        Mark prepared
                      </button>
                      <button
                        type="button"
                        disabled={isUpdating || reminder.status === 'sent'}
                        onClick={() => {
                          void handleUpdateReminderStatus(reminder, 'sent')
                        }}
                      >
                        Mark sent
                      </button>
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => {
                          void handleUpdateReminderStatus(reminder, 'cancelled')
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          ) : null}
        </section>
      </section>
    </AppLayout>
  )
}
