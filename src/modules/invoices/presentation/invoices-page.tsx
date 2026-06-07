import { Link } from 'react-router-dom'
import { useState } from 'react'

import { AppLayout } from '../../../app/layouts'
import { routePaths } from '../../../app/router/route-paths'
import { useCurrentProfileQuery } from '../../identity'
import { useIssueInvoiceMutation } from '../application/use-issue-invoice-mutation'
import { useInvoicesQuery } from '../application/use-invoices-query'
import type { InvoiceListItem } from '../domain/invoice'

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

function formatPropertyName(invoice: InvoiceListItem) {
  return invoice.property_name ?? 'No property name'
}

function formatLeasePeriod(invoice: InvoiceListItem) {
  return `${formatDate(invoice.lease_start_date, 'No start date')} - ${formatDate(
    invoice.lease_end_date,
    'No end date',
  )}`
}

function buildInvoiceSummary(invoices: InvoiceListItem[]) {
  const draftCount = invoices.filter(
    (invoice) => invoice.status === 'draft',
  ).length
  const issuedOrPaidCount = invoices.filter(
    (invoice) => invoice.issued_at !== null || invoice.status === 'paid',
  ).length

  return [
    {
      label: 'Total invoices',
      value: invoices.length.toString(),
      helper: 'Billing records in workspace',
    },
    {
      label: 'Draft',
      value: draftCount.toString(),
      helper: 'Need due date and issue action',
    },
    {
      label: 'Issued or paid',
      value: issuedOrPaidCount.toString(),
      helper: 'Moved into collection flow',
    },
  ]
}

