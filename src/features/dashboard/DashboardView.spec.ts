import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'

import { i18n } from '@/shared/i18n'
import DashboardView from './DashboardView.vue'
import { RouteNames } from '@/shared/constants/route-names'
import type { ShowSummary } from '@/shared/types/show'
import { useShowsStore } from './stores/shows.store'

vi.mock('./stores/shows.store', () => ({
  useShowsStore: vi.fn(),
}))

describe('DashboardView', () => {
  const locators = {
    title: '[data-testid="dashboard-title"]',
    loading: '[data-testid="dashboard-loading"]',
    error: '[data-testid="dashboard-error"]',
    errorMessage: '[data-testid="error-state-message"]',
    retry: '[data-testid="retry-button"]',
    empty: '[data-testid="dashboard-empty"]',
    genres: '[data-testid="dashboard-genres"]',
    genreSection: '[data-testid="genre-section"]',
    loadMore: '[data-testid="dashboard-load-more"]',
    loadingMore: '[data-testid="dashboard-loading-more"]',
  } as const

  const mockUseShowsStore = vi.mocked(useShowsStore)
  let view: VueWrapper<InstanceType<typeof DashboardView>>

  beforeEach(() => {
    view = mountView(makeStore())
  })

  it('displays the dashboard title', () => {
    expect(view.find(locators.title).text()).toBeTruthy()
  })

  it('calls fetchShows once when the view mounts', () => {
    const store = makeStore()
    mountView(store)
    expect(store.fetchShows).toHaveBeenCalledOnce()
  })

  it('shows the loading indicator when fetching the initial batch', () => {
    view = mountView(makeStore({ loading: true }))

    expect(view.find(locators.loading).exists()).toBe(true)
    expect(view.find(locators.genres).exists()).toBe(false)
  })

  it('does not show loading indicator when genres are already rendered', () => {
    view = mountView(
      makeStore({
        loading: true,
        genres: ['Drama'],
        showsByGenre: new Map([['Drama', [makeShow(1)]]]),
      }),
    )

    expect(view.find(locators.loading).exists()).toBe(false)
    expect(view.find(locators.genres).exists()).toBe(true)
  })

  it('shows the error block when there is an error and no genres', () => {
    view = mountView(makeStore({ error: 'errors.network' }))

    expect(view.find(locators.error).exists()).toBe(true)
    expect(view.find(locators.loading).exists()).toBe(false)
  })

  it('displays the translated error message', () => {
    view = mountView(makeStore({ error: 'errors.network' }))

    expect(view.find(locators.errorMessage).text()).toBeTruthy()
  })

  it('calls fetchShows again when the retry button is clicked', async () => {
    const store = makeStore({ error: 'errors.network' })
    view = mountView(store)

    await view.find(locators.retry).trigger('click')

    expect(store.fetchShows).toHaveBeenCalledTimes(2)
  })

  it('shows the empty state when not loading, no error, and no genres', () => {
    expect(view.find(locators.empty).exists()).toBe(true)
    expect(view.find(locators.loading).exists()).toBe(false)
    expect(view.find(locators.error).exists()).toBe(false)
    expect(view.find(locators.genres).exists()).toBe(false)
  })

  it('renders a GenreSection for each genre', () => {
    view = mountView(
      makeStore({
        genres: ['Comedy', 'Drama'],
        showsByGenre: new Map([
          ['Comedy', [makeShow(1)]],
          ['Drama', [makeShow(2)]],
        ]),
      }),
    )

    expect(view.findAll(locators.genreSection)).toHaveLength(2)
  })

  it('hides the empty state when genres are present', () => {
    view = mountView(
      makeStore({
        genres: ['Drama'],
        showsByGenre: new Map([['Drama', [makeShow(1)]]]),
      }),
    )

    expect(view.find(locators.empty).exists()).toBe(false)
    expect(view.find(locators.genres).exists()).toBe(true)
  })

  it('shows the load-more button when hasMore is true and genres are loaded', () => {
    view = mountView(
      makeStore({
        genres: ['Drama'],
        showsByGenre: new Map([['Drama', [makeShow(1)]]]),
        hasMore: true,
      }),
    )

    expect(view.find(locators.loadMore).exists()).toBe(true)
    expect(view.find(locators.loadingMore).exists()).toBe(false)
  })

  it('calls fetchMoreShows when the load-more button is clicked', async () => {
    const store = makeStore({
      genres: ['Drama'],
      showsByGenre: new Map([['Drama', [makeShow(1)]]]),
      hasMore: true,
    })
    view = mountView(store)

    await view.find(locators.loadMore).trigger('click')

    expect(store.fetchMoreShows).toHaveBeenCalledOnce()
  })

  it('replaces the load-more button with a loading indicator while fetching more', () => {
    view = mountView(
      makeStore({
        loading: true,
        genres: ['Drama'],
        showsByGenre: new Map([['Drama', [makeShow(1)]]]),
        hasMore: true,
      }),
    )

    expect(view.find(locators.loadingMore).exists()).toBe(true)
    expect(view.find(locators.loadMore).exists()).toBe(false)
  })

  it('hides the load-more footer entirely when all pages are loaded', () => {
    view = mountView(
      makeStore({
        genres: ['Drama'],
        showsByGenre: new Map([['Drama', [makeShow(1)]]]),
        hasMore: false,
      }),
    )

    expect(view.find(locators.loadMore).exists()).toBe(false)
    expect(view.find(locators.loadingMore).exists()).toBe(false)
  })

  interface MockStore {
    loading: boolean
    error: string | null
    genres: string[]
    showsByGenre: Map<string, ShowSummary[]>
    hasMore: boolean
    fetchShows: ReturnType<typeof vi.fn>
    fetchMoreShows: ReturnType<typeof vi.fn>
  }

  function makeStore(overrides: Partial<MockStore> = {}): MockStore {
    return {
      loading: false,
      error: null,
      genres: [],
      showsByGenre: new Map(),
      hasMore: false,
      fetchShows: vi.fn(),
      fetchMoreShows: vi.fn(),
      ...overrides,
    }
  }

  function makeShow(id: number): ShowSummary {
    return {
      id,
      name: `Show ${id}`,
      genres: ['Drama'],
      rating: 8.0,
      summaryHtml: '',
      summaryText: '',
      image: null,
      premieredYear: 2020,
      status: 'running',
      language: 'English',
      network: 'HBO',
    }
  }

  function mountView(store: MockStore): VueWrapper<InstanceType<typeof DashboardView>> {
    mockUseShowsStore.mockReturnValue(store as unknown as ReturnType<typeof useShowsStore>)

    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', name: RouteNames.DASHBOARD, component: { template: '<div />' } },
        { path: '/details/:id', name: RouteNames.DETAILS, component: { template: '<div />' } },
      ],
    })

    return mount(DashboardView, {
      global: { plugins: [router, i18n] },
    })
  }
})
