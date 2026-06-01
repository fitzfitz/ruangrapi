import { Link } from 'react-router-dom'

import { AppLayout } from '../../../app/layouts'
import { routePaths } from '../../../app/router/route-paths'
import type { ReceiptListItem } from '../domain/receipt'
import { useReceiptsQuery } from '../application/use-receipts-query'

function formatDate(value: string) {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
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

function formatPaymentMethod(method: string) {
  return method.replaceAll('_', ' ')
}

function formatPropertyName(receipt: ReceiptListItem) {
  return receipt.property_name ?? 'No property name'
}

function getReceiptDetailPath(receiptId: string) {
  return routePaths.dashboardReceiptDetail.replace(':receiptId', receiptId)
}

export function ReceiptsPage() {
  const receiptsQuery = useReceiptsQuery()

  return (
    <AppLayout>
      <section className="receipts-page" aria-labelledby="receipts-title">
        <div className="receipts-page__header">
          <div>
            <h2 id="receipts-title">Receipts</h2>
            <p>
              Browse generated receipts and open printable proof of payment
              records.
            </p>
          </div>
          <Link to={routePaths.dashboardPayments}>Back to payments</Link>
        </div>

        {receiptsQuery.isLoading ? (
          <p className="receipts-page__status">Loading receipts...</p>
        ) : null}

        {receiptsQuery.isError ? (
          <p className="receipts-page__error" role="alert">
            We could not load receipts right now. Please try again later.
          </p>
        ) : null}

        {receiptsQuery.isSuccess && receiptsQuery.data.length === 0 ? (
          <div className="receipts-page__empty">
            <h3>No receipts yet</h3>
            <p>
              Receipts will appear here after you generate them from recorded
              payments.
            </p>
          </div>
        ) : null}

        {receiptsQuery.isSuccess && receiptsQuery.data.length > 0 ? (
          <div className="receipts-page__list" aria-label="Receipt list">
            {receiptsQuery.data.map((receipt) => (
              <article className="receipt-card" key={receipt.id}>
                <div className="receipt-card__header">
                  <div>
                    <p className="receipt-card__label">Receipt</p>
                    <h3>{receipt.receipt_number}</h3>
                  </div>
                  <div className="receipt-card__amount">
                    <span>Amount</span>
                    <strong>{formatCurrency(receipt.payment_amount)}</strong>
                  </div>
                </div>

                <p className="receipt-card__party">
                  {receipt.tenant_name} - {receipt.unit_name} -{' '}
                  {formatPropertyName(receipt)}
                </p>

                <dl className="receipt-card__details">
                  <div>
                    <dt>Issued</dt>
                    <dd>{formatDate(receipt.issued_at)}</dd>
                  </div>
                  <div>
                    <dt>Payment date</dt>
                    <dd>{formatDate(receipt.payment_date)}</dd>
                  </div>
                  <div>
                    <dt>Method</dt>
                    <dd>{formatPaymentMethod(receipt.payment_method)}</dd>
                  </div>
                  <div>
                    <dt>Billing period</dt>
                    <dd>
                      {formatBillingPeriod(receipt.invoice_billing_period)}
                    </dd>
                  </div>
                </dl>

                <Link
                  className="receipt-card__action"
                  to={getReceiptDetailPath(receipt.id)}
                >
                  View receipt
                </Link>
              </article>
            ))}
          </div>
        ) : null}
      </section>
    </AppLayout>
  )
}
