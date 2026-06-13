import { Link, useParams } from 'react-router-dom'

import { AppLayout } from '../../../app/layouts'
import { routePaths } from '../../../app/router/route-paths'
import { PropertyUnitsSection } from '../../units'
import { usePropertyQuery } from '../application/use-property-query'
import type { Property } from '../domain/property'

function formatOptionalText(value: string | null) {
  return value?.trim() || 'Not added yet.'
}

function formatPropertyDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function getPropertyEditPath(propertyId: string) {
  return `${routePaths.dashboardProperties}/${propertyId}/edit`
}

function PropertyDetailContent({ property }: { property: Property }) {
  return (
    <div className="property-detail-card">
      <div className="property-detail-card__section">
        <span className="property-detail-card__label">Name</span>
        <p>{property.name}</p>
      </div>

      <div className="property-detail-card__section">
        <span className="property-detail-card__label">Address</span>
        <p>{formatOptionalText(property.address)}</p>
      </div>

      <div className="property-detail-card__section">
        <span className="property-detail-card__label">Notes</span>
        <p>{formatOptionalText(property.notes)}</p>
      </div>

      <div
        className="property-detail-card__meta"
        aria-label="Property metadata"
      >
        <div>
          <span className="property-detail-card__label">Created</span>
          <p>{formatPropertyDate(property.created_at)}</p>
        </div>
        <div>
          <span className="property-detail-card__label">Last updated</span>
          <p>{formatPropertyDate(property.updated_at)}</p>
        </div>
      </div>
    </div>
  )
}

export function PropertyDetailPage() {
  const { propertyId } = useParams<{ propertyId: string }>()
  const propertyQuery = usePropertyQuery(propertyId)

  return (
    <AppLayout>
      <section
        className="property-detail-page"
        aria-labelledby="property-detail-title"
      >
        <div className="property-detail-page__header">
          <div>
            <h2 id="property-detail-title">Property details</h2>
            <p>
              Review this property record. Units and other rental operations are
              intentionally outside this slice.
            </p>
          </div>
          <div className="property-detail-page__actions">
            {propertyId ? (
              <Link to={getPropertyEditPath(propertyId)}>Edit property</Link>
            ) : null}
            <Link to={routePaths.dashboardProperties}>Back to properties</Link>
          </div>
        </div>

        {!propertyId ? (
          <div className="property-detail-page__empty">
            <h3>Property not found</h3>
            <p>
              This property is missing or is not accessible to your account.
            </p>
          </div>
        ) : null}

        {propertyQuery.isLoading ? (
          <p className="property-detail-page__status">Loading property...</p>
        ) : null}

        {propertyQuery.isError ? (
          <p className="property-detail-page__error" role="alert">
            We could not load this property right now. Please try again later.
          </p>
        ) : null}

        {propertyQuery.isSuccess && propertyQuery.data === null ? (
          <div className="property-detail-page__empty">
            <h3>Property not found</h3>
            <p>
              This property may not exist or may not be accessible to your
              account.
            </p>
          </div>
        ) : null}

        {propertyQuery.isSuccess && propertyQuery.data !== null ? (
          <div className="property-detail-layout">
            <PropertyDetailContent property={propertyQuery.data} />
            <PropertyUnitsSection propertyId={propertyQuery.data.id} />
          </div>
        ) : null}
      </section>
    </AppLayout>
  )
}
