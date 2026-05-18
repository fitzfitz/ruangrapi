export const routePaths = {
  home: '/',
  auth: '/auth',
  signup: '/signup',
  onboarding: '/onboarding',
  dashboard: '/dashboard',
  dashboardProperties: '/dashboard/properties',
  dashboardPropertyDetail: '/dashboard/properties/:propertyId',
  dashboardPropertyEdit: '/dashboard/properties/:propertyId/edit',
  dashboardPropertiesNew: '/dashboard/properties/new',
} as const

export type RoutePath = (typeof routePaths)[keyof typeof routePaths]
