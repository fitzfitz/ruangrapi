export const routePaths = {
  home: '/',
  auth: '/auth',
  signup: '/signup',
  onboarding: '/onboarding',
  dashboard: '/dashboard',
  dashboardProperties: '/dashboard/properties',
  dashboardTenants: '/dashboard/tenants',
  dashboardLeases: '/dashboard/leases',
  dashboardLeasesNew: '/dashboard/leases/new',
  dashboardInvoices: '/dashboard/invoices',
  dashboardInvoicesNew: '/dashboard/invoices/new',
  dashboardTenantEdit: '/dashboard/tenants/:tenantId/edit',
  dashboardTenantsNew: '/dashboard/tenants/new',
  dashboardPropertyDetail: '/dashboard/properties/:propertyId',
  dashboardPropertyEdit: '/dashboard/properties/:propertyId/edit',
  dashboardPropertyUnitNew: '/dashboard/properties/:propertyId/units/new',
  dashboardPropertyUnitEdit:
    '/dashboard/properties/:propertyId/units/:unitId/edit',
  dashboardPropertiesNew: '/dashboard/properties/new',
} as const

export type RoutePath = (typeof routePaths)[keyof typeof routePaths]
