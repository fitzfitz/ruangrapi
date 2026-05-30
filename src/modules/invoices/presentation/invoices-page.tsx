import { Link } from 'react-router-dom'

import { AppLayout } from '../../../app/layouts'
import { routePaths } from '../../../app/router/route-paths'
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

export function InvoicesPage() {
  const invoicesQuery = useInvoicesQuery()

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

        {invoicesQuery.isSuccess && invoicesQuery.data.length > 0 ? (
          <div className="invoices-page__list" aria-label="Invoice list">
            {invoicesQuery.data.map((invoice) => (
              <article className="invoice-card" key={invoice.id}>
                <div className="invoice-card__header">
                  <div>
                    <h3>{invoice.tenant_name}</h3>
                    <p>
                      {invoice.unit_name} - {formatPropertyName(invoice)}
                    </p>
                  </div>
                  <span className="invoice-card__status">{invoice.status}</span>
                </div>

                <dl className="invoice-card__details">
                  <div>
                    <dt>Billing period</dt>
                    <dd>{formatBillingPeriod(invoice.billing_period)}</dd>
                  </div>
                  <div>
                    <dt>Due date</dt>
                    <dd>{formatDate(invoice.due_date, 'No due date')}</dd>
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
              </article>
            ))}
          </div>
        ) : null}
      </section>
    </AppLayout>
  )
}
