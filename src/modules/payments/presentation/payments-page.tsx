import { Link } from 'react-router-dom'

import { routePaths } from '../../../app/router/route-paths'
import { AppLayout } from '../../../app/layouts'
import { usePaymentsQuery } from '../application/use-payments-query'
import type { PaymentListItem, PaymentMethod } from '../domain/payment'

function formatDate(value: string) {
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

function formatPaymentMethod(method: PaymentMethod) {
  return method.replaceAll('_', ' ')
}

function formatPropertyName(payment: PaymentListItem) {
  return payment.property_name ?? 'No property name'
}

function formatReference(referenceNumber: string | null) {
  return referenceNumber ?? 'No reference'
}

export function PaymentsPage() {
  const paymentsQuery = usePaymentsQuery()

  return (
    <AppLayout>
      <section className="payments-page" aria-labelledby="payments-title">
        <div className="payments-page__header">
          <div>
            <h2 id="payments-title">Payments</h2>
            <p>
              View money received against issued invoices. Recording payments,
              receipts, corrections, and reporting are handled in separate
              slices.
            </p>
          </div>
          <Link to={routePaths.dashboardPaymentsNew}>Add payment</Link>
        </div>

        {paymentsQuery.isLoading ? (
          <p className="payments-page__status">Loading payments...</p>
        ) : null}

        {paymentsQuery.isError ? (
          <p className="payments-page__error" role="alert">
            We could not load payments right now. Please try again later.
          </p>
        ) : null}

        {paymentsQuery.isSuccess && paymentsQuery.data.length === 0 ? (
          <div className="payments-page__empty">
            <h3>No payments yet</h3>
            <p>
              Payment records will appear here after manual payments are
              recorded against payable invoices.
            </p>
          </div>
        ) : null}

        {paymentsQuery.isSuccess && paymentsQuery.data.length > 0 ? (
          <div className="payments-page__list" aria-label="Payment list">
            {paymentsQuery.data.map((payment) => (
              <article className="payment-card" key={payment.id}>
                <div className="payment-card__header">
                  <div>
                    <h3>{payment.tenant_name}</h3>
                    <p>
                      {payment.unit_name} - {formatPropertyName(payment)}
                    </p>
                  </div>
                  <span className="payment-card__method">
                    {formatPaymentMethod(payment.payment_method)}
                  </span>
                </div>

                <dl className="payment-card__details">
                  <div>
                    <dt>Payment date</dt>
                    <dd>{formatDate(payment.payment_date)}</dd>
                  </div>
                  <div>
                    <dt>Amount</dt>
                    <dd>{formatCurrency(payment.amount)}</dd>
                  </div>
                  <div>
                    <dt>Billing period</dt>
                    <dd>
                      {formatBillingPeriod(payment.invoice_billing_period)}
                    </dd>
                  </div>
                  <div>
                    <dt>Invoice status</dt>
                    <dd>{payment.invoice_status}</dd>
                  </div>
                  <div>
                    <dt>Reference</dt>
                    <dd>{formatReference(payment.reference_number)}</dd>
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
