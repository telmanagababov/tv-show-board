/**
 * API error types and classifiers.
 */

/**
 * API error type.
 */
export class ApiError extends Error {
  readonly status: number
  readonly url: string

  constructor(message: string, status: number, url: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.url = url
  }
}

/**
 * Classifies a caught value into a key.
 */
export function toErrorKey(err: unknown): string {
  if (err instanceof ApiError) {
    return err.status === 404 ? 'errors.notFound' : 'errors.network'
  }
  return 'errors.generic'
}
