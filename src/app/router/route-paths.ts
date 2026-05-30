export const routePaths = {
  home: '/',
  auth: '/auth',
  signup: '/signup',
  onboarding: '/onboarding',
  dashboard: '/dashboard',
  dashboardProperties: '/dashboard/properties',
  dashboardTenants: '/dashboard/tenants',
  dashboardTenantsNew: '/dashboard/tenants/new',
  dashboardTenantEdit: '/dashboard/tenants/:tenantId/edit',
  dashboardPropertyDetail: '/dashboard/properties/:propertyId',
  dashboardPropertyEdit: '/dashboard/properties/:propertyId/edit',
  dashboardPropertyUnitNew: '/dashboard/properties/:propertyId/units/new',
  dashboardPropertyUnitEdit:
    '/dashboard/properties/:propertyId/units/:unitId/edit',
  dashboardPropertiesNew: '/dashboard/properties/new',
} as const

export type RoutePath = (typeof routePaths)[keyof typeof routePaths]
