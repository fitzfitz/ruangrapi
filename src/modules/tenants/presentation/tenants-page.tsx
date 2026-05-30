import { Link } from 'react-router-dom'

import { AppLayout } from '../../../app/layouts'
import { routePaths } from '../../../app/router/route-paths'
import { useTenantsQuery } from '../application/use-tenants-query'
import type { Tenant } from '../domain/tenant'

function formatOptionalValue(value: string | null, fallback: string) {
  return value?.trim() || fallback
}

function formatTenantContact(tenant: Tenant) {
  const phone = formatOptionalValue(tenant.phone, 'No phone added')
  const email = formatOptionalValue(tenant.email, 'No email added')

  return `${phone} · ${email}`
}

export function TenantsPage() {
  const tenantsQuery = useTenantsQuery()

  return (
    <AppLayout>
      <section className="tenants-page" aria-labelledby="tenants-title">
        <div className="tenants-page__header">
          <div>
            <h2 id="tenants-title">Tenants</h2>
            <p>
              Manage renter contact records for your organization. Leases will
              connect tenants to units in a later module.
            </p>
          </div>
          <Link to={routePaths.dashboardTenantsNew}>Add tenant</Link>
        </div>

        {tenantsQuery.isLoading ? (
          <p className="tenants-page__status">Loading tenants...</p>
        ) : null}

        {tenantsQuery.isError ? (
          <p className="tenants-page__error" role="alert">
            We could not load tenants right now. Please try again later.
          </p>
        ) : null}

        {tenantsQuery.isSuccess && tenantsQuery.data.length === 0 ? (
          <div className="tenants-page__empty">
            <h3>No tenants yet</h3>
            <p>
              Add renter contact records here before creating leases in a later
              module.
            </p>
          </div>
        ) : null}

        {tenantsQuery.isSuccess && tenantsQuery.data.length > 0 ? (
          <div className="tenants-page__list" aria-label="Tenant list">
            {tenantsQuery.data.map((tenant) => (
              <article className="tenant-card" key={tenant.id}>
                <div className="tenant-card__header">
                  <div>
                    <h3>{tenant.full_name}</h3>
                    <p>{formatTenantContact(tenant)}</p>
                  </div>
                  <Link to={`${routePaths.dashboardTenants}/${tenant.id}/edit`}>
                    Edit
                  </Link>
                </div>

                <dl className="tenant-card__details">
                  <div>
                    <dt>Emergency contact</dt>
                    <dd>
                      {formatOptionalValue(
                        tenant.emergency_contact_name,
                        'Not added',
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt>Notes</dt>
                    <dd>{formatOptionalValue(tenant.notes, 'No notes.')}</dd>
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
