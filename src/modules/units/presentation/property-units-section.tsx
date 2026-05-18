import { Link } from 'react-router-dom'

import { routePaths } from '../../../app/router/route-paths'
import type { Unit } from '../domain/unit'
import { useUnitsByPropertyQuery } from '../application/use-units-by-property-query'

type PropertyUnitsSectionProps = {
  propertyId: string
}

function getCreateUnitPath(propertyId: string) {
  return `${routePaths.dashboardProperties}/${propertyId}/units/new`
}

function formatUnitType(unit: Unit) {
  return unit.type.replace('_', ' ')
}

function formatOptionalText(value: string | null) {
  return value?.trim() || 'No notes.'
}

export function PropertyUnitsSection({
  propertyId,
}: PropertyUnitsSectionProps) {
  const unitsQuery = useUnitsByPropertyQuery(propertyId)

  return (
    <section className="property-units-section" aria-labelledby="units-title">
      <div className="property-units-section__header">
        <div>
          <h3 id="units-title">Units</h3>
          <p>
            View rentable units connected to this property. This create-unit
            slice keeps tenant, lease, rent, and occupancy workflows for later.
          </p>
        </div>
        <Link to={getCreateUnitPath(propertyId)}>Add unit</Link>
      </div>

      {unitsQuery.isLoading ? (
        <p className="property-units-section__status">Loading units...</p>
      ) : null}

      {unitsQuery.isError ? (
        <p className="property-units-section__error" role="alert">
          We could not load units for this property right now. Please try again
          later.
        </p>
      ) : null}

      {unitsQuery.isSuccess && unitsQuery.data.length === 0 ? (
        <div className="property-units-section__empty">
          <h4>No units yet</h4>
          <p>
            Add a unit for this property to start organizing rentable spaces.
            Tenant, lease, rent, and occupancy workflows will come in later
            slices.
          </p>
        </div>
      ) : null}

      {unitsQuery.isSuccess && unitsQuery.data.length > 0 ? (
        <div className="property-units-section__list" aria-label="Units list">
          {unitsQuery.data.map((unit) => (
            <article className="unit-card" key={unit.id}>
              <div>
                <h4>{unit.name}</h4>
                <p className="unit-card__type">{formatUnitType(unit)}</p>
              </div>
              <p className="unit-card__notes">
                {formatOptionalText(unit.notes)}
              </p>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  )
}
