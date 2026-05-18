export const routePaths = {
  home: '/',
  auth: '/auth',
  onboarding: '/onboarding',
  dashboard: '/dashboard',
} as const

export type RoutePath = (typeof routePaths)[keyof typeof routePaths]
