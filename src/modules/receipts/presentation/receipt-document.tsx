import type { ReceiptDetail } from '../domain/receipt'

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

export function ReceiptDocument({ receipt }: { receipt: ReceiptDetail }) {
  return (
    <article
      className="receipt-document"
      aria-label={`Receipt ${receipt.receipt_number}`}
    >
      <header className="receipt-document__hero">
        <div className="receipt-document__brand-block">
          <p className="receipt-document__brand">RuangRapi</p>
          <h2>Payment Receipt</h2>
          <p>
            Official proof of payment generated from RuangRapi operational
            records.
          </p>
        </div>
        <div className="receipt-document__receipt-meta">
          <span className="receipt-document__status">Paid</span>
          <div>
            <span>Receipt no.</span>
            <strong>{receipt.receipt_number}</strong>
          </div>
        </div>
      </header>

      <section
        className="receipt-document__total-band"
        aria-label="Total received"
      >
        <span>Total received</span>
        <strong>{formatCurrency(receipt.payment_amount)}</strong>
        <p>Issued on {formatDate(receipt.issued_at)}</p>
      </section>

      <section
        className="receipt-document__summary"
        aria-label="Receipt summary"
      >
        <div>
          <span>Received from</span>
          <strong>{receipt.tenant_name}</strong>
          <p>
            {receipt.unit_name} · {formatPropertyName(receipt.property_name)}
          </p>
        </div>
        <div>
          <span>Payment date</span>
          <strong>{formatDate(receipt.payment_date)}</strong>
          <p>{formatPaymentMethod(receipt.payment_method)}</p>
        </div>
        <div>
          <span>Reference</span>
          <strong>
            {formatOptionalText(receipt.payment_reference_number)}
          </strong>
          <p>Payment reference number</p>
        </div>
      </section>

      <section
        className="receipt-document__breakdown"
        aria-labelledby="receipt-breakdown-title"
      >
        <div>
          <p className="receipt-document__section-label">Payment breakdown</p>
          <h3 id="receipt-breakdown-title">Rental billing payment</h3>
        </div>
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
          <div className="receipt-document__breakdown-total">
            <dt>Amount received</dt>
            <dd>{formatCurrency(receipt.payment_amount)}</dd>
          </div>
        </dl>
      </section>

      <section
        className="receipt-document__metadata"
        aria-label="Receipt metadata"
      >
        <div>
          <span>Property</span>
          <strong>{formatPropertyName(receipt.property_name)}</strong>
        </div>
        <div>
          <span>Unit</span>
          <strong>{receipt.unit_name}</strong>
        </div>
        <div>
          <span>Payment method</span>
          <strong>{formatPaymentMethod(receipt.payment_method)}</strong>
        </div>
      </section>

      <section className="receipt-document__notes" aria-label="Payment notes">
        <span>Notes</span>
        <p>{formatOptionalText(receipt.payment_notes)}</p>
      </section>

      <footer className="receipt-document__footer">
        <p>
          This receipt confirms that the amount above was recorded as received
          for the payment shown.
        </p>
        <div
          className="receipt-document__signature"
          aria-label="Owner or admin signature placeholder"
        >
          <span />
          <strong>Owner/Admin</strong>
        </div>
      </footer>
    </article>
  )
}
