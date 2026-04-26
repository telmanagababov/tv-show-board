import { ApiError } from '@/shared/api/tvmaze-errors'

/**
 * Classifies a caught error into an i18n key suitable for display.
 */
export function toErrorKey(err: unknown): string {
  if (err instanceof ApiError) {
    return err.status === 404 ? 'errors.notFound' : 'errors.network'
  }
  return 'errors.generic'
}
