import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { getPerson, getPersonCastCredits, getShows, getShowWithDetails, searchShows } from './tvmaze-api'
import { ApiError } from './api-errors'

describe('TVMaze API', () => {
  const fetchMock = vi.fn<typeof fetch>()

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    fetchMock.mockReset()
    vi.unstubAllGlobals()
  })

  describe('getShows', () => {
    it('defaults to page 0 and returns the parsed array', async () => {
      const fakeShows = [{ id: 1, name: 'Show A' }]
      fetchMock.mockResolvedValueOnce(mockJsonResponse(fakeShows))

      const result = await getShows()

      expect(getFetchedUrl(fetchMock)).toBe('https://api.tvmaze.com/shows?page=0')
      expect(result).toEqual(fakeShows)
    })

    it('forwards an explicit page number', async () => {
      fetchMock.mockResolvedValueOnce(mockJsonResponse([]))

      await getShows(3)

      expect(getFetchedUrl(fetchMock)).toBe('https://api.tvmaze.com/shows?page=3')
    })
  })

  describe('getShowWithDetails', () => {
    it('embeds cast and episodes via repeated embed[] params', async () => {
      fetchMock.mockResolvedValueOnce(mockJsonResponse({ id: 1, name: 'Show A' }))

      await getShowWithDetails(1)

      // URL encodes `[` and `]` as %5B and %5D — that is correct.
      expect(getFetchedUrl(fetchMock)).toBe('https://api.tvmaze.com/shows/1?embed%5B%5D=cast&embed%5B%5D=episodes')
    })

    it('returns the parsed show', async () => {
      const fakeShow = { id: 42, name: 'Show 42', _embedded: { cast: [], episodes: [] } }
      fetchMock.mockResolvedValueOnce(mockJsonResponse(fakeShow))

      const result = await getShowWithDetails(42)

      expect(result).toEqual(fakeShow)
    })
  })

  describe('searchShows', () => {
    it('encodes the query string safely', async () => {
      fetchMock.mockResolvedValueOnce(mockJsonResponse([]))

      await searchShows('breaking bad')

      // URLSearchParams encodes spaces as `+`.
      expect(getFetchedUrl(fetchMock)).toBe('https://api.tvmaze.com/search/shows?q=breaking+bad')
    })

    it('returns the parsed search results', async () => {
      const fakeResults = [{ score: 0.9, show: { id: 1, name: 'Show A' } }]
      fetchMock.mockResolvedValueOnce(mockJsonResponse(fakeResults))

      const result = await searchShows('show')

      expect(result).toEqual(fakeResults)
    })
  })

  describe('getPerson', () => {
    it('fetches the person by ID from the correct URL', async () => {
      const fakePerson = { id: 1, name: 'Person Name' }
      fetchMock.mockResolvedValueOnce(mockJsonResponse(fakePerson))

      const result = await getPerson(1)

      expect(getFetchedUrl(fetchMock)).toBe('https://api.tvmaze.com/people/1')
      expect(result).toEqual(fakePerson)
    })
  })

  describe('getPersonCastCredits', () => {
    it('fetches credits with the show embedded', async () => {
      const fakeCredits = [{ self: false, voice: false, _links: {} }]
      fetchMock.mockResolvedValueOnce(mockJsonResponse(fakeCredits))

      const result = await getPersonCastCredits(1)

      expect(getFetchedUrl(fetchMock)).toBe('https://api.tvmaze.com/people/1/castcredits?embed=show')
      expect(result).toEqual(fakeCredits)
    })
  })

  describe('error handling', () => {
    it('throws ApiError on a non-2xx response with status and URL', async () => {
      fetchMock.mockResolvedValueOnce(mockJsonResponse({ message: 'not found' }, { status: 404 }))

      const promise = getShowWithDetails(99999999)

      await expect(promise).rejects.toBeInstanceOf(ApiError)
      await expect(promise).rejects.toMatchObject({
        status: 404,
        url: 'https://api.tvmaze.com/shows/99999999?embed%5B%5D=cast&embed%5B%5D=episodes',
      })
    })

    it('propagates network errors (fetch rejection) unchanged', async () => {
      const networkError = new TypeError('Failed to fetch')
      fetchMock.mockRejectedValueOnce(networkError)

      await expect(getShows()).rejects.toBe(networkError)
    })
  })
})

function mockJsonResponse(body: unknown, init: ResponseInit = { status: 200 }): Response {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: { 'content-type': 'application/json', ...init.headers },
  })
}

function getFetchedUrl(fetchMock: ReturnType<typeof vi.fn>, callIndex = 0): string {
  const arg = fetchMock.mock.calls[callIndex]?.[0]
  return arg instanceof URL ? arg.toString() : String(arg)
}
