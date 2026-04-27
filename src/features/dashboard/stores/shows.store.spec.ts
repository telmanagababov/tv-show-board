import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import { useShowsStore } from './shows.store'
import { ApiError } from '@/shared/api/tvmaze-errors'
import type { ShowSummary } from '@/shared/types/show'
import { getShows } from '@/shared/api/shows-api'

vi.mock('@/shared/api/shows-api', () => ({
  getShows: vi.fn(),
}))

describe('useShowsStore', () => {
  const mockGetShows = vi.mocked(getShows)

  const drama1 = makeShow({ id: 1, genres: ['Drama'], rating: 8.5 })
  const drama2 = makeShow({ id: 2, genres: ['Drama'], rating: 7.0 })
  const comedy1 = makeShow({ id: 3, genres: ['Comedy'], rating: 9.1 })
  const multiGenre = makeShow({ id: 4, genres: ['Drama', 'Comedy'], rating: 6.0 })
  const unrated = makeShow({ id: 5, genres: ['Drama'], rating: null })

  const notFoundError = new ApiError('Not Found', 404, '/shows?page=99')
  const serverError = new ApiError('Server Error', 500, '/shows?page=0')

  beforeEach(() => {
    setActivePinia(createPinia())
    mockGetShows.mockReset()
  })

  describe('initial state', () => {
    it('starts with an empty show list', () => {
      expect(useShowsStore().shows).toEqual([])
    })

    it('starts with loading = false', () => {
      expect(useShowsStore().loading).toBe(false)
    })

    it('starts with error = null', () => {
      expect(useShowsStore().error).toBeNull()
    })

    it('starts with hasMore = true', () => {
      expect(useShowsStore().hasMore).toBe(true)
    })
  })

  describe('fetchShows', () => {
    it('fetches 5 pages simultaneously on first call', async () => {
      mockAllPagesResolve([drama1])
      await useShowsStore().fetchShows()
      expect(mockGetShows).toHaveBeenCalledTimes(5)
      expect(mockGetShows).toHaveBeenCalledWith(0)
      expect(mockGetShows).toHaveBeenCalledWith(4)
    })

    it('is a no-op when shows are already loaded', async () => {
      mockAllPagesResolve([drama1])
      const store = useShowsStore()
      await store.fetchShows()
      mockGetShows.mockReset()
      await store.fetchShows()
      expect(mockGetShows).not.toHaveBeenCalled()
    })

    it('sets an i18n error key when all pages fail with a server error', async () => {
      mockGetShows.mockRejectedValue(serverError)
      const store = useShowsStore()
      await store.fetchShows()
      expect(store.error).toBe('errors.network')
    })

    it('retries after a failed initial fetch because shows remain empty', async () => {
      mockGetShows.mockRejectedValue(serverError)
      const store = useShowsStore()
      await store.fetchShows()

      mockGetShows.mockReset()
      mockAllPagesResolve([drama1])
      await store.fetchShows()
      expect(store.error).toBeNull()
      expect(store.shows.length).toBeGreaterThan(0)
    })

    it('ignores a concurrent call while a fetch is in flight', async () => {
      mockAllPagesResolve([drama1])
      const store = useShowsStore()
      await Promise.all([store.fetchShows(), store.fetchShows()])
      expect(mockGetShows).toHaveBeenCalledTimes(5)
    })
  })

  describe('fetchMoreShows', () => {
    it('advances nextPage by PAGES_PER_BATCH after a full batch', async () => {
      mockAllPagesResolve([drama1])
      const store = useShowsStore()
      await store.fetchShows()
      mockGetShows.mockReset()
      mockAllPagesResolve([drama2])
      await store.fetchMoreShows()
      expect(mockGetShows).toHaveBeenCalledWith(store.PAGES_PER_BATCH)
      expect(mockGetShows).toHaveBeenCalledWith(store.PAGES_PER_BATCH * 2 - 1)
    })

    it('appends shows from subsequent buckets', async () => {
      const store = useShowsStore()
      mockAllPagesResolve([drama1])
      await store.fetchShows()
      mockGetShows.mockReset()
      mockAllPagesResolve([comedy1])
      await store.fetchMoreShows()
      expect(store.shows).toContainEqual(drama1)
      expect(store.shows).toContainEqual(comedy1)
    })

    it('does not duplicate shows from the same bucket', async () => {
      mockAllPagesResolve([drama1])
      const store = useShowsStore()
      await store.fetchMoreShows()
      expect(store.shows).toHaveLength(5)
    })

    it('sets hasMore = false when any page returns 404', async () => {
      mockPartialPages([drama1], 3)
      const store = useShowsStore()
      await store.fetchMoreShows()
      expect(store.hasMore).toBe(false)
    })

    it('still stores data from pages that succeeded before the 404', async () => {
      mockPartialPages([drama1], 3)
      const store = useShowsStore()
      await store.fetchMoreShows()
      expect(store.shows.length).toBeGreaterThan(0)
      expect(store.error).toBeNull()
    })

    it('does not fetch when hasMore is false', async () => {
      mockAllPagesResolve([drama1])
      const store = useShowsStore()
      await store.fetchMoreShows()
      store.hasMore = false
      mockGetShows.mockReset()
      await store.fetchMoreShows()
      expect(mockGetShows).not.toHaveBeenCalled()
    })
  })

  describe('showsByGenre', () => {
    it('groups shows into the correct genres', async () => {
      mockAllPagesResolve([drama1])
      const store = useShowsStore()
      await store.fetchShows()
      expect(store.showsByGenre.get('Drama')).toBeDefined()
    })

    it('places a multi-genre show in every matching bucket', async () => {
      mockGetShows.mockResolvedValue([multiGenre])
      const store = useShowsStore()
      await store.fetchShows()
      expect(store.showsByGenre.get('Drama')).toContainEqual(multiGenre)
      expect(store.showsByGenre.get('Comedy')).toContainEqual(multiGenre)
    })

    it('sorts each genre bucket by rating descending', async () => {
      mockGetShows.mockImplementation((page = 0) =>
        (page as number) === 0 ? Promise.resolve([drama2, drama1, multiGenre]) : Promise.resolve([]),
      )
      const store = useShowsStore()
      await store.fetchShows()
      const bucket = store.showsByGenre.get('Drama')!
      expect(bucket[0]!.rating).toBeGreaterThan(bucket[1]!.rating!)
    })

    it('sorts unrated shows to the end of their bucket', async () => {
      mockGetShows.mockResolvedValue([unrated, drama2])
      const store = useShowsStore()
      await store.fetchShows()
      const bucket = store.showsByGenre.get('Drama')!
      const lastItem = bucket[bucket.length - 1]
      expect(lastItem!.rating).toBeNull()
    })
  })

  describe('genres', () => {
    it('returns genre names in alphabetical order', async () => {
      mockGetShows.mockResolvedValue([drama1, comedy1])
      const store = useShowsStore()
      await store.fetchShows()
      expect(store.genres).toEqual([...store.genres].sort())
    })

    it('deduplicates genres from multi-genre shows', async () => {
      mockGetShows.mockResolvedValue([drama1, multiGenre])
      const store = useShowsStore()
      await store.fetchShows()
      expect(store.genres.filter((g) => g === 'Drama')).toHaveLength(1)
    })
  })

  function makeShow(overrides: Partial<ShowSummary> & { id: number }): ShowSummary {
    return {
      name: `Show ${overrides.id}`,
      genres: [],
      rating: null,
      summaryHtml: '',
      summaryText: '',
      image: null,
      premieredYear: null,
      status: 'running',
      language: 'English',
      network: null,
      ...overrides,
    }
  }

  function mockAllPagesResolve(shows: ShowSummary[]): void {
    mockGetShows.mockResolvedValue(shows)
  }

  function mockPartialPages(shows: ShowSummary[], successPages: number): void {
    mockGetShows.mockImplementation((page = 0) => {
      const adjustedPage = (page as number) % 5
      return adjustedPage < successPages ? Promise.resolve(shows) : Promise.reject(notFoundError)
    })
  }
})
