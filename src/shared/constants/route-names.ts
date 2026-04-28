/**
 * Route names for the application.
 */
export const RouteNames = {
  DASHBOARD: 'dashboard',
  DETAILS: 'details',
  PERSON: 'person',
  SEARCH: 'search',
  NOT_FOUND: 'not-found',
} as const

/**
 * Union of all valid route name strings
 */
export type RouteName = (typeof RouteNames)[keyof typeof RouteNames]

/**
 * The URL query-parameter key used to pass the search query between routes.
 */
export const SEARCH_QUERY_KEY = 'q'
