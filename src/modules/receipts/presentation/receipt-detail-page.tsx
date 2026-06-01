import { Link, useParams } from 'react-router-dom'

import { AppLayout } from '../../../app/layouts'
import { routePaths } from '../../../app/router/route-paths'
import type { ReceiptDetail } from '../domain/receipt'
import { useReceiptQuery } from '../application/use-receipt-query'

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

function ReceiptDocument({ receipt }: { receipt: ReceiptDetail }) {
  return (
    <article className="receipt-document">
      <div className="receipt-document__header">
        <div>
          <p className="receipt-document__brand">RuangRapi</p>
          <h3>Payment receipt</h3>
          <p className="receipt-document__eyebrow">
            Proof of payment for rental billing
          </p>
        </div>
        <div className="receipt-document__meta">
          <span className="receipt-document__status">Paid</span>
          <div>
            <span>Receipt no.</span>
            <strong>{receipt.receipt_number}</strong>
          </div>
        </div>
      </div>

      <div className="receipt-document__summary">
        <div>
          <span>Amount received</span>
          <strong>{formatCurrency(receipt.payment_amount)}</strong>
        </div>
        <div>
          <span>Issued</span>
          <strong>{formatDate(receipt.issued_at)}</strong>
        </div>
        <div>
          <span>Payment date</span>
          <strong>{formatDate(receipt.payment_date)}</strong>
        </div>
        <div>
          <span>Method</span>
          <strong>{formatPaymentMethod(receipt.payment_method)}</strong>
        </div>
      </div>

      <div className="receipt-document__parties">
        <div>
          <span>Received from</span>
          <strong>{receipt.tenant_name}</strong>
          <p>
            {receipt.unit_name} - {formatOptionalText(receipt.property_name)}
          </p>
        </div>
        <div>
          <span>Received by</span>
          <strong>RuangRapi</strong>
          <p>Recorded through RuangRapi property management.</p>
        </div>
      </div>

      <div className="receipt-document__grid">
        <section>
          <h4>Payment for</h4>
          <dl>
            <div>
              <dt>Billing period</dt>
              <dd>{formatBillingPeriod(receipt.invoice_billing_period)}</dd>
            </div>
            <div>
              <dt>Invoice status</dt>
              <dd>{receipt.invoice_status}</dd>
            </div>
            <div>
              <dt>Invoice total</dt>
              <dd>{formatCurrency(receipt.invoice_total_amount)}</dd>
            </div>
          </dl>
        </section>

        <section>
          <h4>Payment details</h4>
          <dl>
            <div>
              <dt>Date</dt>
              <dd>{formatDate(receipt.payment_date)}</dd>
            </div>
            <div>
              <dt>Method</dt>
              <dd>{formatPaymentMethod(receipt.payment_method)}</dd>
            </div>
            <div>
              <dt>Reference</dt>
              <dd>{formatOptionalText(receipt.payment_reference_number)}</dd>
            </div>
          </dl>
        </section>

        <section className="receipt-document__notes">
          <h4>Notes</h4>
          <p>{formatOptionalText(receipt.payment_notes)}</p>
        </section>
      </div>

      <p className="receipt-document__footer">
        This receipt confirms that the amount above was recorded as received for
        the payment shown.
      </p>
    </article>
  )
}

export function ReceiptDetailPage() {
  const { receiptId } = useParams<{ receiptId: string }>()
  const receiptQuery = useReceiptQuery(receiptId)

  function handlePrint() {
    window.print()
  }

  return (
    <AppLayout>
      <section
        className="receipt-detail-page"
        aria-labelledby="receipt-detail-title"
      >
        <div className="receipt-detail-page__header">
          <div>
            <h2 id="receipt-detail-title">Receipt</h2>
            <p>Review and print a proof of payment for a generated receipt.</p>
          </div>
          <div className="receipt-detail-page__actions">
            <Link to={routePaths.dashboardReceipts}>Back to receipts</Link>
            {receiptQuery.isSuccess && receiptQuery.data !== null ? (
              <button type="button" onClick={handlePrint}>
                Print
              </button>
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
          <ReceiptDocument receipt={receiptQuery.data} />
        ) : null}
      </section>
    </AppLayout>
  )
}
