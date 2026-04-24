export const ROUTES = {
  HOME: '/',
  CALENDAR: '/calendar',
  TIMELINE: '/timeline',
  SHARE: (token: string) => `/share/${token}`,
} as const
