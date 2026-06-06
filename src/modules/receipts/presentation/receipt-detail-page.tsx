import { Link, useParams } from 'react-router-dom'

import { AppLayout } from '../../../app/layouts'
import { routePaths } from '../../../app/router/route-paths'
import { useReceiptQuery } from '../application/use-receipt-query'

function getReceiptPrintPath(receiptId: string) {
  return routePaths.dashboardReceiptPrint.replace(':receiptId', receiptId)
}

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

function formatOptionalText(value: string | null) {
  return value?.trim() || 'Not added'
}

function formatPropertyName(value: string | null) {
  return value?.trim() || 'No property name'
}

export function ReceiptDetailPage() {
  const { receiptId } = useParams<{ receiptId: string }>()
  const receiptQuery = useReceiptQuery(receiptId)

  return (
    <AppLayout>
      <section
        className="receipt-detail-page"
        aria-labelledby="receipt-detail-title"
      >
        <div className="receipt-detail-page__header">
          <div>
            <h2 id="receipt-detail-title">Receipt</h2>
            <p>Review a generated proof of payment before print preview.</p>
          </div>
          <div className="receipt-detail-page__actions">
            <Link to={routePaths.dashboardReceipts}>Back to receipts</Link>
            {receiptQuery.isSuccess && receiptQuery.data !== null ? (
              <Link to={getReceiptPrintPath(receiptQuery.data.id)}>
                Open print preview
              </Link>
            ) : null}
          </div>
        </div>

        {!receiptId ? (
          <div className="receipt-detail-page__empty">
            <h3>Receipt not found</h3>
            <p>This receipt is missing or is not accessible to your account.</p>
          </div>
        ) : null}

        {receiptQuery.isLoading ? (
          <p className="receipt-detail-page__status">Loading receipt...</p>
        ) : null}

        {receiptQuery.isError ? (
          <p className="receipt-detail-page__error" role="alert">
            We could not load this receipt right now. Please try again later.
          </p>
        ) : null}

        {receiptQuery.isSuccess && receiptQuery.data === null ? (
          <div className="receipt-detail-page__empty">
            <h3>Receipt not found</h3>
            <p>This receipt may not exist or may not be accessible to you.</p>
          </div>
        ) : null}

        {receiptQuery.isSuccess && receiptQuery.data !== null ? (
          <article className="receipt-detail-card">
            <div className="receipt-detail-card__hero">
              <div>
                <p className="receipt-detail-card__label">Receipt number</p>
                <h3>{receiptQuery.data.receipt_number}</h3>
                <p>Generated proof of payment ready for print preview.</p>
              </div>
              <strong>
                {formatCurrency(receiptQuery.data.payment_amount)}
              </strong>
            </div>
            <dl className="receipt-detail-card__details">
              <div>
                <dt>Tenant</dt>
                <dd>{receiptQuery.data.tenant_name}</dd>
              </div>
              <div>
                <dt>Unit</dt>
                <dd>{receiptQuery.data.unit_name}</dd>
              </div>
              <div>
                <dt>Property</dt>
                <dd>{formatPropertyName(receiptQuery.data.property_name)}</dd>
              </div>
              <div>
                <dt>Issued</dt>
                <dd>{formatDate(receiptQuery.data.issued_at)}</dd>
              </div>
              <div>
                <dt>Payment date</dt>
                <dd>{formatDate(receiptQuery.data.payment_date)}</dd>
              </div>
              <div>
                <dt>Payment method</dt>
                <dd>{formatPaymentMethod(receiptQuery.data.payment_method)}</dd>
              </div>
              <div>
                <dt>Payment reference</dt>
                <dd>
                  {formatOptionalText(
                    receiptQuery.data.payment_reference_number,
                  )}
                </dd>
              </div>
              <div>
                <dt>Billing period</dt>
                <dd>
                  {formatBillingPeriod(
                    receiptQuery.data.invoice_billing_period,
                  )}
                </dd>
              </div>
              <div>
                <dt>Invoice status</dt>
                <dd>{receiptQuery.data.invoice_status}</dd>
              </div>
              <div>
                <dt>Invoice total</dt>
                <dd>
                  {formatCurrency(receiptQuery.data.invoice_total_amount)}
                </dd>
              </div>
              <div className="receipt-detail-card__notes">
                <dt>Payment notes</dt>
                <dd>{formatOptionalText(receiptQuery.data.payment_notes)}</dd>
              </div>
            </dl>
          </article>
        ) : null}
      </section>
    </AppLayout>
  )
}