export function InvoicesPage() {
  const invoicesQuery = useInvoicesQuery()
  const currentProfileQuery = useCurrentProfileQuery()
  const issueInvoiceMutation = useIssueInvoiceMutation()
  const [dueDatesByInvoiceId, setDueDatesByInvoiceId] = useState<
    Record<string, string>
  >({})
  const [issuingInvoiceId, setIssuingInvoiceId] = useState<string | null>(null)
  const [issueErrorInvoiceId, setIssueErrorInvoiceId] = useState<string | null>(
    null,
  )

  const organizationId = currentProfileQuery.data?.organization_id ?? null

  function updateDraftDueDate(invoiceId: string, dueDate: string) {
    setDueDatesByInvoiceId((current) => ({
      ...current,
      [invoiceId]: dueDate,
    }))
  }

  function handleIssueInvoice(invoice: InvoiceListItem) {
    const dueDate = dueDatesByInvoiceId[invoice.id] ?? ''

    if (organizationId === null || dueDate === '') {
      return
    }

    setIssuingInvoiceId(invoice.id)
    setIssueErrorInvoiceId(null)
    issueInvoiceMutation.mutate(
      {
        invoiceId: invoice.id,
        organizationId,
        dueDate,
      },
      {
        onSuccess: () => {
          setDueDatesByInvoiceId((current) => {
            const next = { ...current }
            delete next[invoice.id]
            return next
          })
          setIssuingInvoiceId(null)
        },
        onError: () => {
          setIssueErrorInvoiceId(invoice.id)
          setIssuingInvoiceId(null)
        },
      },
    )
  }

  return (
    <AppLayout>
      <section className="invoices-page" aria-labelledby="invoices-title">
        <div className="invoices-page__header">
          <div>
            <h2 id="invoices-title">Invoices</h2>
            <p>
              View invoice records for lease billing periods. Payments,
              receipts, reminders, and overdue automation are handled in
              separate slices.
            </p>
          </div>
          <Link to={routePaths.dashboardInvoicesNew}>Add invoice</Link>
        </div>

        {invoicesQuery.isLoading ? (
          <p className="invoices-page__status">Loading invoices...</p>
        ) : null}

        {invoicesQuery.isError ? (
          <p className="invoices-page__error" role="alert">
            We could not load invoices right now. Please try again later.
          </p>
        ) : null}

        {invoicesQuery.isSuccess && invoicesQuery.data.length === 0 ? (
          <div className="invoices-page__empty">
            <h3>No invoices yet</h3>
            <p>
              Invoice records will appear here after draft rent invoices are
              created from active leases.
            </p>
          </div>
        ) : null}

        {invoicesQuery.isSuccess && invoicesQuery.data.length > 0
          ? (() => {
              const invoiceSummary = buildInvoiceSummary(invoicesQuery.data)

              return (
                <>
                  <div
                    className="command-list-summary"
                    aria-label="Invoice summary"
                  >
                    {invoiceSummary.map((item) => (
                      <article
                        className="command-list-summary__item"
                        key={item.label}
                      >
                        <span>{item.label}</span>
                        <strong>{item.value}</strong>
                        <p>{item.helper}</p>
                      </article>
                    ))}
                  </div>

                  <div className="command-list-grid">
                    <div
                      className="invoices-page__list command-list-surface"
                      aria-label="Invoice list"
                    >
                      {invoicesQuery.data.map((invoice) => {
                        const draftDueDate =
                          dueDatesByInvoiceId[invoice.id] ?? ''
                        const isIssuingInvoice = issuingInvoiceId === invoice.id
                        const canIssueInvoice =
                          organizationId !== null &&
                          draftDueDate !== '' &&
                          !isIssuingInvoice

                        return (
                          <article className="invoice-card" key={invoice.id}>
                            <div className="invoice-card__header">
                              <div>
                                <h3>{invoice.tenant_name}</h3>
                                <p>
                                  {invoice.unit_name} -{' '}
                                  {formatPropertyName(invoice)}
                                </p>
                              </div>
                              <span className="invoice-card__status">
                                {invoice.status}
                              </span>
                            </div>

                            <dl className="invoice-card__details">
                              <div>
                                <dt>Billing period</dt>
                                <dd>
                                  {formatBillingPeriod(invoice.billing_period)}
                                </dd>
                              </div>
                              <div>
                                <dt>Due date</dt>
                                <dd>
                                  {formatDate(invoice.due_date, 'No due date')}
                                </dd>
                              </div>
                              <div>
                                <dt>Total</dt>
                                <dd>{formatCurrency(invoice.total_amount)}</dd>
                              </div>
                              <div>
                                <dt>Lease period</dt>
                                <dd>{formatLeasePeriod(invoice)}</dd>
                              </div>
                            </dl>

                            {invoice.status === 'draft' ? (
                              <form
                                className="invoice-card__issue-form"
                                onSubmit={(event) => {
                                  event.preventDefault()
                                  handleIssueInvoice(invoice)
                                }}
                              >
                                <label
                                  htmlFor={`invoice-${invoice.id}-due-date`}
                                >
                                  Due date
                                </label>
                                <input
                                  id={`invoice-${invoice.id}-due-date`}
                                  type="date"
                                  value={draftDueDate}
                                  disabled={isIssuingInvoice}
                                  onChange={(event) => {
                                    updateDraftDueDate(
                                      invoice.id,
                                      event.target.value,
                                    )
                                  }}
                                />
                                <button
                                  type="submit"
                                  disabled={!canIssueInvoice}
                                >
                                  {isIssuingInvoice
                                    ? 'Issuing...'
                                    : 'Issue invoice'}
                                </button>
                                {issueErrorInvoiceId === invoice.id ? (
                                  <p
                                    className="invoice-card__issue-error"
                                    role="alert"
                                  >
                                    We could not issue this invoice. Please try
                                    again.
                                  </p>
                                ) : null}
                              </form>
                            ) : null}
                          </article>
                        )
                      })}
                    </div>

                    <aside
                      className="command-list-rail"
                      aria-label="Invoice billing flow"
                    >
                      <span>Billing flow</span>
                      <strong>{invoiceSummary[1].value}</strong>
                      <p>draft invoices still need due dates before issuing.</p>
                      <div className="command-list-rail__items">
                        <span className="command-list-rail__item">
                          {invoiceSummary[2].value} issued or paid
                        </span>
                        <span className="command-list-rail__item">
                          {invoiceSummary[0].value} invoices total
                        </span>
                      </div>
                    </aside>
                  </div>
                </>
              )
            })()
          : null}
      </section>
    </AppLayout>
  )
}
