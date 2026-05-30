import { Link } from 'react-router-dom'

import { AppLayout } from '../../../app/layouts'
import { routePaths } from '../../../app/router/route-paths'
import { useLeasesQuery } from '../application/use-leases-query'
import type { LeaseListItem } from '../domain/lease'

function formatDate(value: string | null) {
  if (value === null) {
    return 'No end date'
  }

  const [year, month, day] = value.split('-').map(Number)

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(year, month - 1, day))
}

function formatCurrency(value: number | null) {
  if (value === null) {
    return 'No deposit'
  }

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatPropertyName(lease: LeaseListItem) {
  return lease.property_name ?? 'No property name'
}

export function LeasesPage() {
  const leasesQuery = useLeasesQuery()

  return (
    <AppLayout>
      <section className="leases-page" aria-labelledby="leases-title">
        <div className="leases-page__header">
          <div>
            <h2 id="leases-title">Leases</h2>
            <p>
              View rental agreements that connect tenants to units. Lifecycle,
              occupancy, and billing workflows are handled in separate slices.
            </p>
          </div>
          <Link to={routePaths.dashboardLeasesNew}>Add lease</Link>
        </div>

        {leasesQuery.isLoading ? (
          <p className="leases-page__status">Loading leases...</p>
        ) : null}

        {leasesQuery.isError ? (
          <p className="leases-page__error" role="alert">
            We could not load leases right now. Please try again later.
          </p>
        ) : null}

        {leasesQuery.isSuccess && leasesQuery.data.length === 0 ? (
          <div className="leases-page__empty">
            <h3>No leases yet</h3>
            <p>
              Lease records will appear here once tenants are connected to units
              in the create flow.
            </p>
          </div>
        ) : null}

        {leasesQuery.isSuccess && leasesQuery.data.length > 0 ? (
          <div className="leases-page__list" aria-label="Lease list">
            {leasesQuery.data.map((lease) => (
              <article className="lease-card" key={lease.id}>
                <div className="lease-card__header">
                  <div>
                    <h3>{lease.tenant_name}</h3>
                    <p>
                      {lease.unit_name} - {formatPropertyName(lease)}
                    </p>
                  </div>
                  <span className="lease-card__status">{lease.status}</span>
                </div>

                <dl className="lease-card__details">
                  <div>
                    <dt>Lease period</dt>
                    <dd>
                      {formatDate(lease.start_date)} -{' '}
                      {formatDate(lease.end_date)}
                    </dd>
                  </div>
                  <div>
                    <dt>Monthly rent</dt>
                    <dd>{formatCurrency(lease.monthly_rent_amount)}</dd>
                  </div>
                  <div>
                    <dt>Billing day</dt>
                    <dd>Day {lease.billing_day}</dd>
                  </div>
                  <div>
                    <dt>Deposit</dt>
                    <dd>{formatCurrency(lease.deposit_amount)}</dd>
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
