import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import { useShowDetailsStore } from './show-detail.store'
import { ApiError } from '@/shared/api/tvmaze-errors'
import type { ShowDetails } from '@/shared/types/show'

// ── mock the API façade ───────────────────────────────────────────────────────
vi.mock('@/shared/api/shows-api', () => ({
  getShowDetails: vi.fn(),
}))

import { getShowDetails } from '@/shared/api/shows-api'
const mockGetShowDetails = vi.mocked(getShowDetails)

// ── fixtures ─────────────────────────────────────────────────────────────────

const breakingBad: ShowDetails = {
  id: 169,
  name: 'Breaking Bad',
  genres: ['Drama', 'Crime', 'Thriller'],
  rating: 9.9,
  summaryHtml: '<p>Chemistry teacher turns drug lord.</p>',
  summaryText: 'Chemistry teacher turns drug lord.',
  image: { medium: 'https://example.com/bb-med.jpg', original: 'https://example.com/bb.jpg' },
  premieredYear: 2008,
  status: 'ended',
  language: 'English',
  network: 'AMC',
  officialSite: 'https://www.amc.com/shows/breaking-bad',
  schedule: { time: '21:00', days: ['Sunday'] },
  cast: [],
  images: [],
}

// ── tests ─────────────────────────────────────────────────────────────────────

describe('useShowDetailStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockGetShowDetails.mockReset()
  })

  // ── initial state ──────────────────────────────────────────────────────────

  describe('initial state', () => {
    it('starts with show = null', () => {
      expect(useShowDetailsStore().details).toBeNull()
    })

    it('starts with loading = false', () => {
      expect(useShowDetailsStore().loading).toBe(false)
    })

    it('starts with error = null', () => {
      expect(useShowDetailsStore().error).toBeNull()
    })
  })

  // ── fetchShow — happy path ─────────────────────────────────────────────────

  describe('fetchShow', () => {
    it('populates show after a successful fetch', async () => {
      mockGetShowDetails.mockResolvedValue(breakingBad)
      const store = useShowDetailsStore()
      await store.fetchDetails(169)
      expect(store.details).toStrictEqual(breakingBad)
    })

    it('clears show and error at the start of a new fetch', async () => {
      mockGetShowDetails.mockResolvedValue(breakingBad)
      const store = useShowDetailsStore()
      store.error = 'errors.generic'
      await store.fetchDetails(169)
      expect(store.error).toBeNull()
    })

    it('sets loading = false after the fetch completes', async () => {
      mockGetShowDetails.mockResolvedValue(breakingBad)
      const store = useShowDetailsStore()
      await store.fetchDetails(169)
      expect(store.loading).toBe(false)
    })
  })

  // ── fetchShow — error handling ────────────────────────────────────────────

  describe('fetchShow — error handling', () => {
    it('sets errors.notFound key for a 404', async () => {
      mockGetShowDetails.mockRejectedValue(new ApiError('Not Found', 404, '/shows/999'))
      const store = useShowDetailsStore()
      await store.fetchDetails(999)
      expect(store.error).toBe('errors.notFound')
    })

    it('sets errors.network key for a server error', async () => {
      mockGetShowDetails.mockRejectedValue(new ApiError('Server Error', 500, '/shows/1'))
      const store = useShowDetailsStore()
      await store.fetchDetails(1)
      expect(store.error).toBe('errors.network')
    })

    it('sets errors.generic for an unexpected error', async () => {
      mockGetShowDetails.mockRejectedValue(new Error('Unexpected'))
      const store = useShowDetailsStore()
      await store.fetchDetails(1)
      expect(store.error).toBe('errors.generic')
    })

    it('sets show = null when the fetch fails', async () => {
      mockGetShowDetails.mockRejectedValue(new ApiError('Not Found', 404, '/shows/999'))
      const store = useShowDetailsStore()
      await store.fetchDetails(999)
      expect(store.details).toBeNull()
    })
  })

  // ── caching ───────────────────────────────────────────────────────────────

  describe('caching', () => {
    it('does not re-fetch a show that is already cached', async () => {
      mockGetShowDetails.mockResolvedValue(breakingBad)
      const store = useShowDetailsStore()
      await store.fetchDetails(169)
      await store.fetchDetails(169)
      expect(mockGetShowDetails).toHaveBeenCalledTimes(1)
    })

    it('returns the cached show immediately (loading stays false)', async () => {
      mockGetShowDetails.mockResolvedValue(breakingBad)
      const store = useShowDetailsStore()
      await store.fetchDetails(169)

      const loadingDuringCacheHit: boolean[] = []
      mockGetShowDetails.mockImplementation(async () => {
        loadingDuringCacheHit.push(store.loading)
        return breakingBad
      })
      await store.fetchDetails(169)

      // getShowDetails was never called again, so the spy array is empty.
      expect(loadingDuringCacheHit).toHaveLength(0)
      expect(store.loading).toBe(false)
    })

    it('fetches a different show separately', async () => {
      const otherShow: ShowDetails = { ...breakingBad, id: 42, name: 'Other Show' }
      mockGetShowDetails.mockResolvedValueOnce(breakingBad).mockResolvedValueOnce(otherShow)

      const store = useShowDetailsStore()
      await store.fetchDetails(169)
      await store.fetchDetails(42)

      expect(mockGetShowDetails).toHaveBeenCalledTimes(2)
      expect(store.details).toStrictEqual(otherShow)
    })
  })

  // ── clearShow ─────────────────────────────────────────────────────────────

  describe('clearShow', () => {
    it('resets show to null', async () => {
      mockGetShowDetails.mockResolvedValue(breakingBad)
      const store = useShowDetailsStore()
      await store.fetchDetails(169)
      store.clearDetails()
      expect(store.details).toBeNull()
    })

    it('resets error to null', async () => {
      const store = useShowDetailsStore()
      store.error = 'errors.generic'
      store.clearDetails()
      expect(store.error).toBeNull()
    })

    it('does not clear the cache — re-fetch after clear uses cache', async () => {
      mockGetShowDetails.mockResolvedValue(breakingBad)
      const store = useShowDetailsStore()
      await store.fetchDetails(169)
      store.clearDetails()
      await store.fetchDetails(169)
      expect(mockGetShowDetails).toHaveBeenCalledTimes(1) // still only the first call
    })
  })
})
