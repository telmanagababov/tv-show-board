import { defineComponent } from 'vue'
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'

import { useSearchStore } from './search.store'
import { ApiError, searchShows } from '@/shared/api'
import { RouteNames, SEARCH_QUERY_KEY } from '@/shared/constants'
import type { ShowSummary } from '@/shared/types'

vi.mock('@/shared/api', async (importOriginal) => ({
  ...(await importOriginal()),
  searchShows: vi.fn<typeof searchShows>(),
}))

describe('useSearchStore', () => {
  const DEBOUNCE_MS = 500
  const mockSearchShows = vi.mocked(searchShows)
  const showA = generateShow(1)
  const showB = generateShow(2)

  beforeEach(() => {
    vi.useFakeTimers()
    mockSearchShows.mockReset()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('initial state (no search query in URL)', () => {
    it('starts with shows = []', async () => {
      const { store } = await setupStore('/')
      expect(store.shows).toEqual([])
    })

    it('starts with loading = false', async () => {
      const { store } = await setupStore('/')
      expect(store.loading).toBe(false)
    })

    it('starts with error = null', async () => {
      const { store } = await setupStore('/')
      expect(store.error).toBeNull()
    })
  })

  describe('debouncing', () => {
    it('does not call the API before the debounce delay has passed', async () => {
      mockSearchShows.mockResolvedValue([showA])
      const { router } = await setupStore('/')

      await searchFor(router, 'break')
      await vi.advanceTimersByTimeAsync(100)

      expect(mockSearchShows).not.toHaveBeenCalled()
    })

    it('calls the API once after the debounce delay', async () => {
      mockSearchShows.mockResolvedValue([showA])
      const { router } = await setupStore('/')

      await searchFor(router, 'breaking bad')
      await vi.advanceTimersByTimeAsync(DEBOUNCE_MS)

      expect(mockSearchShows).toHaveBeenCalledExactlyOnceWith('breaking bad')
    })

    it('cancels the previous timer when the query changes before the delay expires', async () => {
      mockSearchShows.mockResolvedValue([showA])
      const { router } = await setupStore('/')

      await searchFor(router, 'b')
      await vi.advanceTimersByTimeAsync(100)
      await searchFor(router, 'br')
      await vi.advanceTimersByTimeAsync(100)
      await searchFor(router, 'breaking')
      await vi.advanceTimersByTimeAsync(DEBOUNCE_MS)

      // Only the last query should have triggered an API call
      expect(mockSearchShows).toHaveBeenCalledExactlyOnceWith('breaking')
    })
  })

  describe('direct navigation (bookmark / refresh)', () => {
    it('fetches results when mounted with a query already in the URL', async () => {
      mockSearchShows.mockResolvedValue([showA])

      // The store is initialised with a URL that already has a query.
      // The `immediate: true` watcher fires on setup → debounce starts.
      await setupStore(`/search?${SEARCH_QUERY_KEY}=sopranos`)
      await vi.advanceTimersByTimeAsync(DEBOUNCE_MS)

      expect(mockSearchShows).toHaveBeenCalledExactlyOnceWith('sopranos')
    })
  })

  describe('empty query handling', () => {
    it('clears results and does not call the API when the query becomes empty', async () => {
      mockSearchShows.mockResolvedValue([showA])
      const { store, router } = await setupStore('/')

      await searchFor(router, 'breaking bad')
      await vi.advanceTimersByTimeAsync(DEBOUNCE_MS)
      expect(store.shows).toHaveLength(1)

      // Navigate away from /search — q param disappears → watcher fires with ''
      await router.push('/')
      await vi.advanceTimersByTimeAsync(DEBOUNCE_MS)

      expect(store.shows).toEqual([])
      expect(mockSearchShows).toHaveBeenCalledOnce() // no second call
    })

    it('does not call the API for a whitespace-only query', async () => {
      const { router } = await setupStore('/')
      await searchFor(router, '   ')
      await vi.advanceTimersByTimeAsync(DEBOUNCE_MS)
      expect(mockSearchShows).not.toHaveBeenCalled()
    })
  })

  describe('results', () => {
    it('populates results after a successful search', async () => {
      mockSearchShows.mockResolvedValue([showA, showB])
      const { store, router } = await setupStore('/')

      await searchFor(router, 'show')
      await vi.advanceTimersByTimeAsync(DEBOUNCE_MS)
      await flushPromises()

      expect(store.shows).toStrictEqual([showA, showB])
    })
  })

  describe('error handling', () => {
    it('sets an i18n error key when the API call fails', async () => {
      mockSearchShows.mockRejectedValue(new ApiError('Server Error', 500, '/search/shows'))
      const { store, router } = await setupStore('/')

      await searchFor(router, 'breaking bad')
      await vi.advanceTimersByTimeAsync(DEBOUNCE_MS)
      await flushPromises()

      expect(store.error).toBe('errors.network')
    })

    it('clears results on error', async () => {
      mockSearchShows.mockRejectedValue(new ApiError('Server Error', 500, '/search/shows'))
      const { store, router } = await setupStore('/')

      await searchFor(router, 'breaking bad')
      await vi.advanceTimersByTimeAsync(DEBOUNCE_MS)
      await flushPromises()

      expect(store.shows).toEqual([])
    })

    it('clears the error on a subsequent successful search', async () => {
      mockSearchShows.mockRejectedValueOnce(new ApiError('Server Error', 500, '/search/shows'))
      mockSearchShows.mockResolvedValueOnce([showA])
      const { store, router } = await setupStore('/')

      await searchFor(router, 'breaking bad')
      await vi.advanceTimersByTimeAsync(DEBOUNCE_MS)
      await flushPromises()
      expect(store.error).toBe('errors.network')

      await searchFor(router, 'breaking bad 2')
      await vi.advanceTimersByTimeAsync(DEBOUNCE_MS)
      await flushPromises()
      expect(store.error).toBeNull()
    })
  })

  async function setupStore(initialPath = '/') {
    const pinia = createPinia()
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', name: RouteNames.DASHBOARD, component: { template: '<div />' } },
        { path: '/search', name: RouteNames.SEARCH, component: { template: '<div />' } },
      ],
    })
    const StoreHost = defineComponent({
      setup() {
        useSearchStore()
      },
      template: '<div />',
    })
    await router.push(initialPath)
    mount(StoreHost, { global: { plugins: [pinia, router] } })
    return { store: useSearchStore(), router }
  }

  async function searchFor(router: ReturnType<typeof createRouter>, q: string) {
    await router.push(`/search?${SEARCH_QUERY_KEY}=${encodeURIComponent(q)}`)
  }

  function generateShow(id: number): ShowSummary {
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
})
