import { useState } from 'react'
import { Link } from 'react-router-dom'

import { routePaths } from '../../../app/router/route-paths'
import { AppLayout } from '../../../app/layouts'
import { useCreateReceiptMutation } from '../../receipts'
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

function formatReceiptIssuedAt(value: string) {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
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
  const createReceiptMutation = useCreateReceiptMutation()
  const [generatingReceiptPaymentId, setGeneratingReceiptPaymentId] = useState<
    string | null
  >(null)
  const [receiptErrorPaymentId, setReceiptErrorPaymentId] = useState<
    string | null
  >(null)

  function handleGenerateReceipt(payment: PaymentListItem) {
    if (payment.receipt_id !== null) {
      return
    }

    setGeneratingReceiptPaymentId(payment.id)
    setReceiptErrorPaymentId(null)
    createReceiptMutation.mutate(
      {
        organization_id: payment.organization_id,
        payment_id: payment.id,
      },
      {
        onSuccess: () => {
          setGeneratingReceiptPaymentId(null)
        },
        onError: () => {
          setReceiptErrorPaymentId(payment.id)
          setGeneratingReceiptPaymentId(null)
        },
      },
    )
  }

  return (
    <AppLayout>
      <section className="payments-page" aria-labelledby="payments-title">
        <div className="payments-page__header">
          <div>
            <h2 id="payments-title">Payments</h2>
            <p>
              View money received against issued invoices and generate simple
              receipts for recorded payments.
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
            {paymentsQuery.data.map((payment) => {
              const isGeneratingReceipt =
                generatingReceiptPaymentId === payment.id
              const hasReceipt = payment.receipt_id !== null

              return (
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

                  {hasReceipt ? (
                    <div className="payment-card__receipt payment-card__receipt--issued">
                      <div
                        className="payment-card__receipt-icon"
                        aria-hidden="true"
                      >
                        Issued
                      </div>
                      <div>
                        <p className="payment-card__receipt-label">
                          Receipt issued
                        </p>
                        <p className="payment-card__receipt-number">
                          {payment.receipt_number}
                        </p>
                        {payment.receipt_issued_at !== null ? (
                          <p className="payment-card__receipt-helper">
                            Issued{' '}
                            {formatReceiptIssuedAt(payment.receipt_issued_at)}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  ) : (
                    <div className="payment-card__receipt payment-card__receipt--pending">
                      <div>
                        <p className="payment-card__receipt-label">Receipt</p>
                        <p className="payment-card__receipt-title">
                          Not generated yet
                        </p>
                        <p className="payment-card__receipt-helper">
                          Create one receipt for this payment.
                        </p>
                        {receiptErrorPaymentId === payment.id ? (
                          <p
                            className="payment-card__receipt-error"
                            role="alert"
                          >
                            We could not generate this receipt. Please try
                            again.
                          </p>
                        ) : null}
                      </div>
                      <button
                        type="button"
                        disabled={isGeneratingReceipt}
                        onClick={() => {
                          handleGenerateReceipt(payment)
                        }}
                      >
                        {isGeneratingReceipt
                          ? 'Generating...'
                          : 'Generate receipt'}
                      </button>
                    </div>
                  )}
                </article>
              )
            })}
          </div>
        ) : null}
      </section>
    </AppLayout>
  )
}
