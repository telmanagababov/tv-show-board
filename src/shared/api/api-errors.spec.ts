import { describe, expect, it } from 'vitest'
import { ApiError, toErrorKey } from './api-errors'

describe('ApiError', () => {
  it('is an instance of Error', () => {
    const err = new ApiError('fail', 500, '/shows')
    expect(err).toBeInstanceOf(Error)
  })

  it('sets name to "ApiError"', () => {
    const err = new ApiError('fail', 500, '/shows')
    expect(err.name).toBe('ApiError')
  })

  it('exposes the message passed to the constructor', () => {
    const err = new ApiError('Not Found', 404, '/shows/99')
    expect(err.message).toBe('Not Found')
  })

  it('exposes the status code', () => {
    const err = new ApiError('fail', 503, '/shows')
    expect(err.status).toBe(503)
  })

  it('exposes the request URL', () => {
    const err = new ApiError('fail', 404, '/people/42')
    expect(err.url).toBe('/people/42')
  })
})

describe('toErrorKey', () => {
  it('returns "errors.notFound" for a 404 ApiError', () => {
    expect(toErrorKey(new ApiError('Not Found', 404, '/shows/99'))).toBe('errors.notFound')
  })

  it('returns "errors.network" for a non-404 ApiError', () => {
    expect(toErrorKey(new ApiError('Server Error', 500, '/shows'))).toBe('errors.network')
    expect(toErrorKey(new ApiError('Bad Gateway', 502, '/shows'))).toBe('errors.network')
    expect(toErrorKey(new ApiError('Unauthorized', 401, '/shows'))).toBe('errors.network')
  })

  it('returns "errors.generic" for a plain Error', () => {
    expect(toErrorKey(new Error('something broke'))).toBe('errors.generic')
  })

  it('returns "errors.generic" for a thrown string', () => {
    expect(toErrorKey('oops')).toBe('errors.generic')
  })

  it('returns "errors.generic" for undefined', () => {
    expect(toErrorKey(undefined)).toBe('errors.generic')
  })

  it('returns "errors.generic" for null', () => {
    expect(toErrorKey(null)).toBe('errors.generic')
  })
})
