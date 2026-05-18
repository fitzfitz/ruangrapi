export const routePaths = {
  home: '/',
  auth: '/auth',
  signup: '/signup',
  onboarding: '/onboarding',
  dashboard: '/dashboard',
} as const

export type RoutePath = (typeof routePaths)[keyof typeof routePaths]
