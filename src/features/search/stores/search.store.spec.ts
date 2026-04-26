import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import { useSearchStore } from './search.store'
import { ApiError } from '@/shared/api/tvmaze-errors'
import type { ShowSummary } from '@/shared/types/show'

// ── mock the API façade ───────────────────────────────────────────────────────
vi.mock('@/shared/api/shows-api', () => ({
  searchShows: vi.fn(),
}))

import { searchShows } from '@/shared/api/shows-api'
const mockSearchShows = vi.mocked(searchShows)

// ── fake timers ───────────────────────────────────────────────────────────────
// We control time so tests don't wait 300 ms for the debounce to fire.

beforeEach(() => {
  vi.useFakeTimers()
  setActivePinia(createPinia())
  mockSearchShows.mockReset()
})

afterEach(() => {
  vi.useRealTimers()
})

// ── fixtures ─────────────────────────────────────────────────────────────────

function makeShow(id: number): ShowSummary {
  return {
    id,
    name: `Show ${id}`,
    genres: [],
    rating: 8.0,
    summaryHtml: '',
    summaryText: '',
    image: null,
    premieredYear: null,
    status: 'running',
    language: 'English',
    network: null,
  }
}

const resultA = makeShow(1)
const resultB = makeShow(2)

// ── tests ─────────────────────────────────────────────────────────────────────

describe('useSearchStore', () => {
  // ── initial state ──────────────────────────────────────────────────────────

  describe('initial state', () => {
    it('starts with query = empty string', () => {
      expect(useSearchStore().query).toBe('')
    })

    it('starts with shows = []', () => {
      expect(useSearchStore().shows).toEqual([])
    })

    it('starts with loading = false', () => {
      expect(useSearchStore().loading).toBe(false)
    })

    it('starts with error = null', () => {
      expect(useSearchStore().error).toBeNull()
    })
  })

  // ── debouncing ────────────────────────────────────────────────────────────

  describe('debouncing', () => {
    it('does not call the API before the debounce delay has passed', async () => {
      mockSearchShows.mockResolvedValue([resultA])
      const store = useSearchStore()
      store.setQuery('break')
      // Advance time by less than the debounce window
      await vi.advanceTimersByTimeAsync(100)
      expect(mockSearchShows).not.toHaveBeenCalled()
    })

    it('calls the API once after the debounce delay', async () => {
      mockSearchShows.mockResolvedValue([resultA])
      const store = useSearchStore()
      store.setQuery('breaking bad')
      await vi.advanceTimersByTimeAsync(300)
      expect(mockSearchShows).toHaveBeenCalledExactlyOnceWith('breaking bad')
    })

    it('cancels the previous timer when query changes quickly', async () => {
      mockSearchShows.mockResolvedValue([resultA])
      const store = useSearchStore()
      store.setQuery('b')
      await vi.advanceTimersByTimeAsync(100)
      store.setQuery('br')
      await vi.advanceTimersByTimeAsync(100)
      store.setQuery('breaking')
      await vi.advanceTimersByTimeAsync(300)
      // Only the final query triggers an API call
      expect(mockSearchShows).toHaveBeenCalledExactlyOnceWith('breaking')
    })
  })

  // ── empty / whitespace query ──────────────────────────────────────────────

  describe('empty query handling', () => {
    it('clears results immediately when query is set to empty string', async () => {
      mockSearchShows.mockResolvedValue([resultA])
      const store = useSearchStore()
      store.setQuery('breaking bad')
      await vi.advanceTimersByTimeAsync(300)

      store.setQuery('')
      await vi.advanceTimersByTimeAsync(300)
      expect(store.shows).toEqual([])
      // Only the first search should have fired
      expect(mockSearchShows).toHaveBeenCalledOnce()
    })

    it('does not call the API for a whitespace-only query', async () => {
      const store = useSearchStore()
      store.setQuery('   ')
      await vi.advanceTimersByTimeAsync(300)
      expect(mockSearchShows).not.toHaveBeenCalled()
    })
  })

  // ── results ───────────────────────────────────────────────────────────────

  describe('results', () => {
    it('populates results after a successful search', async () => {
      mockSearchShows.mockResolvedValue([resultA, resultB])
      const store = useSearchStore()
      store.setQuery('show')
      await vi.advanceTimersByTimeAsync(300)
      expect(store.shows).toStrictEqual([resultA, resultB])
    })
  })

  // ── error handling ────────────────────────────────────────────────────────

  describe('error handling', () => {
    it('sets an i18n error key when the API call fails', async () => {
      mockSearchShows.mockRejectedValue(new ApiError('Server Error', 500, '/search/shows'))
      const store = useSearchStore()
      store.setQuery('breaking bad')
      await vi.advanceTimersByTimeAsync(300)
      expect(store.error).toBe('errors.network')
    })

    it('clears results on error', async () => {
      mockSearchShows.mockRejectedValue(new ApiError('Server Error', 500, '/search/shows'))
      const store = useSearchStore()
      store.setQuery('breaking bad')
      await vi.advanceTimersByTimeAsync(300)
      expect(store.shows).toEqual([])
    })

    it('clears error on a subsequent successful search', async () => {
      mockSearchShows.mockRejectedValueOnce(new ApiError('Server Error', 500, '/search/shows'))
      mockSearchShows.mockResolvedValueOnce([resultA])
      const store = useSearchStore()

      store.setQuery('breaking bad')
      await vi.advanceTimersByTimeAsync(300)
      expect(store.error).toBe('errors.network')

      store.setQuery('breaking bad 2')
      await vi.advanceTimersByTimeAsync(300)
      expect(store.error).toBeNull()
    })
  })

  // ── clearSearch ───────────────────────────────────────────────────────────

  describe('clearSearch', () => {
    it('resets query, shows, and error', async () => {
      mockSearchShows.mockResolvedValue([resultA])
      const store = useSearchStore()
      store.setQuery('breaking bad')
      await vi.advanceTimersByTimeAsync(300)

      store.clearSearch()
      expect(store.query).toBe('')
      expect(store.shows).toEqual([])
      expect(store.error).toBeNull()
    })

    it('cancels a pending debounce when cleared', async () => {
      const store = useSearchStore()
      store.setQuery('break')
      store.clearSearch()
      await vi.advanceTimersByTimeAsync(300)
      expect(mockSearchShows).not.toHaveBeenCalled()
    })
  })
})
