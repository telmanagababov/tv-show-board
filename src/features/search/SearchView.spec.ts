import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'

import { i18n } from '@/shared/i18n'
import SearchView from './SearchView.vue'
import { RouteNames } from '@/shared/constants'
import { useSearchStore } from './stores/search.store'
import type { ShowSummary } from '@/shared/types'

vi.mock('./stores/search.store', () => ({
  useSearchStore: vi.fn<() => ReturnType<typeof useSearchStore>>(),
}))

describe('SearchView', () => {
  const locators = {
    heading: '[data-testid="search-heading"]',
    loading: '[data-testid="search-loading"]',
    error: '[data-testid="search-error"]',
    errorMessage: '[data-testid="error-state-message"]',
    retryButton: '[data-testid="retry-button"]',
    empty: '[data-testid="search-empty"]',
    emptyMessage: '[data-testid="empty-state-message"]',
    results: '[data-testid="search-results"]',
    resultItem: '[data-testid="search-result-item"]',
  } as const

  const mockUseSearchStore = vi.mocked(useSearchStore)
  let view: VueWrapper<InstanceType<typeof SearchView>>

  beforeEach(() => {
    view = mountView(makeStore())
  })

  describe('loading state', () => {
    it('shows the loading indicator while fetching', () => {
      view = mountView(makeStore({ loading: true }))
      expect(view.find(locators.loading).exists()).toBe(true)
    })

    it('hides results and error while loading', () => {
      view = mountView(makeStore({ loading: true }))
      expect(view.find(locators.results).exists()).toBe(false)
      expect(view.find(locators.error).exists()).toBe(false)
    })

    it('hides the loading indicator when not loading', () => {
      expect(view.find(locators.loading).exists()).toBe(false)
    })
  })

  describe('error state', () => {
    it('shows the error block when the store has an error', () => {
      view = mountView(makeStore({ error: 'errors.network' }))
      expect(view.find(locators.error).exists()).toBe(true)
    })

    it('hides results and loading in the error state', () => {
      view = mountView(makeStore({ error: 'errors.network' }))
      expect(view.find(locators.results).exists()).toBe(false)
      expect(view.find(locators.loading).exists()).toBe(false)
    })

    it('renders a non-empty translated error message', () => {
      view = mountView(makeStore({ error: 'errors.network' }))
      expect(view.find(locators.errorMessage).text()).toBeTruthy()
    })

    it('calls store.retry when the retry button is clicked', async () => {
      const store = makeStore({ error: 'errors.network' })
      view = mountView(store)
      await view.find(locators.retryButton).trigger('click')
      expect(store.retry).toHaveBeenCalledOnce()
    })
  })

  describe('empty state', () => {
    it('shows the empty message when a query exists but yields no results', () => {
      view = mountView(makeStore({ hasQuery: true, query: 'batman', shows: [] }))
      expect(view.find(locators.empty).exists()).toBe(true)
    })

    it('includes the query term in the empty message', () => {
      view = mountView(makeStore({ hasQuery: true, query: 'batman', shows: [] }))
      expect(view.find(locators.emptyMessage).text()).toContain('batman')
    })

    it('hides the empty message when there is no query', () => {
      expect(view.find(locators.empty).exists()).toBe(false)
    })
  })

  describe('results', () => {
    it('renders one item per show returned by the store', () => {
      view = mountView(makeStore({ hasQuery: true, query: 'drama', shows: [generateShow(1), generateShow(2)] }))
      expect(view.findAll(locators.resultItem)).toHaveLength(2)
    })

    it('hides loading and error when results are present', () => {
      view = mountView(makeStore({ hasQuery: true, query: 'drama', shows: [generateShow(1)] }))
      expect(view.find(locators.loading).exists()).toBe(false)
      expect(view.find(locators.error).exists()).toBe(false)
    })
  })

  describe('heading', () => {
    it('shows the query in the heading when hasQuery is true', () => {
      view = mountView(makeStore({ hasQuery: true, query: 'breaking bad' }))
      expect(view.find(locators.heading).text()).toContain('breaking bad')
    })

    it('shows a non-empty placeholder heading when hasQuery is false', () => {
      expect(view.find(locators.heading).text()).toBeTruthy()
    })
  })

  interface MockStore {
    shows: ShowSummary[]
    loading: boolean
    error: string | null
    query: string
    hasQuery: boolean
    retry: ReturnType<typeof vi.fn>
  }

  function makeStore(overrides: Partial<MockStore> = {}): MockStore {
    return {
      shows: [],
      loading: false,
      error: null,
      query: '',
      hasQuery: false,
      retry: vi.fn<() => void>(),
      ...overrides,
    }
  }

  function mountView(store: MockStore): VueWrapper<InstanceType<typeof SearchView>> {
    mockUseSearchStore.mockReturnValue(store as unknown as ReturnType<typeof useSearchStore>)

    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', name: RouteNames.DASHBOARD, component: { template: '<div />' } },
        { path: '/search', name: RouteNames.SEARCH, component: SearchView },
        { path: '/details/:id', name: RouteNames.DETAILS, component: { template: '<div />' } },
      ],
    })

    return mount(SearchView, {
      global: {
        plugins: [router, i18n],
        stubs: { ShowCard: { template: '<div data-testid="show-card-stub" />' } },
      },
    })
  }

  function generateShow(id: number): ShowSummary {
    return {
      id,
      name: `Show ${id}`,
      genres: [],
      rating: 7.0,
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
